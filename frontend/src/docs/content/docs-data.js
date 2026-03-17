export const productUserRows = [
  {
    role: 'Marketing / Recherche',
    responsibility: 'Relevante externe Messen und Branchenevents identifizieren',
    actions:
      'Events anlegen, Informationen anreichern und neue Einträge in die interne Prüfung geben',
  },
  {
    role: 'Mitarbeitende',
    responsibility: 'Teilnahme beantragen und zugewiesene Arbeit erledigen',
    actions:
      'Events ansehen, Teilnahme begründen, Aufgaben abschließen und Nachberichte liefern',
  },
  {
    role: 'Manager',
    responsibility: 'Teilnahmen entscheiden und Einsatzbereitschaft überwachen',
    actions:
      'Anträge prüfen, genehmigen oder ablehnen und offene Aufgaben im Blick behalten',
  },
  {
    role: 'Event-Admin',
    responsibility: 'System und Koordinationsregeln betreiben',
    actions:
      'Events, Vorlagen, Erinnerungen, Kalenderbezüge, Kommunikationslogik und Rechte pflegen',
  },
  {
    role: 'Agent',
    responsibility: 'Fehlende Schritte und Lücken vorschlagen',
    actions:
      'Analysen starten, Vorschläge erzeugen und Annahme oder Verwerfen durch Menschen unterstützen',
  },
];

export const productObjectRows = [
  {
    object: 'Event',
    meaning: 'Zentrales Objekt für ein externes Event, an dem die Beratungsfirma teilnehmen will',
  },
  {
    object: 'Teilnahme',
    meaning: 'Bewerbung, Entscheidung und Anwesenheitsstatus einer Person',
  },
  {
    object: 'Aufgabe',
    meaning: 'Konkreter Vorbereitungs-, Teilnahme- oder Nachbearbeitungsschritt',
  },
  {
    object: 'Checklisten-Vorlage',
    meaning: 'Wiederverwendbare Vorbereitungsvorlage, aus der Aufgaben entstehen können',
  },
  {
    object: 'Erinnerung',
    meaning: 'Zeit- oder bedingungsbasierter Hinweis für ein Event oder eine Aufgabe',
  },
  {
    object: 'Kommunikation',
    meaning: 'Interne Abstimmung oder externe Kontaktkommunikation mit Bezug zu einem Event',
  },
  {
    object: 'Kalendereintrag',
    meaning: 'Interne oder externe Kalenderabbildung einer geplanten Teilnahme',
  },
];

export const productLifecycleRows = [
  {
    stage: 'draft',
    meaning: 'Das Event ist intern angelegt, aber noch nicht reif für die Freigabe.',
    owner: 'Marketing oder Event-Admin',
  },
  {
    stage: 'proposed',
    meaning: 'Das Event wartet auf Prüfung und Freigabe.',
    owner: 'Mitarbeitende, Marketing oder Manager',
  },
  {
    stage: 'approved',
    meaning: 'Die Teilnahme ist intern freigegeben und kann für die tatsächliche Anwesenheit vorbereitet werden.',
    owner: 'Manager oder Event-Admin',
  },
  {
    stage: 'planned',
    meaning: 'Reise, Registrierung, Gesprächstermine und interne Aufgaben zur Teilnahme sind aktiv in Arbeit.',
    owner: 'Event-Admin oder koordinierende Fachseite',
  },
  {
    stage: 'executed',
    meaning: 'Die Teilnahme am Event hat stattgefunden und Nachbereitung, Bericht oder Lead-Transfer laufen noch.',
    owner: 'Event-Admin oder Teilnehmende',
  },
  {
    stage: 'cancelled',
    meaning: 'Das Event wurde bewusst gestoppt.',
    owner: 'Abhängig vom bisherigen Status',
  },
];

