import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendDir, '..');

const docsDir = path.join(frontendDir, 'src', 'docs');
const backendAppFile = path.join(repoRoot, 'backend', 'src', 'app.ts');
const backendRoutesDir = path.join(repoRoot, 'backend', 'src', 'routes');
const permissionsFile = path.join(repoRoot, 'backend', 'src', 'middleware', 'authorize.ts');
const configFile = path.join(repoRoot, 'backend', 'src', 'config.ts');
const transitionsFile = path.join(repoRoot, 'backend', 'src', 'domain', 'event-machine.ts');
const docsDataFile = path.join(docsDir, 'content', 'docs-data.js');
const bannedAudienceTerms = [
  {
    pattern: /\bkundenseitig\w*\b/gi,
    message: 'Use "extern" instead of customer-facing calendar terminology.',
  },
  {
    pattern: /\bKundenkalender\b/gi,
    message: 'Remove "Kundenkalender" wording. ECS tracks external-event participation, not customer calendars.',
  },
  {
    pattern: /\bStand vorbereiten\b/gi,
    message: 'Remove exhibitor language such as "Stand vorbereiten".',
  },
  {
    pattern: /\bDas Event durchführen\b/gi,
    message: 'Describe attending and following up on an external event instead of running it.',
  },
  {
    pattern: /\boperativ geplant\b/gi,
    message: 'Describe approved events as prepared for participation, not operationally run.',
  },
  {
    pattern: /\bMessebesuchen\b/gi,
    message: 'Use broader external-event participation language instead of "Messebesuchen".',
  },
];

async function main() {
  const failures = [];
  const docsData = await import(pathToFileURL(docsDataFile).href);

  const docPages = await getDocPages();
  const docSummary = await auditDocPages(docPages, failures);
  const terminologySummary = await auditAudienceTerminology(docPages, failures);
  const routeSummary = await auditRoutes(docsData, failures);
  const permissionSummary = await auditPermissions(docsData, failures);
  const configSummary = await auditConfig(docsData, failures);
  const transitionSummary = await auditTransitions(docsData, failures);

  if (failures.length > 0) {
    console.error('Documentation audit failed:\n');
    failures.forEach((failure, index) => {
      console.error(`${index + 1}. ${failure}`);
    });
    process.exit(1);
  }

  console.log(
    [
      `Documentation audit passed.`,
      `Pages: ${docSummary.pageCount}`,
      `Terminology checks: ${terminologySummary.checkCount}`,
      `Routes: ${routeSummary.routeCount}`,
      `Permissions: ${permissionSummary.permissionCount}`,
      `Env vars: ${configSummary.variableCount}`,
      `Transitions: ${transitionSummary.transitionCount}`,
    ].join(' '),
  );
}

async function getDocPages() {
  const entries = await fs.readdir(docsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) => path.join(docsDir, entry.name))
    .sort();
}

async function auditDocPages(files, failures) {
  if (files.length === 0) {
    failures.push('No MDX documentation pages were found in frontend/src/docs.');
    return { pageCount: 0 };
  }

  const seenMetaTitles = new Map();

  for (const file of files) {
    const content = await read(file);
    const label = path.relative(frontendDir, file);

    const metaMatch = content.match(/<Meta\b[^>]*\btitle="([^"]+)"[^>]*\/>/);
    if (!metaMatch) {
      failures.push(`${label} is missing a <Meta title="..."/> declaration.`);
      continue;
    }

    const metaTitle = metaMatch[1];
    if (!metaTitle.includes('/')) {
      failures.push(`${label} has a malformed Meta title "${metaTitle}". Use "Section/Page".`);
    }

    const existing = seenMetaTitles.get(metaTitle);
    if (existing) {
      failures.push(
        `${label} duplicates the Meta title "${metaTitle}" already used in ${existing}.`,
      );
    } else {
      seenMetaTitles.set(metaTitle, label);
    }

    if (!content.includes('<DocsPage')) {
      failures.push(`${label} is missing the shared <DocsPage> layout wrapper.`);
    }
  }

  return { pageCount: files.length };
}

async function auditAudienceTerminology(files, failures) {
  let checkCount = 0;

  for (const file of files) {
    const content = await read(file);
    const label = path.relative(frontendDir, file);

    for (const { pattern, message } of bannedAudienceTerms) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        failures.push(`${label}: ${message}`);
      }
      checkCount += 1;
    }
  }

  const docsDataContent = await read(docsDataFile);
  const docsDataLabel = path.relative(frontendDir, docsDataFile);

  for (const { pattern, message } of bannedAudienceTerms) {
    pattern.lastIndex = 0;
    if (pattern.test(docsDataContent)) {
      failures.push(`${docsDataLabel}: ${message}`);
    }
    checkCount += 1;
  }

  return { checkCount };
}

