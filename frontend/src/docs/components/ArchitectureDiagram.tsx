import type { ReactNode } from 'react';

interface C4DiagramProps {
  level: string;
  title: string;
  summary: string;
  children: ReactNode;
}

interface C4BoundaryProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

interface C4NodeProps {
  kind: string;
  title: string;
  description: string;
}

interface C4RowProps {
  children: ReactNode;
}

interface C4ArrowProps {
  label?: string;
}

export function C4Diagram({ level, title, summary, children }: C4DiagramProps) {
  return (
    <section className="ecs-c4-diagram">
      <div className="ecs-c4-diagram-head">
        <span className="ecs-c4-diagram-level">{level}</span>
        <h3 className="ecs-c4-diagram-title">{title}</h3>
        <p className="ecs-c4-diagram-summary">{summary}</p>
      </div>
      <div className="ecs-c4-diagram-body">{children}</div>
    </section>
  );
}

export function C4Row({ children }: C4RowProps) {
  return <div className="ecs-c4-row">{children}</div>;
}

export function C4Boundary({ title, subtitle, children }: C4BoundaryProps) {
  return (
    <section className="ecs-c4-boundary">
      <div className="ecs-c4-boundary-head">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      <div className="ecs-c4-boundary-body">{children}</div>
    </section>
  );
}

export function C4Node({ kind, title, description }: C4NodeProps) {
  return (
    <article className="ecs-c4-node">
      <div className="ecs-c4-node-kind">{kind}</div>
      <h4 className="ecs-c4-node-title">{title}</h4>
      <p className="ecs-c4-node-description">{description}</p>
    </article>
  );
}

export function C4Arrow({ label }: C4ArrowProps) {
  return (
    <div className="ecs-c4-arrow" aria-hidden="true">
      {label ? <span className="ecs-c4-arrow-label">{label}</span> : null}
      <span className="ecs-c4-arrow-glyph">→</span>
    </div>
  );
}
