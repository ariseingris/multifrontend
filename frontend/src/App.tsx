import { FactSafeDashboard } from './projects/factsafe/Dashboard';
import { AquaSenseDashboard } from './projects/aquasense/Dashboard';
import { FireScoutDashboard } from './projects/firescout/Dashboard';
import { selectProject } from './core/projects';

export const App = () => {
  const selectedProject = selectProject(window.location.search, import.meta.env.VITE_PROJECT);
  switch (selectedProject) {
    case 'factsafe': return <FactSafeDashboard />;
    case 'firescout': return <FireScoutDashboard />;
    default: return <AquaSenseDashboard />;
  }
};
