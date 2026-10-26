import { useRef, type ReactNode } from 'react';
import type { ProjectConfig } from '../../types';
import { projects } from '../../projects';
import logo from '../../../assets/dashboard-logo.png';
import './figma-dashboard.css';

type Props = {
  projectConfig: ProjectConfig;
  connected: boolean;
  wsUrl?: string;
  controls: ReactNode;
  children: ReactNode;
};

/** Opt-in app chrome; scenario callbacks remain owned by Dashboard. */
export function FigmaDashboardShell({ projectConfig, connected, wsUrl, controls, children }: Props) {
  const settings = useRef<HTMLDialogElement>(null);
  return (
    <div className="fdb-shell">
      <header className="fdb-header">
        <div className="fdb-brand"><img src={logo} alt="" /><h1>{projectConfig.name}</h1></div>
        <button className="fdb-settings" aria-label="Dashboard settings" onClick={() => settings.current?.showModal()}>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="m9 3-.7 2.2-2 .9-2.1-.4-1.6 2.8 1.4 1.7v2.4l-1.4 1.7 1.6 2.8 2.1-.4 2 .9L9 20h3l.7-2.1 2-.9 2.1.4 1.6-2.8-1.4-1.7v-2.4l1.4-1.7-1.6-2.8-2.1.4-2-.9L12 3Z" /><circle cx="10.5" cy="11.5" r="3" />
          </svg>
        </button>
      </header>
      <main className="fdb-main">{children}</main>
      <footer className="fdb-shell-footer">{controls}</footer>
      <dialog ref={settings} className="fdb-dialog" aria-labelledby="fdb-settings-title">
        <h2 id="fdb-settings-title">Dashboard settings</h2>
        <label htmlFor="dashboard-project">Project</label>
        <select id="dashboard-project" value={projectConfig.id} onChange={(event) => {
          const url = new URL(window.location.href);
          url.searchParams.set('project', event.target.value);
          // A document navigation disposes the old socket and all in-memory stores.
          window.location.assign(url.toString());
        }}>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <p role="status">Simulator: {connected ? 'Connected' : 'Disconnected'}</p>
        <p className="fdb-endpoint">WebSocket: {wsUrl || 'ws://localhost:8765'}</p>
        <p>Use Scenarios in the footer to choose a simulation and adjust playback speed.</p>
        <form method="dialog"><button autoFocus>Close</button></form>
      </dialog>
    </div>
  );
}
