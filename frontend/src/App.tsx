import React, { useState } from 'react';
import { VitalChainDashboard } from './projects/vitalchain/Dashboard';

type ProjectId = 'vitalchain' | 'pulseguard' | 'factsafe' | 'aquasense' | 'hirdop' | 'datacool';

export const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectId>('vitalchain');

  const renderProject = () => {
    switch (selectedProject) {
      case 'vitalchain':
        return <VitalChainDashboard />;
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
