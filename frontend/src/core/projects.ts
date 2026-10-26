export type ProjectId = 'aquasense' | 'factsafe' | 'firescout';

export const projects: ReadonlyArray<{ id: ProjectId; name: string }> = [
  { id: 'aquasense', name: 'AquaSense' },
  { id: 'factsafe', name: 'FactSafe' },
  { id: 'firescout', name: 'FireScout AI' },
];

export function isProjectId(value: string | null | undefined): value is ProjectId {
  return projects.some((project) => project.id === value);
}

/** Invalid/absent query values fall back to a supported environment default. */
export function selectProject(search: string, environmentProject?: string): ProjectId {
  const requested = new URLSearchParams(search).get('project');
  if (isProjectId(requested)) return requested;
  return isProjectId(environmentProject) ? environmentProject : 'aquasense';
}
