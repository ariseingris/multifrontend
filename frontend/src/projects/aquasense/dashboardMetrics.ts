import { aquasenseConfig } from './config';

// Presentation order is project-specific; ranges, names and units remain in config.ts.
export const primaryMetrics = ['do_mg_l', 'water_temperature_c', 'ph'].map((key) => {
  const metric = aquasenseConfig.metrics.find((item) => item.key === key);
  if (!metric) throw new Error(`Missing AquaSense metric configuration: ${key}`);
  return metric;
});
export const supportingMetrics = aquasenseConfig.metrics.filter(
  (metric) => !primaryMetrics.some((primary) => primary.key === metric.key)
);
