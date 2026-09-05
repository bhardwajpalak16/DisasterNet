import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Radio,
  MapPin,
  HeartPulse,
  ArrowRight,
  WifiOff,
  CheckCircle2,
  Users,
  Bell,
  BookOpen,
  LifeBuoy,
  Sparkles,
} from 'lucide-react';
import { SOSMessage, EmergencyResource, BLEDevice } from '../types';
import { LocalDisasterDatabase } from '../services/storage';
import { bleMesh } from '../services/bleMeshService';

interface HomeScreenProps {
  onTriggerSOS: () => void;
  onNavigate: (tab: string) => void;
  airplaneMode: boolean;
  bleActive: boolean;
  gpsActive: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onTriggerSOS,
  onNavigate,
  airplaneMode,
  bleActive,
  gpsActive,
}) => {
  const [activeSOSList, setActiveSOSList] = useState<SOSMessage[]>([]);
  const [nearbyAlerts, setNearbyAlerts] = useState<SOSMessage[]>([]);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [sosHoldProgress, setSosHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [savedName, setSavedName] = useState<string>('Neighbor');

  useEffect(() => {
    setActiveSOSList(LocalDisasterDatabase.getOutboxSOS());
    setNearbyAlerts(LocalDisasterDatabase.getReceivedSOS().slice(0, 4));
    setDevices(bleMesh.getNearbyDevices());
    setResources(LocalDisasterDatabase.getResources());

    const saved = localStorage.getItem('disaster_net_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setSavedName(parsed.name);
      } catch (e) {}
    }

    const unsubDevices = bleMesh.subscribeToDevices((d) => setDevices(d));
    const unsubPackets = bleMesh.subscribeToPackets(() => {
      setActiveSOSList(LocalDisasterDatabase.getOutboxSOS());
      setNearbyAlerts(LocalDisasterDatabase.getReceivedSOS().slice(0, 4));
    });

    return () => {
      unsubDevices();
      unsubPackets();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isHolding) {
      interval = setInterval(() => {
        setSosHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval!);
            setIsHolding(false);
            onTriggerSOS();
            return 0;
          }
          return prev + 8;
        });
      }, 100);
    } else {
      setSosHoldProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHolding, onTriggerSOS]);

  return (
    <div className="space-y-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card-elevated p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 dark:border-white/10"
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Welcome, {savedName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected Offline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
            Your phone is linked to {devices.length} nearby community nodes via Bluetooth Low Energy.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-200 font-bold backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-pulse" />
            <span>{devices.length} Neighbors active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-900 dark:text-slate-200 font-bold backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>GPS Satellite Locked</span>
          </div>
        </div>
      </motion.div>

      {activeSOSList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-100/90 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-bold animate-pulse shadow-md shadow-rose-600/30">
              SOS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-950 dark:text-rose-200 uppercase tracking-wider">
                  Your SOS Distress Signal is Active
                </span>
                <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100 px-2 py-0.5 rounded-full font-bold">
                  Relaying to Helpers
                </span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-200 font-semibold mt-0.5">
                "{activeSOSList[0].message}" — Broadcasting over phone-to-phone Bluetooth.
              </p>
            </div>
          </div>
          <button
            id="view-active-sos-btn"
            onClick={() => onNavigate('alerts')}
            className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Check SOS Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="relative rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl border border-rose-500/30 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white"
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-black/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20">
              <LifeBuoy className="w-3.5 h-3.5 text-rose-200" />
              <span>One-Tap Emergency Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Need Immediate Rescue or Medical Help?
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 max-w-xl leading-relaxed font-medium">
              Tap and hold below. Your phone will immediately alert nearby community volunteers, doctors, and rescue squads with your exact GPS location and blood group.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative">
              <button
                id="main-screen-sos-hold-btn"
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                onClick={onTriggerSOS}
                className="w-48 sm:w-52 h-16 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 active:scale-95 font-extrabold text-sm tracking-wide shadow-2xl border-2 border-white/90 flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden"
              >
                {isHolding && (
                  <span
                    className="absolute left-0 top-0 bottom-0 bg-rose-200/90 transition-all"
                    style={{ width: `${sosHoldProgress}%` }}
                  />
                )}
                <AlertTriangle className="w-5 h-5 text-rose-600 relative z-10 animate-pulse" />
                <span className="relative z-10 font-extrabold">
                  {isHolding ? `HOLDING (${Math.round(sosHoldProgress)}%)` : 'SEND SOS NOW'}
                </span>
              </button>
            </div>
            <span className="text-[11px] text-rose-100 font-bold">
              Click or hold 1s for instant dispatch
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('map')}
          className="glass-card glass-card-hover p-5 space-y-3 cursor-pointer group border border-slate-200 dark:border-white/10"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Find Safe Shelters &amp; Water
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              View marked evacuation camps, medical clinics, and clean water points on an offline map.
            </p>
          </div>
          <div className="pt-1 flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400">
            <span>Open Shelter Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('alerts')}
          className="glass-card glass-card-hover p-5 space-y-3 cursor-pointer group border border-slate-200 dark:border-white/10"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Community Safety Alerts
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Stay aware of flooded roads, fallen powerlines, and verified safety announcements.
            </p>
          </div>
          <div className="pt-1 flex items-center gap-1 text-xs font-bold text-rose-800 dark:text-rose-400">
            <span>View Recent Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('mesh')}
          className="glass-card glass-card-hover p-5 space-y-3 cursor-pointer group border border-slate-200 dark:border-white/10"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              Nearby Helpers &amp; Devices
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              See who is close to you ({devices.length} active phones) and simulate phone relay packets.
            </p>
          </div>
          <div className="pt-1 flex items-center gap-1 text-xs font-bold text-sky-800 dark:text-sky-400">
            <span>See Connected Devices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('guides')}
          className="glass-card glass-card-hover p-5 space-y-3 cursor-pointer group border border-slate-200 dark:border-white/10"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              First-Aid &amp; Survival Guides
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Step-by-step pictures and advice for severe bleeding, CPR, burns, and purifying water.
            </p>
          </div>
          <div className="pt-1 flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
            <span>Read Step-by-Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 glass-card p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                Recent Help Requests &amp; Updates Nearby
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Transmitted phone-to-phone within your community
              </p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 cursor-pointer flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {nearbyAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-white/10 font-medium">
                No active distress alerts currently reported in your area. Everything is peaceful.
              </div>
            ) : (
              nearbyAlerts.map((alert, idx) => {
                const isCritical = alert.severity === 'CRITICAL';
                return (
                  <div
                    key={alert.id || idx}
                    onClick={() => onNavigate('alerts')}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-white/10 transition-all cursor-pointer space-y-1.5 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isCritical ? 'Needs Urgent Help' : 'Assistance Needed'}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                        {alert.emergencyType}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-950 dark:text-white">
                      {alert.senderName}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="lg:col-span-5 glass-card p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-white/10">
          <div className="border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
              Quick Safety Checklist
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Important reminders during an active disaster
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 flex items-start gap-3 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-slate-950 dark:text-white block font-bold">Store Safe Drinking Water</strong>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Aim for 3 liters per person per day. Boil water for 1 minute before drinking if municipal supply fails.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 flex items-start gap-3 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-slate-950 dark:text-white block font-bold">Conserve Phone Battery</strong>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Turn screen brightness down and avoid playing videos. Disaster Net uses low-energy Bluetooth.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 flex items-start gap-3 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-slate-950 dark:text-white block font-bold">Know Your Nearest Shelter</strong>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Check the Shelter Map to know high-ground locations before floodwaters rise.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
