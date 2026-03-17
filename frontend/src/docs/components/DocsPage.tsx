import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type ReactNode,
} from 'react';

type GridColumns = 'two' | 'three';
type CalloutTone = 'info' | 'success' | 'warning';
type PillTone = 'neutral' | 'accent' | 'success';

interface DocsPageProps {
  section: string;
  title: string;
  summary: string;
  status?: string;
  children: ReactNode;
}

interface DocGridProps {
  children: ReactNode;
  columns?: GridColumns;
}

interface DocCardProps {
  title: string;
  kicker?: string;
  href?: string;
  target?: string;
  children: ReactNode;
}

interface CalloutProps {
  title: string;
  tone?: CalloutTone;
  children: ReactNode;
}

interface PillProps {
  children: ReactNode;
  tone?: PillTone;
}

interface DocTableProps {
  columns: string[];
  rows: ReactNode[][];
}

interface CodeListProps {
  items: string[];
}

export function DocsPage({
  section,
  title,
  summary,
  status,
  children,
}: DocsPageProps) {
  return (
    <div className="ecs-docs-page">
      <div className="ecs-docs-hero">
        <div className="ecs-docs-eyebrow">{section}</div>
        <div className="ecs-docs-title-row">
          <h1 className="ecs-docs-title">{title}</h1>
          {status ? <Pill tone="accent">{status}</Pill> : null}
        </div>
        <p className="ecs-docs-summary">{summary}</p>
      </div>
      <div className="ecs-docs-body">{children}</div>
    </div>
  );
}

export function DocGrid({ children, columns = 'two' }: DocGridProps) {
  return (
    <div className={`ecs-docs-grid ecs-docs-grid--${columns}`}>{children}</div>
  );
}

export function DocCard({ title, kicker, href, target, children }: DocCardProps) {
  const normalizedChildren = normalizeBlocks(children);
  const content = (
    <>
      {kicker ? <div className="ecs-docs-card-kicker">{kicker}</div> : null}
      <h2 className="ecs-docs-card-title">{title}</h2>
      <div className="ecs-docs-card-body">{normalizedChildren}</div>
    </>
  );

  if (href) {
    return (
      <a
        className="ecs-docs-card ecs-docs-card--link"
        href={href}
        target={target}
        rel={target === '_blank' ? 'noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return <section className="ecs-docs-card">{content}</section>;
}

export function Callout({
  title,
  tone = 'info',
  children,
}: CalloutProps) {
  const normalizedChildren = normalizeBlocks(children);
  return (
    <aside className={`ecs-docs-callout ecs-docs-callout--${tone}`}>
      <strong>{title}</strong>
      <div>{normalizedChildren}</div>
    </aside>
  );
}

export function Pill({ children, tone = 'neutral' }: PillProps) {
  return (
    <span className={`ecs-docs-pill ecs-docs-pill--${tone}`}>{children}</span>
  );
}

export function CodeList({ items }: CodeListProps) {
  return (
    <span className="ecs-docs-code-list">
      {items.map((item) => (
        <code key={item}>{item}</code>
      ))}
    </span>
  );
}

export function DocTable({ columns, rows }: DocTableProps) {
  return (
    <div className="ecs-docs-table-wrap">
      <table className="ecs-docs-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} data-label={columns[cellIndex]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeBlocks(node: ReactNode): ReactNode {
  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={index}>{normalizeBlocks(child)}</Fragment>
    ));
  }

  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return node;
  }

  const normalizedChildren = Children.toArray(node.props.children).map((child) =>
    normalizeBlocks(child),
  );

  if (node.type === 'p' && normalizedChildren.length === 1) {
    const [onlyChild] = normalizedChildren;
    if (isValidElement(onlyChild) && onlyChild.type === 'p') {
      return onlyChild;
    }
  }

  return cloneElement(node, undefined, ...normalizedChildren);
}
