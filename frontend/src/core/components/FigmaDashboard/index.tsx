import type { CSSProperties, ReactNode } from 'react';
import './figma-dashboard.css';

export type StatusMetric = {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  tone?: 'normal' | 'warning' | 'critical';
  status?: string;
};

type ChartSlot = { id: string; title: string; children: ReactNode };

type Props = {
  metrics: StatusMetric[];
  charts: [ChartSlot, ChartSlot, ChartSlot];
  insightTitle?: string;
  insight: ReactNode;
  logs?: ReactNode;
  footer?: ReactNode;
  title?: string;
  accent?: string;
};

/** Content-only dashboard. Keep existing core <Dashboard> responsible for app chrome and scenarios. */
export function FigmaDashboardContent({
  metrics, charts, insight, logs, footer, title = 'Status',
  insightTitle = 'Description', accent = '#6c8eaa',
}: Props) {
  return (
    <div className="fdb" style={{ '--fdb-accent': accent } as CSSProperties}>
      <section className="fdb-status" aria-label={title}>
        <h2 className="fdb-heading">{title}</h2>
        <div className="fdb-metrics">
          {metrics.map((metric) => <MetricCard key={metric.id} {...metric} />)}
        </div>
      </section>
      <div className="fdb-grid">
        {charts.slice(0, 2).map((chart) => <ChartCard key={chart.id} {...chart} />)}
        <ChartCard {...charts[2]} />
        <section className="fdb-insight" aria-label={insightTitle}>
          <h2 className="fdb-heading">{insightTitle}</h2>
          <div className="fdb-panel fdb-insight__body">{insight}</div>
        </section>
      </div>
      {logs != null && <section className="fdb-logs" aria-label="Logs"><h2 className="fdb-heading">Logs</h2><div className="fdb-panel fdb-logs__body">{logs}</div></section>}
      {footer != null && <div className="fdb-footer">{footer}</div>}
    </div>
  );
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="fdb-chart" aria-label={title}>
    <h2 className="fdb-chart__title">{title}</h2>
    <div className="fdb-panel fdb-chart__body">{children}</div>
  </section>;
}

export function MetricCard({ label, value, unit, tone = 'normal', status }: StatusMetric) {
  return <div className={`fdb-metric fdb-metric--${tone}`}>
    <span className="fdb-metric__label">{label}</span>
    <strong className="fdb-metric__value">{value} {unit && <small>{unit}</small>}</strong>
    {status && <span className="fdb-metric__status">{status}</span>}
  </div>;
}
