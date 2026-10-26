import type { CSSProperties } from 'react';

export type AlertMessageProps = {
  message: string;
  severity?: 'error' | 'warning' | 'success' | 'info';
  visible?: boolean;
  className?: string;
};

const colors = {
  error: { background: '#FFAB9E', borderColor: '#ED3028' },
  warning: { background: '#FFE3A3', borderColor: '#A66B00' },
  success: { background: '#C6EBD0', borderColor: '#278343' },
  info: { background: '#CBE4FA', borderColor: '#2878AD' },
} satisfies Record<NonNullable<AlertMessageProps['severity']>, CSSProperties>;

/** Presentation only: callers own detection, lifetime, and event history. */
export function AlertMessage({ message, severity = 'error', visible = true, className }: AlertMessageProps) {
  if (!visible || !message.trim()) return null;

  return <div
    className={className}
    role={severity === 'error' ? 'alert' : 'status'}
    aria-atomic="true"
    style={{
      ...colors[severity],
      borderWidth: 2,
      borderStyle: 'solid',
      borderRadius: 6,
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      padding: '16px 20px',
      color: '#171717',
      textAlign: 'center',
      fontFamily: 'inherit',
      fontSize: 16,
      lineHeight: 1.5,
      overflowWrap: 'anywhere',
      whiteSpace: 'pre-wrap',
    }}
  >{message}</div>;
}