async function auditRoutes(docsData, failures) {
  const actualRoutes = new Set();
  const documentedRoutes = new Set();

  const appContent = await read(backendAppFile);
  if (/\bapp\.get\(\s*['"]\/health['"]/.test(appContent)) {
    actualRoutes.add('GET /health');
  }

  const routeFiles = (await fs.readdir(backendRoutesDir))
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .sort();

  for (const file of routeFiles) {
    const content = await read(path.join(backendRoutesDir, file));
    const matches = content.matchAll(/\bapp\.(get|post|patch|delete)\(\s*['"]([^'"]+)['"]/g);

    for (const match of matches) {
      const method = match[1].toUpperCase();
      const routePath = `/api/v1${match[2]}`;
      actualRoutes.add(`${method} ${routePath}`);
    }
  }

  const documentedRouteRows = [
    ...docsData.backendStandaloneRoutes,
    ...docsData.backendRouteSections.flatMap((section) => section.rows),
  ];
  for (const row of documentedRouteRows) {
    documentedRoutes.add(`${row.method} ${row.path}`);
  }

  reportMissingAndExtra(
    {
      actual: actualRoutes,
      documented: documentedRoutes,
      missingTemplate: (value) => `BackendApiSurface.mdx is missing route documentation for "${value}".`,
      extraTemplate: (value) => `BackendApiSurface.mdx documents "${value}", but no matching backend route exists.`,
    },
    failures,
  );

  return { routeCount: actualRoutes.size };
}

async function auditPermissions(docsData, failures) {
  const content = await read(permissionsFile);
  const actualPermissions = new Set(
    [...content.matchAll(/^\s*'([^']+)':\s*\[/gm)].map((match) => match[1]),
  );

  const documentedPermissions = new Set(
    docsData.backendPermissionRows.map((row) => row.permission),
  );

  reportMissingAndExtra(
    {
      actual: actualPermissions,
      documented: documentedPermissions,
      missingTemplate: (value) =>
        `BackendRolesAndPermissions.mdx is missing permission "${value}".`,
      extraTemplate: (value) =>
        `BackendRolesAndPermissions.mdx documents "${value}", but it is not in authorize.ts.`,
    },
    failures,
  );

  return { permissionCount: actualPermissions.size };
}

async function auditConfig(docsData, failures) {
  const content = await read(configFile);
  const actualVariables = new Set([
    ...[...content.matchAll(/required\('([A-Z0-9_]+)'\)/g)].map((match) => match[1]),
    ...[...content.matchAll(/optional\('([A-Z0-9_]+)'/g)].map((match) => match[1]),
  ]);

  const documentedVariables = new Set(
    docsData.backendEnvVarRows.map((row) => row.variable),
  );

  reportMissingAndExtra(
    {
      actual: actualVariables,
      documented: documentedVariables,
      missingTemplate: (value) => `BackendOverview.mdx is missing env var "${value}".`,
      extraTemplate: (value) =>
        `BackendOverview.mdx documents "${value}", but it is not declared in backend config.`,
    },
    failures,
  );

  return { variableCount: actualVariables.size };
}

async function auditTransitions(docsData, failures) {
  const content = await read(transitionsFile);
  const actualTransitions = new Set(
    [...content.matchAll(/\{\s*from:\s*'([^']+)'\s*,\s*to:\s*'([^']+)'\s*,/g)].map(
      (match) => `${match[1]} -> ${match[2]}`,
    ),
  );

  const documentedTransitions = new Set(
    docsData.backendTransitionRows.map((row) => `${row.from} -> ${row.to}`),
  );

  reportMissingAndExtra(
    {
      actual: actualTransitions,
      documented: documentedTransitions,
      missingTemplate: (value) =>
        `BackendApiSurface.mdx is missing event transition "${value}".`,
      extraTemplate: (value) =>
        `BackendApiSurface.mdx documents transition "${value}", but it is not in event-machine.ts.`,
    },
    failures,
  );

  return { transitionCount: actualTransitions.size };
}

function reportMissingAndExtra(config, failures) {
  const actual = [...config.actual].sort();
  const documented = [...config.documented].sort();

  for (const value of actual) {
    if (!config.documented.has(value)) {
      failures.push(config.missingTemplate(value));
    }
  }

  for (const value of documented) {
    if (!config.actual.has(value)) {
      failures.push(config.extraTemplate(value));
    }
  }
}

async function read(file) {
  return fs.readFile(file, 'utf8');
}

main().catch((error) => {
  console.error('Documentation audit crashed.');
  console.error(error);
  process.exit(1);
});
