import React from 'react';
import { VitalChainDashboard } from './projects/vitalchain/Dashboard';
import { PulseGuardDashboard } from './projects/pulseguard/Dashboard';
import { FactSafeDashboard } from './projects/factsafe/Dashboard';
import { AquaSenseDashboard } from './projects/aquasense/Dashboard';
import { DataCoolDashboard } from './projects/datacool/Dashboard';
import { HirdopDashboard } from './projects/hirdop/Dashboard';
import { PamDashboard } from './projects/pam/Dashboard';

type ProjectId = 'vitalchain' | 'pulseguard' | 'factsafe' | 'aquasense' | 'hirdop' | 'datacool' | 'pam';

export const App: React.FC = () => {
  const selectedProject: ProjectId = (import.meta.env.VITE_PROJECT || 'vitalchain') as ProjectId;

  const renderProject = () => {
    switch (selectedProject) {
      case 'vitalchain':
        return <VitalChainDashboard />;
      case 'pulseguard':
        return <PulseGuardDashboard />;
      case 'factsafe':
        return <FactSafeDashboard />;
      case 'aquasense':
        return <AquaSenseDashboard />;
      case 'datacool':
        return <DataCoolDashboard />;
      case 'hirdop':
        return <HirdopDashboard />;
      case 'pam':
        return <PamDashboard />;
      // More projects will be added here
      default:
        return <VitalChainDashboard />;
    }
  };

  return (
    <>
      {renderProject()}

      {/* Project Selector (can be toggled) */}
      <style>{`
        @media (max-width: 600px) {
          .project-selector {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
          }
        }
      `}</style>
    </>
  );
};
