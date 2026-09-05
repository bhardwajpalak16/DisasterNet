import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  AlertTriangle,
  Send,
  CheckCircle2,
  Plus,
  ThumbsUp,
} from 'lucide-react';
import { IncidentReport, IncidentType, SeverityLevel } from '../types';
import { LocalDisasterDatabase } from '../services/storage';
import { bleMesh } from '../services/bleMeshService';
import { DEFAULT_DISASTER_COORDS } from '../data/emergencyResources';

interface IncidentScreenProps {
  gpsActive: boolean;
}

export const IncidentScreen: React.FC<IncidentScreenProps> = ({ gpsActive }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [showReportForm, setShowReportForm] = useState<boolean>(false);

  const [incidentType, setIncidentType] = useState<IncidentType>('flood_water');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [waterDepthCm, setWaterDepthCm] = useState<number>(80);
  const [isPassable, setIsPassable] = useState<boolean>(false);
  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);

  useEffect(() => {
    setIncidents(LocalDisasterDatabase.getIncidents());
    const unsub = bleMesh.subscribeToPackets(() => {
      setIncidents(LocalDisasterDatabase.getIncidents());
    });
    return () => unsub();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReport: IncidentReport = {
      id: 'INC-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      type: incidentType,
      severity,
      title: title || `${incidentType.replace('_', ' ').toUpperCase()} Hazard`,
      description,
      latitude: DEFAULT_DISASTER_COORDS.lat + (Math.random() - 0.5) * 0.015,
      longitude: DEFAULT_DISASTER_COORDS.lng + (Math.random() - 0.5) * 0.015,
      timestamp: Date.now(),
      status: 'active',
      verifiedByPeers: 1,
      waterDepthCm: incidentType === 'flood_water' ? waterDepthCm : undefined,
      isPassable,
      reportedBy: 'This Device (BLE Mesh)',
      ttl: 4,
    };

    bleMesh.broadcastIncident(newReport);
    setIncidents(LocalDisasterDatabase.getIncidents());
    setShowReportForm(false);
    setTitle('');
    setDescription('');
    setSubmittedBanner('Hazard successfully reported and shared with nearby neighbors over Bluetooth.');

    setTimeout(() => {
      setSubmittedBanner(null);
    }, 4000);
  };

  const handleVerify = (id: string) => {
    LocalDisasterDatabase.verifyIncident(id);
    setIncidents([...LocalDisasterDatabase.getIncidents()]);
  };

  return (
    <div className="space-y-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-white/60 dark:border-white/10"
      >
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Community Incident &amp; Hazard Reports
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
              Verified by Neighbors
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Log floodwater depth, blocked roads, fire boundaries, and hazards across the local Bluetooth mesh.
          </p>
        </div>

        <button
          id="open-report-hazard-form-btn"
          onClick={() => setShowReportForm(!showReportForm)}
          className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-rose-600 hover:bg-stone-800 dark:hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showReportForm ? 'Cancel Report' : 'Report Hazard'}</span>
        </button>
      </motion.div>

      {submittedBanner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 backdrop-blur-md"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{submittedBanner}</span>
        </motion.div>
      )}

      {showReportForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="glass-card p-5 space-y-4 border border-white/60 dark:border-white/10"
        >
          <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-white/10 pb-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Report a New Hazard to Nearby Neighbors
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">Zero Internet Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Hazard Type</label>
              <select
                id="hazard-type-select"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                <option value="flood_water">Flash Flood / High Water Level</option>
                <option value="road_blocked">Road Blocked by Fallen Trees or Debris</option>
                <option value="active_fire">Active Fire / Heavy Smoke</option>
                <option value="landslide">Landslide / Mudflow</option>
                <option value="downed_powerline">Downed Electrical Power Line</option>
                <option value="bridge_damage">Bridge Structural Damage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Hazard Severity</label>
              <select
                id="hazard-severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                <option value="CRITICAL">Critical (Life Threatening)</option>
                <option value="HIGH">High (Road Impassable / Dangerous)</option>
                <option value="MEDIUM">Medium (Caution Needed)</option>
                <option value="LOW">Low (Informational)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Hazard Title</label>
            <input
              type="text"
              placeholder="e.g. 1st Avenue Bridge submerged under 3 feet of water"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Details &amp; Safe Alternative Routes</label>
            <textarea
              rows={2}
              placeholder="Describe what you see: is it passable on foot? Any alternate streets open?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {incidentType === 'flood_water' && (
            <div className="p-3.5 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-stone-200/70 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 backdrop-blur-md">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Estimated Water Depth: {waterDepthCm} cm ({Math.round(waterDepthCm / 2.54)} inches)
                </label>
                <input
                  type="range"
                  min={10}
                  max={250}
                  value={waterDepthCm}
                  onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="passable-checkbox"
                  checked={isPassable}
                  onChange={(e) => setIsPassable(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                />
                <label htmlFor="passable-checkbox" className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                  Still passable by high-clearance emergency trucks
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer border border-stone-200/70 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Hazard Alert</span>
            </button>
          </div>
        </motion.form>
      )}

      <div className="space-y-3">
        {incidents.length === 0 ? (
          <div className="p-12 text-center glass-card border border-white/60 dark:border-white/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800 dark:text-stone-200">No active hazards reported in your immediate vicinity</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">All monitored roadways and bridges appear open.</p>
          </div>
        ) : (
          incidents.map((inc) => {
            const isCritical = inc.severity === 'CRITICAL';
            const isHigh = inc.severity === 'HIGH';

            return (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 space-y-3 border border-white/60 dark:border-white/10"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                          : isHigh
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                          : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">{inc.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                    <span>Reported {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/80 text-stone-700 dark:text-stone-300 font-semibold border border-stone-200/50 dark:border-white/10">
                      {inc.verifiedByPeers} Verifications
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {inc.description || 'Hazard condition logged by community member.'}
                </p>

                {inc.waterDepthCm !== undefined && (
                  <div className="flex items-center gap-4 text-xs bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-stone-200/70 dark:border-white/10 backdrop-blur-md">
                    <span className="text-stone-700 dark:text-stone-200">
                      <strong>Water Depth:</strong> {inc.waterDepthCm} cm ({Math.round(inc.waterDepthCm / 2.54)} inches)
                    </span>
                    <span
                      className={`font-semibold ${
                        inc.isPassable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {inc.isPassable ? 'Passable by trucks' : 'Impassable (Do Not Cross)'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 dark:border-white/10 text-xs">
                  <span className="text-stone-400 dark:text-stone-500">
                    Location: {inc.latitude.toFixed(4)}° N, {inc.longitude.toFixed(4)}° W
                  </span>
                  <button
                    onClick={() => handleVerify(inc.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200/70 dark:border-white/10"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>I Confirm This Hazard ({inc.verifiedByPeers})</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
