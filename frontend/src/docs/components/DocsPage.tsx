import type { ReactNode } from 'react';

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

export function DocCard({ title, kicker, children }: DocCardProps) {
  return (
    <section className="ecs-docs-card">
      {kicker ? <div className="ecs-docs-card-kicker">{kicker}</div> : null}
      <h2 className="ecs-docs-card-title">{title}</h2>
      <div className="ecs-docs-card-body">{children}</div>
    </section>
  );
}

export function Callout({
  title,
  tone = 'info',
  children,
}: CalloutProps) {
  return (
    <aside className={`ecs-docs-callout ecs-docs-callout--${tone}`}>
      <strong>{title}</strong>
      <div>{children}</div>
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