export const backendDomainRows = [
  {
    area: 'Authentifizierung',
    prefix: '/auth/*',
    responsibility:
      'Registrierung, Login, Token-Aktualisierung, Logout und aktuelles Nutzerprofil',
  },
  {
    area: 'Events',
    prefix: '/events',
    responsibility: 'Event-Intake, Vorschläge, Pflege, Filterung, Paginierung und Statuswechsel',
  },
  {
    area: 'Teilnahmen',
    prefix: '/events/:eventId/participations',
    responsibility: 'Bewerben, Entscheiden und Zurückziehen',
  },
  {
    area: 'Aufgaben',
    prefix: '/events/:eventId/tasks und /users/me/tasks',
    responsibility: 'Aufgaben pflegen und Vorlagen auf ein Event anwenden',
  },
  {
    area: 'Checklisten-Vorlagen',
    prefix: '/checklist-templates',
    responsibility: 'Vorlagen und Vorlagenpositionen verwalten',
  },
  {
    area: 'Erinnerungen',
    prefix: '/events/:eventId/reminders',
    responsibility: 'Erinnerungen anlegen, aktualisieren und verfolgen',
  },
  {
    area: 'Kalendereinträge',
    prefix: '/events/:eventId/calendar-entries',
    responsibility: 'Interne und externe Kalenderabbildung der Teilnahme pflegen',
  },
  {
    area: 'Kommunikation',
    prefix: '/events/:eventId/communications',
    responsibility: 'Interne Abstimmung oder externe Event-Kommunikation dokumentieren oder versenden',
  },
  {
    area: 'Agentische Vorschläge',
    prefix: '/events/:eventId/suggestions',
    responsibility: 'Teilnahme analysieren, KI-Vorschläge für Lücken erzeugen und auflösen',
  },
  {
    area: 'Benutzerverwaltung',
    prefix: '/users',
    responsibility: 'Benutzer anlegen, pflegen, Rollen setzen und Passwörter administrativ zurücksetzen',
  },
];

export const infrastructureDecisionRows = [
  {
    dimension: 'Cloud',
    value: 'Hetzner Cloud',
    rationale:
      'Pragmatische Baseline mit nativen Integrationen für Load Balancer, Volumes und günstigen Single-Node-Betrieb.',
  },
  {
    dimension: 'Region / Location',
    value: 'ash',
    rationale:
      'Aktueller Terraform-Default und live ausgerollter Standort; in den Terraform-Locals auf die Network Zone us-east gemappt.',
  },
  {
    dimension: 'VM-Typ',
    value: 'cpx21',
    rationale:
      'Gewählte Compute-Baseline für den aktuellen Single-Node-Demo-Cluster mit Backend, Frontend, PostgreSQL und Redis auf einem Host.',
  },
  {
    dimension: 'Basis-Image',
    value: 'ubuntu-24.04',
    rationale: 'LTS-Basis für den k3s-Host.',
  },
  {
    dimension: 'Orchestrierung',
    value: 'k3s, channel stable',
    rationale: 'Kleiner Kubernetes-Footprint mit geringerem Betriebsaufwand als eine volle Upstream-Installation.',
  },
];

export const infrastructureNetworkRows = [
  {
    area: 'Privates Netzwerk',
    value: '10.20.0.0/16',
    purpose: 'Interner Hetzner-Netzbereich für Cluster-Kommunikation und private Load-Balancer-Ziele.',
  },
  {
    area: 'Privates Subnetz',
    value: '10.20.1.0/24',
    purpose: 'Cloud-Subnetz für den aktuellen Single-Node-Cluster.',
  },
  {
    area: 'Node Private IP',
    value: '10.20.1.10',
    purpose: 'Feste interne Adresse des k3s-Servers im Hetzner-Netz.',
  },
  {
    area: 'Öffentliches Netz',
    value: 'IPv4 und IPv6 aktiviert',
    purpose: 'Öffentliche Erreichbarkeit für SSH, Kubernetes API und Ingress.',
  },
  {
    area: 'Network Zone',
    value: 'us-east',
    purpose: 'Hetzner-Zone, die aus location=ash abgeleitet wird und für Netz-/LB-Kopplung relevant ist.',
  },
];

