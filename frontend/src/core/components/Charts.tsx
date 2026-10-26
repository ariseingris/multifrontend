import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { useTelemetryStore } from '../store';
import { elapsedAxis, visibleTelemetry } from '../utils/telemetryPresentation';
import { formatTime } from '../utils/formatting';

interface LiveChartProps {
  metricKeys: string[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  chartType?: 'line' | 'area' | 'bar';
  colors?: string[];
  latestOnly?: boolean;
  theme?: 'dark' | 'light';
  sessionTime?: boolean;
  windowSeconds?: number;
  axisLabel?: string;
  timeUnit?: 'minutes' | 'seconds';
  unit?: string;
  domain?: [number, number];
  labels?: Record<string, string>;
  reference?: { value: number; label: string };
}

export const LiveChart: React.FC<LiveChartProps> = ({
  metricKeys,
  title,
  height = 300,
  showLegend = true,
  chartType = 'line',
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'],
  latestOnly = false,
  theme = 'dark',
  timeUnit, unit, domain, labels, reference, sessionTime = false, windowSeconds, axisLabel,
}) => {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const sessionAxis = sessionTime && timeUnit ? elapsedAxis(telemetry, timeUnit, windowSeconds) : undefined;

  const chartData = useMemo(() => {
    const points = latestOnly ? telemetry.slice(-1) : visibleTelemetry(telemetry, windowSeconds);
    return points.map((point) => {
      const row: any = {
        time: timeUnit ? (point.elapsedSimSeconds === undefined ? null : point.elapsedSimSeconds / (timeUnit === 'minutes' ? 60 : 1)) : formatTime(point.timestamp),
        timestamp: point.timestamp,
      };

      metricKeys.forEach((key) => {
        row[key] = point.metrics[key] ?? null;
      });

      return row;
    });
  }, [telemetry, metricKeys, latestOnly, timeUnit, windowSeconds]);

  const Chart = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;
  return (
    <div
      style={{
        background: theme === 'light' ? '#fff' : '#1a1a1a',
        border: theme === 'light' ? 'none' : '1px solid #2d2d2d',
        borderRadius: '8px',
        padding: theme === 'light' ? '0' : '16px',
        marginBottom: theme === 'light' ? '0' : '16px',
      }}
    >
      {title && (
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: theme === 'light' ? '#334155' : '#e0e0e0',
          }}
        >
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <Chart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'light' ? '#e2e8f0' : '#2d2d2d'}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            type={timeUnit ? 'number' : 'category'}
            domain={sessionAxis?.domain ?? (timeUnit ? ['dataMin', 'dataMax'] : undefined)}
            allowDataOverflow={!!windowSeconds}
            ticks={sessionAxis?.ticks}
            tickFormatter={sessionAxis?.format ?? (timeUnit ? (value) => Number(value).toFixed(1) : undefined)}
            label={timeUnit ? { value: `Sim time (${timeUnit === 'minutes' ? 'min' : 's'})`, position: 'insideBottom', offset: -3, fill: '#52657a', fontSize: 11 } : undefined}
            height={timeUnit ? 40 : 30}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fill: theme === 'light' ? '#52657a' : '#9ca3af' }}
          />
          <YAxis
            domain={domain}
            label={axisLabel || unit ? { value: axisLabel || unit, angle: -90, position: 'insideLeft', fill: '#52657a', fontSize: 11 } : undefined}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fill: theme === 'light' ? '#52657a' : '#9ca3af' }}
          />
          <Tooltip
            labelFormatter={timeUnit ? (value) => `Sim ${Number(value).toFixed(2)} ${timeUnit === 'minutes' ? 'min' : 's'}` : undefined}
            contentStyle={{
              background: theme === 'light' ? '#fff' : '#262626',
              border: '1px solid #404040',
              borderRadius: '4px',
              padding: '8px',
            }}
            labelStyle={{ color: theme === 'light' ? '#334155' : '#e0e0e0' }}
            itemStyle={{ color: theme === 'light' ? '#334155' : '#e0e0e0' }}
          />
          {reference && <ReferenceLine y={reference.value} ifOverflow="extendDomain" stroke="#a16207" strokeDasharray="4 4" label={{ value: reference.label, position: 'insideTopRight', fill: '#854d0e', fontSize: 10 }} />}
          {showLegend && (
            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
            />
          )}

          {metricKeys.map((key, index) => {
            const color = colors[index % colors.length];
            if (chartType === 'line') {
              return <Line key={key} name={labels?.[key] ?? key} type="monotone" dataKey={key} stroke={color} dot={false} isAnimationActive={false} strokeWidth={2} />;
            }
            if (chartType === 'area') {
              return <Area key={key} name={labels?.[key] ?? key} type="monotone" dataKey={key} stroke={color} fill={color} dot={false} isAnimationActive={false} strokeWidth={2} />;
            }
            return <Bar key={key} name={labels?.[key] ?? key} dataKey={key} fill={color} isAnimationActive={false} />;
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Chart with threshold bands (warning and critical zones)
 */
interface ThresholdChartProps {
  metricKey: string;
  domain?: [number, number];
  title?: string;
  height?: number;
  normalMin: number;
  normalMax: number;
  warningMin?: number;
  warningMax?: number;
  criticalMin?: number;
  criticalMax?: number;
  unit?: string;
  timeUnit?: 'minutes' | 'seconds';
  warningThreshold?: number;
  criticalThreshold?: number;
  theme?: 'dark' | 'light';
  sessionTime?: boolean;
  windowSeconds?: number;
  axisLabel?: string;
}

export const ThresholdChart: React.FC<ThresholdChartProps> = ({
  metricKey,
  title,
  height = 300,
  normalMin,
  normalMax,
  warningMin,
  warningMax,
  criticalMin,
  criticalMax,
  unit,
  theme = 'dark',
  timeUnit, warningThreshold, criticalThreshold, sessionTime = false, windowSeconds, axisLabel, domain,
}) => {
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const sessionAxis = sessionTime && timeUnit ? elapsedAxis(telemetry, timeUnit, windowSeconds) : undefined;

  const chartData = useMemo(() => {
    return visibleTelemetry(telemetry, windowSeconds).map((point) => ({
      time: timeUnit ? (point.elapsedSimSeconds === undefined ? null : point.elapsedSimSeconds / (timeUnit === 'minutes' ? 60 : 1)) : formatTime(point.timestamp),
      value: point.metrics[metricKey] ?? null,
      normalMin,
      normalMax,
      warningMin: warningMin ?? normalMin,
      warningMax: warningMax ?? normalMax,
      criticalMin: criticalMin ?? normalMin,
      criticalMax: criticalMax ?? normalMax,
    }));
  }, [
    telemetry,
    metricKey,
    normalMin,
    normalMax,
    warningMin,
    warningMax,
    criticalMin,
    criticalMax,
    timeUnit,
    windowSeconds,
  ]);

  return (
    <div
      style={{
        background: theme === 'light' ? '#fff' : '#1a1a1a',
        border: theme === 'light' ? 'none' : '1px solid #2d2d2d',
        borderRadius: '8px',
        padding: theme === 'light' ? '0' : '16px',
        marginBottom: theme === 'light' ? '0' : '16px',
      }}
    >
      {title && (
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: theme === 'light' ? '#334155' : '#e0e0e0',
          }}
        >
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(74, 222, 128, 0.3)" />
              <stop offset="100%" stopColor="rgba(74, 222, 128, 0.05)" />
            </linearGradient>
            <linearGradient id="warningGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.2)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.05)" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'light' ? '#e2e8f0' : '#2d2d2d'}
            vertical={false}
          />
          <XAxis
            dataKey="time"
            type={timeUnit ? 'number' : 'category'}
            domain={sessionAxis?.domain ?? (timeUnit ? ['dataMin', 'dataMax'] : undefined)}
            allowDataOverflow={!!windowSeconds}
            ticks={sessionAxis?.ticks}
            tickFormatter={sessionAxis?.format ?? (timeUnit ? (value) => Number(value).toFixed(1) : undefined)}
            label={timeUnit ? { value: `Sim time (${timeUnit === 'minutes' ? 'min' : 's'})`, position: 'insideBottom', offset: -3, fill: '#52657a', fontSize: 11 } : undefined}
            height={timeUnit ? 40 : 30}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fill: theme === 'light' ? '#52657a' : '#9ca3af' }}
          />
          <YAxis
            domain={domain}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            tick={{ fill: theme === 'light' ? '#52657a' : '#9ca3af' }}
            label={{
              value: axisLabel || unit || '',
              angle: -90,
              position: 'insideLeft',
              fill: theme === 'light' ? '#52657a' : '#9ca3af',
            }}
          />
          <Tooltip
            labelFormatter={timeUnit ? (value) => `Sim ${Number(value).toFixed(2)} ${timeUnit === 'minutes' ? 'min' : 's'}` : undefined}
            contentStyle={{
              background: theme === 'light' ? '#fff' : '#262626',
              border: '1px solid #404040',
              borderRadius: '4px',
            }}
            labelStyle={{ color: theme === 'light' ? '#334155' : '#e0e0e0' }}
            itemStyle={{ color: theme === 'light' ? '#334155' : '#e0e0e0' }}
          />

          {theme === 'light' ? (
            <ReferenceArea y1={normalMin} y2={normalMax} fill="#22c55e" fillOpacity={0.1}
              strokeOpacity={0} ifOverflow="extendDomain" />
          ) : <>
          {/* Normal band */}
          <Area
            type="monotone"
            dataKey="normalMax"
            stroke="transparent"
            fill="url(#normalGrad)"
            isAnimationActive={false}
          />

          {/* Warning band */}
          {(warningMin || warningMax) && (
            <Area
              type="monotone"
              dataKey="warningMax"
              stroke="transparent"
              fill="rgba(245, 158, 11, 0.1)"
              isAnimationActive={false}
            />
          )}

          </>}

          {warningThreshold !== undefined && <ReferenceLine ifOverflow="extendDomain" y={warningThreshold} stroke="#a16207" strokeDasharray="4 4" label={{ value: 'Demo warning', position: 'insideTopRight', fill: '#854d0e', fontSize: 10 }} />}
          {criticalThreshold !== undefined && <ReferenceLine ifOverflow="extendDomain" y={criticalThreshold} stroke="#b91c1c" strokeDasharray="4 4" label={{ value: 'Demo critical', position: 'insideTopRight', fill: '#b91c1c', fontSize: 10 }} />}
          {/* Data line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Simple gauge chart for single values
 */
interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  thresholdWarning?: number;
  thresholdCritical?: number;
  size?: number;
  theme?: 'dark' | 'light';
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  min,
  max,
  label,
  unit,
  thresholdWarning,
  thresholdCritical,
  size = 120,
  theme = 'dark',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  let color = '#4ade80'; // normal
  if (thresholdCritical && value >= thresholdCritical) color = '#ef4444';
  else if (thresholdWarning && value >= thresholdWarning) color = '#f59e0b';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="#2d2d2d"
            strokeWidth="6"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${(normalizedPercentage / 100) * (Math.PI * (size - 16))} ${Math.PI * (size - 16)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '700', color }}>
            {value.toFixed(1)}
          </div>
          {unit && (
            <div
              style={{
                fontSize: '10px',
                color: '#9ca3af',
                marginTop: '2px',
              }}
            >
              {unit}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: theme === 'light' ? '#52657a' : '#d0d0d0', textAlign: 'center' }}>
        {label}
      </div>
    </div>
  );
};
