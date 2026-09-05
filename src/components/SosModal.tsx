import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  X,
} from 'lucide-react';
import { EmergencyType, SOSMessage } from '../types';
import { classifyEmergency } from '../services/severityEngine';
import { bleMesh } from '../services/bleMeshService';
import { LocalDisasterDatabase } from '../services/storage';
import { DEFAULT_DISASTER_COORDS } from '../data/emergencyResources';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  gpsActive: boolean;
  onSOSCreated?: (sos: SOSMessage) => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  gpsActive,
  onSOSCreated,
}) => {
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('trapped');
  const [description, setDescription] = useState(
    'Person trapped inside building 2nd floor, stairwell collapsed.'
  );
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [customLat] = useState<number>(DEFAULT_DISASTER_COORDS.lat);
  const [customLng] = useState<number>(DEFAULT_DISASTER_COORDS.lng);
  const [broadcastSuccess, setBroadcastSuccess] = useState<SOSMessage | null>(null);

  const triage = classifyEmergency(emergencyType, description, peopleCount);
  const [previewMsgId, setPreviewMsgId] = useState<string>('DN-8F2A');

  useEffect(() => {
    if (isOpen) {
      setPreviewMsgId('DN-' + Math.random().toString(36).substring(2, 6).toUpperCase());
      setBroadcastSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();

    const userProfile = LocalDisasterDatabase.getUserProfile();

    const newSOS: SOSMessage = {
      id: previewMsgId,
      userId: userProfile.id,
      senderName: userProfile.name,
      severity: triage.severity,
      emergencyType,
      message: description.trim() || `Emergency assistance needed (${emergencyType})`,
      latitude: gpsActive ? customLat : DEFAULT_DISASTER_COORDS.lat,
      longitude: gpsActive ? customLng : DEFAULT_DISASTER_COORDS.lng,
      timestamp: Date.now(),
      status: 'queued',
      ttl: 5,
      peopleCount,
      relayCount: 0,
      hopsTaken: 0,
      triageReason: triage.reason,
    };

    bleMesh.broadcastSOS(newSOS);
    setBroadcastSuccess(newSOS);
    if (onSOSCreated) onSOSCreated(newSOS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        id="sos-modal-container"
        className="w-full max-w-xl glass-card-elevated border border-white/70 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6 text-stone-900 dark:text-white"
      >
        <div className="bg-white/40 dark:bg-slate-900/40 px-6 py-4 border-b border-stone-200/70 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                Broadcast Emergency SOS Alert
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Transmits immediately to nearby helpers via Bluetooth without internet
              </p>
            </div>
          </div>
          <button
            id="close-sos-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {broadcastSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">Emergency Alert Broadcasted</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 max-w-md mx-auto">
                Your distress message has been recorded and is actively broadcasting across nearby community phones.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 rounded-2xl p-4 text-left max-w-md mx-auto text-xs space-y-2 backdrop-blur-md">
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Priority Level:</span>
                <span className={`font-bold ${broadcastSuccess.severity === 'CRITICAL' ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {broadcastSuccess.severity} PRIORITY
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">Mesh Range:</span>
                <span className="text-stone-800 dark:text-stone-200 font-semibold">5 Hops (approx. 500m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 dark:text-stone-400">GPS Location:</span>
                <span className="text-stone-800 dark:text-stone-200 font-semibold">
                  {broadcastSuccess.latitude.toFixed(4)}° N, {broadcastSuccess.longitude.toFixed(4)}° W
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="view-outbox-btn"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-rose-600 hover:bg-stone-800 dark:hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Close &amp; Check Alerts
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBroadcast} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2">
                1. Select Emergency Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'trapped', label: 'Trapped in Rubble', critical: true },
                  { id: 'severe_bleeding', label: 'Severe Bleeding', critical: true },
                  { id: 'unconscious', label: 'Unconscious / CPR', critical: true },
                  { id: 'active_fire', label: 'Active Fire / Smoke', critical: false },
                  { id: 'flood_surge', label: 'Flood Water Rising', critical: false },
                  { id: 'structural_collapse', label: 'Building Collapse', critical: true },
                  { id: 'medical_urgent', label: 'Urgent Medical', critical: false },
                  { id: 'food_water', label: 'Drinking Water', critical: false },
                  { id: 'shelter_needed', label: 'Shelter Needed', critical: false },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    id={`sos-type-${item.id}`}
                    onClick={() => setEmergencyType(item.id as EmergencyType)}
                    className={`p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                      emergencyType === item.id
                        ? 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200 shadow-2xs'
                        : 'bg-white/60 dark:bg-slate-800/60 border-stone-200/70 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{item.label}</span>
                      {item.critical && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-1.5">
                2. Describe Situation &amp; Landmark
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give exact room, floor, or nearby street name..."
                required
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  People In Danger
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPeopleCount(num)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        peopleCount === num
                          ? 'bg-stone-900 dark:bg-rose-600 text-white border-stone-900 dark:border-rose-600'
                          : 'bg-white/60 dark:bg-slate-800/60 border-stone-200/70 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                    >
                      {num === 10 ? '10+' : num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Location Coordinates
                </label>
                <div className="p-2 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-stone-200/70 dark:border-white/10 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-1.5 backdrop-blur-md">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {gpsActive
                      ? `${customLat.toFixed(4)}° N, ${customLng.toFixed(4)}° W (GPS Active)`
                      : 'Approx. City Center Location'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/50 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer border border-stone-200/70 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Distress SOS</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