export const infrastructurePlatformRows = [
  {
    component: 'Ingress',
    selection: 'Traefik (k3s Standard)',
    note: 'Über ein Hetzner Load Balancer Service nach außen veröffentlicht.',
  },
  {
    component: 'Load Balancer',
    selection: 'Hetzner Cloud Load Balancer',
    note: 'Traefik läuft hinter dem nativen Hetzner-LB statt auf einer manuellen VM-Proxy-Schicht.',
  },
  {
    component: 'Storage',
    selection: 'Hetzner CSI, StorageClass hcloud-volumes',
    note: 'Persistenz für PostgreSQL und Redis über Hetzner-Volumes.',
  },
  {
    component: 'Cloud Integration',
    selection: 'Hetzner CCM + Hetzner CSI',
    note: 'Ermöglicht LB- und Volume-Provisionierung direkt aus Kubernetes.',
  },
  {
    component: 'TLS',
    selection: 'cert-manager + letsencrypt-prod',
    note: 'HTTPS via ACME HTTP-01 über Traefik.',
  },
  {
    component: 'Host',
    selection: '5.161.34.169.nip.io',
    note: 'Demo-Host auf Basis des aktuellen Load-Balancer-IPv4 ohne separate DNS-Zone.',
  },
];

export const infrastructureFirewallRows = [
  {
    rule: '22/tcp',
    source: 'ssh_allowed_cidrs',
    reason: 'SSH-Zugriff auf den Node.',
  },
  {
    rule: '80/tcp, 443/tcp',
    source: '0.0.0.0/0, ::/0',
    reason: 'Öffentliche HTTP/HTTPS-Erreichbarkeit für Traefik und ACME-Challenges.',
  },
  {
    rule: '6443/tcp',
    source: 'kube_api_allowed_cidrs',
    reason: 'Kubernetes API für Cluster-Administration und GitHub-hosted Deployments.',
  },
  {
    rule: '30000-32767/tcp',
    source: '10.20.0.0/16',
    reason: 'Interner NodePort-Traffic für den Hetzner Load Balancer.',
  },
];

export const backendDataModelRows = [
  {
    table: 'events',
    purpose: 'Kernobjekt für Event-Stammdaten und Lifecycle-Felder',
  },
  {
    table: 'participations',
    purpose: 'Wer sich beworben hat, wie entschieden wurde und wer teilnimmt',
  },
  {
    table: 'tasks',
    purpose: 'Sortierbare Aufgaben mit Fälligkeit, Status und Zuweisung',
  },
  {
    table: 'checklist_templates, checklist_template_items',
    purpose: 'Wiederverwendbare Vorlagen für Vorbereitungsarbeit',
  },
  {
    table: 'reminders',
    purpose: 'Zeit- oder bedingungsbasierte Erinnerungen für Events oder Aufgaben',
  },
  {
    table: 'communications',
    purpose: 'Interne Abstimmung oder externe Kontaktkommunikation zum Event',
  },
  {
    table: 'calendar_entries',
    purpose: 'Interne und externe Kalenderreferenzen für die Teilnahme an einem Event',
  },
  {
    table: 'audit_log',
    purpose: 'Nachvollziehbarkeit relevanter Aktionen und Änderungen',
  },
  {
    table: 'sessions',
    purpose: 'Refresh-Token-Sessions und deren Lebenszyklus',
  },
  {
    table: 'user_roles, teams, team_memberships',
    purpose: 'Rollenmodell, Teamstruktur und künftige Scopes',
  },
  {
    table: 'agent_suggestions',
    purpose: 'Gespeicherte KI-Vorschläge für fehlende Schritte oder Daten',
  },
];

