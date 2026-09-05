import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Share2,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { SOSMessage } from '../types';
import { LocalDisasterDatabase } from '../services/storage';
import { bleMesh } from '../services/bleMeshService';
import { emergencyAudio } from '../services/audioAlert';

export const AlertsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'outbox'>('inbox');
  const [receivedAlerts, setReceivedAlerts] = useState<SOSMessage[]>([]);
  const [outboxAlerts, setOutboxAlerts] = useState<SOSMessage[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [duplicateCount, setDuplicateCount] = useState<number>(0);

  const loadData = () => {
    setReceivedAlerts(LocalDisasterDatabase.getReceivedSOS());
    setOutboxAlerts(LocalDisasterDatabase.getOutboxSOS());
    setDuplicateCount(bleMesh.getDuplicateCount());
  };

  useEffect(() => {
    loadData();
    const unsub = bleMesh.subscribeToPackets(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const handleRespond = (alert: SOSMessage) => {
    const user = LocalDisasterDatabase.getUserProfile();
    const updated: SOSMessage = {
      ...alert,
      status: 'responding',
      responders: [...(alert.responders || []), user.name],
    };
    LocalDisasterDatabase.updateReceivedSOS(updated);
    emergencyAudio.playAlertTone('ping');
    loadData();
  };

  const handleRelay = (id: string) => {
    bleMesh.relayPacket(id);
    loadData();
  };

  const filteredAlerts = (activeTab === 'inbox' ? receivedAlerts : outboxAlerts).filter(
    (a) => severityFilter === 'ALL' || a.severity === severityFilter
  );

  return (
    <div className="space-y-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-white/60 dark:border-white/10"
      >
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Community Emergency Alerts &amp; Messages
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold">
              Live Phone Mesh
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Incoming distress alerts received directly from nearby devices via phone-to-phone Bluetooth.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Duplicate Suppressions: {duplicateCount}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3 border border-white/60 dark:border-white/10">
        <div className="flex items-center gap-2">
          <button
            id="tab-inbox"
            onClick={() => setActiveTab('inbox')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-stone-900 dark:bg-rose-600 text-white shadow-sm'
                : 'bg-white/60 dark:bg-slate-800/60 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-slate-700 border border-stone-200/60 dark:border-white/10'
            }`}
          >
            <span>Received Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {receivedAlerts.length}
            </span>
          </button>

          <button
            id="tab-outbox"
            onClick={() => setActiveTab('outbox')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'outbox'
                ? 'bg-stone-900 dark:bg-rose-600 text-white shadow-sm'
                : 'bg-white/60 dark:bg-slate-800/60 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-slate-700 border border-stone-200/60 dark:border-white/10'
            }`}
          >
            <span>My Broadcasts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {outboxAlerts.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSeverityFilter(lvl)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                severityFilter === lvl
                  ? 'bg-stone-200 dark:bg-slate-700 text-stone-900 dark:text-white font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center glass-card border border-white/60 dark:border-white/10">
            <ShieldAlert className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-700 dark:text-stone-300">No active alerts in this list</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              Distress packets received over Bluetooth Low Energy will automatically display here.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-5 space-y-3 border border-white/60 dark:border-white/10 ${
                  isCritical
                    ? 'border-l-4 border-l-rose-500'
                    : isHigh
                    ? 'border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-stone-300 dark:border-l-slate-600'
                }`}
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
                      {alert.severity} Priority
                    </span>
                    <span className="text-xs text-stone-900 dark:text-white font-bold">
                      {alert.senderName}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">({alert.emergencyType})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/80 text-stone-600 dark:text-stone-300 text-[11px] border border-stone-200/50 dark:border-white/10">
                      Hops: {alert.ttl}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/80 text-stone-600 dark:text-stone-300 text-[11px] border border-stone-200/50 dark:border-white/10">
                      Relayed: {alert.relayCount}x
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-stone-200/70 dark:border-white/10 backdrop-blur-md">
                  {alert.message}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <div className="flex items-center gap-4 text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {alert.latitude.toFixed(4)}° N, {alert.longitude.toFixed(4)}° W
                    </span>
                    {alert.bloodGroup && (
                      <span className="text-stone-700 dark:text-stone-200 font-semibold">
                        Blood: {alert.bloodGroup}
                      </span>
                    )}
                    {alert.responders && alert.responders.length > 0 && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {alert.responders.length} Responders on the way
                      </span>
                    )}
                  </div>

                  {activeTab === 'inbox' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRelay(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200/70 dark:border-white/10"
                        title="Relay packet forward to extend Bluetooth range"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Relay Hop</span>
                      </button>
                      <button
                        onClick={() => handleRespond(alert)}
                        disabled={alert.status === 'responding'}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          alert.status === 'responding'
                            ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                            : 'bg-stone-900 dark:bg-rose-600 hover:bg-stone-800 dark:hover:bg-rose-700 text-white'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{alert.status === 'responding' ? 'You Responded' : 'I Can Help'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
