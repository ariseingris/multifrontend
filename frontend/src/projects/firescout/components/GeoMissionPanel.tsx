import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TelemetryPoint } from '../../../core/types';
import { coordinate, flightSegments, uavPosition } from '../services/missionTelemetryAdapter';
import { displayValue } from '../../../core/utils/telemetryPresentation';

export function GeoMissionPanel({ points, latest, stale }: { points: TelemetryPoint[]; latest: TelemetryPoint | null; stale: boolean }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>();
  const features = useRef<L.LayerGroup>();
  const tiles = useRef<L.TileLayer>();
  const [basemap, setBasemap] = useState(false);
  const [tileError, setTileError] = useState(false);
  const position = uavPosition(latest);
  useEffect(() => {
    if (!element.current) return;
    const instance = L.map(element.current, { center: [12, 110], zoom: 16, scrollWheelZoom: false, zoomAnimation: false });
    map.current = instance;
    const Grid = L.GridLayer.extend({ createTile(coords: L.Coords) {
      const tile = document.createElement('canvas'); tile.width = tile.height = 256;
      const context = tile.getContext('2d')!;
      context.fillStyle = '#edf4f5'; context.fillRect(0, 0, 256, 256);
      context.strokeStyle = '#c2d4dc'; context.strokeRect(0, 0, 256, 256);
      const corner = instance.unproject(L.point(coords.x * 256, coords.y * 256), coords.z);
      context.fillStyle = '#526b78'; context.font = '11px sans-serif';
      context.fillText(`${corner.lat.toFixed(4)}°, ${corner.lng.toFixed(4)}°`, 8, 18);
      return tile;
    } });
    new Grid().addTo(instance);
    features.current = L.layerGroup().addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize()); observer.observe(element.current);
    return () => { observer.disconnect(); instance.remove(); map.current = undefined; };
  }, []);
  useEffect(() => {
    const instance = map.current; if (!instance) return;
    if (basemap) {
      setTileError(false);
      const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
      layer.on('tileerror', () => { setTileError(true); layer.setOpacity(0); });
      tiles.current = layer.addTo(instance);
    } else { tiles.current?.remove(); tiles.current = undefined; }
    return () => { tiles.current?.remove(); };
  }, [basemap]);
  useEffect(() => {
    const layer = features.current; if (!layer) return;
    layer.clearLayers();
    flightSegments(points).forEach(segment => L.polyline(segment, { color: '#2878ad', weight: 3 }).addTo(layer));
    const mission = latest?.mission;
    if (mission) {
      L.circleMarker(mission.home, { radius: 7, color: '#287447', fillOpacity: .8 }).bindTooltip('SIMULATED home/base', { permanent: true, direction: 'bottom' }).addTo(layer);
      L.circle(mission.incident, { radius: 70, color: '#c47c25', dashArray: '5 5', fillOpacity: .05 }).bindTooltip('SIMULATED incident scan ROI').addTo(layer);
      const hot = coordinate(latest.metrics.hotspot_latitude_deg, latest.metrics.hotspot_longitude_deg);
      if (hot) L.circleMarker(hot, { radius: 10, color: '#cb3d1e', fillOpacity: .7 }).bindTooltip(`SIMULATED hotspot ${mission.hotspot_id}`, { permanent: true }).addTo(layer);
    }
    if (position) L.circleMarker(position, { radius: 8, color: stale ? '#98600d' : '#174e7b', fillOpacity: 1 }).bindTooltip(stale ? 'LAST KNOWN · SIMULATED UAV' : 'SIMULATED UAV', { permanent: true, direction: 'top' }).addTo(layer);
  }, [points, latest, stale]);
  return <div className="fs-map-panel">
    <p className="fs-source">SIMULATED · fictional mission · WGS84 degrees</p>
    <div ref={element} className="fs-map" role="region" aria-label="Interactive simulated UAV mission map; use arrow keys to pan and plus/minus to zoom" />
    <div className="fs-toolbar"><button onClick={() => { if (position) map.current?.setView(position, 16, { animate: false }); }} disabled={!position}>Center UAV</button>
      <label><input type="checkbox" checked={basemap} onChange={e => setBasemap(e.target.checked)} /> Street basemap (online)</label></div>
    <p role="status">{tileError ? 'Tiles unavailable — offline coordinate grid remains active.' : basemap ? 'OpenStreetMap basemap · mission positions remain simulated.' : 'Offline geographic grid · pan, zoom or enable street tiles.'}</p>
    <p>{position ? `${stale ? 'LAST KNOWN · ' : ''}SIMULATED UAV: ${position[0].toFixed(5)}°, ${position[1].toFixed(5)}°` : 'No UAV position available.'}<br />
      Altitude: {displayValue(latest?.metrics.uav_altitude_m)} m above fictional launch. Sim {displayValue(latest?.elapsedSimSeconds, 1)} s.</p>
    <small>Green: simulated base · blue: UAV/trail · orange: simulated scan ROI · red: simulated hotspot. Trail breaks across missing telemetry.</small>
  </div>;
}