export const backendEnvVarRows = [
  {
    variable: 'DATABASE_URL',
    required: 'Ja',
    purpose: 'Verbindungszeichenkette für PostgreSQL',
  },
  {
    variable: 'JWT_SECRET',
    required: 'Ja',
    purpose: 'Geheimnis für Access- und Refresh-Token',
  },
  {
    variable: 'PORT',
    required: 'Nein',
    purpose: 'HTTP-Port, Standard ist 3000',
  },
  {
    variable: 'HOST',
    required: 'Nein',
    purpose: 'Bind-Adresse, Standard ist 0.0.0.0',
  },
  {
    variable: 'NODE_ENV',
    required: 'Nein',
    purpose: 'Umgebungsflag, Standard ist development',
  },
  {
    variable: 'REDIS_URL',
    required: 'Nein',
    purpose: 'Redis-Verbindung für künftige Queue- oder Worker-Funktionen',
  },
  {
    variable: 'JWT_ACCESS_EXPIRES_IN',
    required: 'Nein',
    purpose: 'Lebensdauer des Access-Tokens in Sekunden, Standard ist 900',
  },
  {
    variable: 'JWT_REFRESH_EXPIRES_IN',
    required: 'Nein',
    purpose: 'Lebensdauer des Refresh-Tokens in Sekunden, Standard ist 604800',
  },
  {
    variable: 'ANTHROPIC_API_KEY',
    required: 'Nein',
    purpose: 'API-Schlüssel für die Generierung agentischer Vorschläge',
  },
];

export const backendStandaloneRoutes = [
  {
    method: 'GET',
    path: '/health',
    access: 'Öffentlich',
    summary: 'Gesundheitsstatus des Dienstes prüfen',
  },
];

export const backendRouteSections = [
  {
    title: 'Authentifizierung',
    rows: [
      {
        method: 'POST',
        path: '/api/v1/auth/register',
        access: 'Öffentlich',
        summary: 'Benutzer anlegen und Access-/Refresh-Token ausgeben',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        access: 'Öffentlich',
        summary: 'Benutzer anmelden und Token ausgeben',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/refresh',
        access: 'Öffentlich mit Refresh-Cookie',
        summary: 'Refresh-Token rotieren und neues Access-Token ausgeben',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/logout',
        access: 'Authentifiziert',
        summary: 'Aktuelle Session widerrufen und Cookie löschen',
      },
      {
        method: 'GET',
        path: '/api/v1/auth/me',
        access: 'Authentifiziert',
        summary: 'Aktuelles Nutzerprofil inklusive Rollen liefern',
      },
    ],
  },
  {
    title: 'Events',
    rows: [
      {
        method: 'GET',
        path: '/api/v1/events',
        access: 'event:read',
        summary:
          'Events mit optionalen Filtern für Status, Branche, Suche und Paging auflisten',
      },
      {
        method: 'GET',
        path: '/api/v1/events/:id',
        access: 'event:read',
        summary: 'Ein Event inklusive verfügbarer Statuswechsel für den Aufrufer liefern',
      },
      {
        method: 'POST',
        path: '/api/v1/events',
        access: 'event:create, event:propose',
        summary: 'Ein neues Event als interner Draft oder als Teilnahme-Vorschlag anlegen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/events/:id',
        access: 'event:update',
        summary: 'Bearbeitbare Event-Felder aktualisieren',
      },
      {
        method: 'DELETE',
        path: '/api/v1/events/:id',
        access: 'event:delete',
        summary: 'Ein Event löschen',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:id/transition',
        access: 'event:transition',
        summary: 'Lifecycle-Status über die Event-State-Machine ändern',
      },
    ],
  },
  {
    title: 'Teilnahmen',
    rows: [
      {
        method: 'GET',
        path: '/api/v1/events/:eventId/participations',
        access: 'participation:read',
        summary: 'Teilnahmen zu einem Event auflisten',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:eventId/participations',
        access: 'participation:apply',
        summary: 'Sich für ein Event bewerben',
      },
      {
        method: 'PATCH',
        path: '/api/v1/events/:eventId/participations/:pid',
        access: 'participation:decide',
        summary: 'Eine Bewerbung genehmigen oder ablehnen',
      },
      {
        method: 'DELETE',
        path: '/api/v1/events/:eventId/participations/:pid',
        access: 'Authentifiziert und Eigentum der Bewerbung',
        summary: 'Eigene Bewerbung zurückziehen',
      },
    ],
  },
  {
    title: 'Aufgaben und Checklisten',
    rows: [
      {
        method: 'GET',
        path: '/api/v1/events/:eventId/tasks',
        access: 'task:read',
        summary: 'Aufgaben eines Events auflisten',
      },
      {
        method: 'GET',
        path: '/api/v1/users/me/tasks',
        access: 'Authentifiziert',
        summary: 'Eigene zugewiesene Aufgaben über alle Events hinweg auflisten',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:eventId/tasks',
        access: 'task:create',
        summary: 'Eine Aufgabe für ein Event anlegen',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:eventId/tasks/from-template',
        access: 'task:create',
        summary: 'Aufgaben aus einer Checklisten-Vorlage erzeugen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/events/:eventId/tasks/:tid',
        access: 'task:complete',
        summary: 'Aufgabendaten inklusive Status aktualisieren',
      },
      {
        method: 'DELETE',
        path: '/api/v1/events/:eventId/tasks/:tid',
        access: 'task:create',
        summary: 'Eine Aufgabe löschen',
      },
      {
        method: 'GET',
        path: '/api/v1/checklist-templates',
        access: 'Authentifiziert',
        summary: 'Alle Checklisten-Vorlagen auflisten',
      },
      {
        method: 'GET',
        path: '/api/v1/checklist-templates/:id',
        access: 'Authentifiziert',
        summary: 'Eine einzelne Checklisten-Vorlage laden',
      },
      {
        method: 'POST',
        path: '/api/v1/checklist-templates',
        access: 'template:manage',
        summary: 'Eine Vorlage anlegen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/checklist-templates/:id',
        access: 'template:manage',
        summary: 'Eine Vorlage aktualisieren',
      },
      {
        method: 'DELETE',
        path: '/api/v1/checklist-templates/:id',
        access: 'template:manage',
        summary: 'Eine Vorlage löschen',
      },
      {
        method: 'GET',
        path: '/api/v1/checklist-templates/:id/items',
        access: 'Authentifiziert',
        summary: 'Vorlagenpositionen auflisten',
      },
      {
        method: 'POST',
        path: '/api/v1/checklist-templates/:id/items',
        access: 'template:manage',
        summary: 'Eine Vorlagenposition anlegen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/checklist-templates/:id/items/:iid',
        access: 'template:manage',
        summary: 'Eine Vorlagenposition aktualisieren',
      },
      {
        method: 'DELETE',
        path: '/api/v1/checklist-templates/:id/items/:iid',
        access: 'template:manage',
        summary: 'Eine Vorlagenposition löschen',
      },
    ],
  },
  {
    title: 'Erinnerungen, Kalender und Kommunikation',
    rows: [
      {
        method: 'GET',
        path: '/api/v1/events/:eventId/reminders',
        access: 'reminder:read',
        summary: 'Erinnerungen eines Events auflisten',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:eventId/reminders',
        access: 'reminder:manage',
        summary: 'Eine Erinnerung anlegen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/events/:eventId/reminders/:rid',
        access: 'reminder:manage',
        summary: 'Eine Erinnerung aktualisieren',
      },
      {
        method: 'DELETE',
        path: '/api/v1/events/:eventId/reminders/:rid',
        access: 'reminder:manage',
        summary: 'Eine Erinnerung löschen',
      },
      {
        method: 'GET',
        path: '/api/v1/events/:eventId/calendar-entries',
        access: 'calendar:read',
        summary: 'Kalendereinträge eines Events auflisten',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:eventId/calendar-entries',
        access: 'calendar:manage',
        summary: 'Internen oder externen Kalendereintrag anlegen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/events/:eventId/calendar-entries/:cid',
        access: 'calendar:manage',
        summary: 'Kalendereintrag aktualisieren',
      },
      {
        method: 'DELETE',
        path: '/api/v1/events/:eventId/calendar-entries/:cid',
        access: 'calendar:manage',
        summary: 'Kalendereintrag löschen',
      },
      {
        method: 'GET',
        path: '/api/v1/events/:eventId/communications',
        access: 'communication:read',
        summary: 'Kommunikationshistorie eines Events auflisten',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:eventId/communications',
        access: 'communication:send',
        summary: 'Kommunikationseintrag anlegen oder versenden',
      },
    ],
  },
  {
    title: 'Agentische Vorschläge',
    rows: [
      {
        method: 'GET',
        path: '/api/v1/events/:eventId/suggestions',
        access: 'agent:suggestions',
        summary: 'Gespeicherte KI-Vorschläge für ein Event auflisten',
      },
      {
        method: 'POST',
        path: '/api/v1/events/:eventId/suggestions/generate',
        access: 'agent:suggestions',
        summary: 'Eine Event-Analyse starten und neue Vorschläge erzeugen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/events/:eventId/suggestions/:sid',
        access: 'agent:suggestions',
        summary: 'Einen Vorschlag akzeptieren oder verwerfen',
      },
    ],
  },
  {
    title: 'Benutzerverwaltung',
    rows: [
      {
        method: 'GET',
        path: '/api/v1/users',
        access: 'user:manage',
        summary: 'Benutzerliste optional nach Suchbegriff filtern und ausgeben',
      },
      {
        method: 'POST',
        path: '/api/v1/users',
        access: 'user:manage',
        summary: 'Einen Benutzer inklusive Startrollen anlegen',
      },
      {
        method: 'PATCH',
        path: '/api/v1/users/:id',
        access: 'user:manage',
        summary: 'Anzeigename oder Aktivstatus eines Benutzers aktualisieren',
      },
      {
        method: 'PUT',
        path: '/api/v1/users/:id/roles',
        access: 'user:manage',
        summary: 'Rollen eines Benutzers vollständig neu setzen',
      },
      {
        method: 'POST',
        path: '/api/v1/users/:id/reset-password',
        access: 'user:manage',
        summary: 'Passwort eines Benutzers administrativ zurücksetzen',
      },
    ],
  },
];

export const backendPermissionRows = [
  { permission: 'event:create', roles: ['marketing', 'event_admin'] },
  { permission: 'event:propose', roles: ['employee', 'manager', 'marketing', 'event_admin'] },
  { permission: 'event:read', roles: ['employee', 'manager', 'event_admin', 'marketing'] },
  { permission: 'event:update', roles: ['event_admin', 'marketing'] },
  { permission: 'event:delete', roles: ['event_admin'] },
  { permission: 'event:transition', roles: ['event_admin', 'manager'] },
  { permission: 'participation:apply', roles: ['employee', 'manager'] },
  { permission: 'participation:decide', roles: ['manager', 'event_admin'] },
  { permission: 'participation:read', roles: ['employee', 'manager', 'event_admin'] },
  { permission: 'task:create', roles: ['event_admin', 'manager'] },
  { permission: 'task:assign', roles: ['event_admin', 'manager'] },
  { permission: 'task:complete', roles: ['employee', 'manager', 'event_admin'] },
  { permission: 'task:read', roles: ['employee', 'manager', 'event_admin'] },
  { permission: 'template:manage', roles: ['event_admin'] },
  { permission: 'reminder:manage', roles: ['event_admin', 'manager'] },
  { permission: 'reminder:read', roles: ['employee', 'manager', 'event_admin'] },
  { permission: 'calendar:manage', roles: ['event_admin', 'manager'] },
  { permission: 'calendar:read', roles: ['employee', 'manager', 'event_admin'] },
  { permission: 'communication:send', roles: ['event_admin', 'manager'] },
  { permission: 'communication:read', roles: ['employee', 'manager', 'event_admin'] },
  { permission: 'audit:read', roles: ['event_admin'] },
  { permission: 'agent:suggestions', roles: ['event_admin', 'manager'] },
  { permission: 'user:manage', roles: ['event_admin'] },
  { permission: 'team:manage', roles: ['event_admin'] },
];

export const backendTransitionRows = [
  { from: 'draft', to: 'proposed', roles: ['employee', 'marketing', 'event_admin'] },
  { from: 'proposed', to: 'approved', roles: ['event_admin', 'manager'] },
  { from: 'approved', to: 'planned', roles: ['event_admin'] },
  { from: 'planned', to: 'executed', roles: ['event_admin'] },
  { from: 'draft', to: 'cancelled', roles: ['event_admin', 'marketing'] },
  { from: 'proposed', to: 'cancelled', roles: ['event_admin', 'manager'] },
  { from: 'approved', to: 'cancelled', roles: ['event_admin'] },
  { from: 'planned', to: 'cancelled', roles: ['event_admin'] },
];
