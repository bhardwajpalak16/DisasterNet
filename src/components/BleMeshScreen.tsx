import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Radio,
  Layers,
  CheckCircle2,
  RotateCcw,
  Signal,
  Battery,
  ArrowRight,
  Terminal,
  Check,
} from 'lucide-react';
import { BLEDevice } from '../types';
import { bleMesh, PacketLogEntry } from '../services/bleMeshService';
import { emergencyAudio } from '../services/audioAlert';

interface BleMeshScreenProps {
  onNavigateTab: (tab: string) => void;
  setAirplaneMode: (val: boolean) => void;
}

export const BleMeshScreen: React.FC<BleMeshScreenProps> = ({
  onNavigateTab,
  setAirplaneMode,
}) => {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [packetLogs, setPacketLogs] = useState<PacketLogEntry[]>([]);
  const [activeDemoStep, setActiveDemoStep] = useState<number>(1);
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null);

  const DEMO_STEPS = [
    {
      step: 1,
      title: '1. Airplane Mode Verification',
      actionText: 'Turn On Airplane Mode',
      desc: 'Verify that cellular & Wi-Fi are completely disabled and Disaster Net operates entirely offline.',
    },
    {
      step: 2,
      title: '2. Offline Map & Shelters',
      actionText: 'Load Local Shelters',
      desc: 'Confirm verified evacuation shelters and clean drinking water locations load instantly without internet.',
    },
    {
      step: 3,
      title: '3. Create Distress SOS',
      actionText: 'Generate SOS Alert',
      desc: 'Victim phone creates an emergency distress request with GPS coordinates and medical details.',
    },
    {
      step: 4,
      title: '4. Local Outbox Storage',
      actionText: 'Check Local Outbox',
      desc: 'Distress message enters the device outbox queue and begins Bluetooth Low Energy radio beacon.',
    },
    {
      step: 5,
      title: '5. Relay to Neighbor Phone',
      actionText: 'Execute Relay Hop',
      desc: 'A nearby neighbor device receives the packet, verifies authenticity, and forwards it to the next phone.',
    },
    {
      step: 6,
      title: '6. Responder Receives Distress Alert',
      actionText: 'Trigger Responder Notice',
      desc: 'A search and rescue volunteer receives the multi-hop alert and gets navigation directions to the victim.',
    },
    {
      step: 7,
      title: '7. Duplicate Message Prevention',
      actionText: 'Test Duplicate Filter',
      desc: 'Confirm the phone intelligently ignores duplicate broadcast packets so the battery is not wasted.',
    },
    {
      step: 8,
      title: '8. First-Aid Survival Guides',
      actionText: 'View First-Aid Steps',
      desc: 'Open the offline survival knowledge base for CPR, severe bleeding treatment, and safe drinking water.',
    },
  ];

  useEffect(() => {
    setDevices(bleMesh.getNearbyDevices());
    setPacketLogs(bleMesh.getPacketLogs());

    const unsubDev = bleMesh.subscribeToDevices((d) => setDevices(d));
    const unsubPkt = bleMesh.subscribeToPackets(() => {
      setPacketLogs(bleMesh.getPacketLogs());
    });

    return () => {
      unsubDev();
      unsubPkt();
    };
  }, []);

  const runStep = (stepNumber: number) => {
    setActiveDemoStep(stepNumber);

    if (stepNumber === 1) {
      setAirplaneMode(true);
    }

    const res = bleMesh.triggerHackathonSimulationStep(stepNumber);
    setDemoFeedback(`${res.title}: ${res.detail}`);
    emergencyAudio.playAlertTone(stepNumber === 6 ? 'critical' : 'ping');
  };

  const handleNextStep = () => {
    const next = activeDemoStep < 8 ? activeDemoStep + 1 : 1;
    runStep(next);
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
            <Radio className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-pulse" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Nearby Helper Phones &amp; Bluetooth Relay Demo
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold">
              Zero Internet
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Test how phones automatically connect to each other and pass emergency distress signals without cellular towers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runStep(1)}
            className="px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 text-xs font-semibold border border-stone-200/70 dark:border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </motion.div>

      <div className="glass-card p-5 space-y-4 border border-white/60 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/70 dark:border-white/10 pb-3">
          <div>
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Interactive Offline Verification
            </span>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              8-Step Bluetooth Mesh Demonstration
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">Step {activeDemoStep} of 8</span>
            <button
              id="next-demo-step-btn"
              onClick={handleNextStep}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-rose-600 dark:hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Next Step ({activeDemoStep < 8 ? activeDemoStep + 1 : 1})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {DEMO_STEPS.map((s) => (
            <button
              key={s.step}
              id={`demo-step-${s.step}`}
              onClick={() => runStep(s.step)}
              className={`p-2.5 rounded-2xl text-left border transition-all text-xs cursor-pointer ${
                activeDemoStep === s.step
                  ? 'bg-stone-900 dark:bg-rose-600 text-white border-stone-900 dark:border-rose-600 shadow-sm'
                  : 'bg-white/60 dark:bg-slate-800/60 border-stone-200/70 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px]">Step {s.step}</span>
                {activeDemoStep > s.step && (
                  <Check className={`w-3 h-3 ${activeDemoStep === s.step ? 'text-white' : 'text-emerald-500'}`} />
                )}
              </div>
              <p className={`text-[10px] mt-1 font-medium truncate ${activeDemoStep === s.step ? 'text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>
                {s.actionText}
              </p>
            </button>
          ))}
        </div>

        {demoFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs space-y-1 text-emerald-900 dark:text-emerald-200 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{DEMO_STEPS[activeDemoStep - 1].title}</span>
            </div>
            <p className="text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed pl-6">{demoFeedback}</p>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 glass-card p-5 flex flex-col justify-between space-y-4 border border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              How Messages Hop Phone to Phone
            </h3>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">2.4 GHz Bluetooth</span>
          </div>

          <div className="relative w-full h-44 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-stone-200/70 dark:border-white/10 flex items-center justify-around px-4 overflow-hidden backdrop-blur-md">
            <div className="flex flex-col items-center z-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-sm shadow-xs">
                A
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-white mt-1.5">Victim Phone</span>
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">Sends SOS</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-3 z-10">
              <div className="w-full h-1 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-1">Hop 1 (BLE)</span>
            </div>

            <div className="flex flex-col items-center z-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs">
                B
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-white mt-1.5">Neighbor Phone</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Relays Alert</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-3 z-10">
              <div className="w-full h-1 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-1">Hop 2 (BLE)</span>
            </div>

            <div className="flex flex-col items-center z-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shadow-xs">
                C
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-white mt-1.5">Rescue Squad</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Rushes to Help</span>
            </div>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>Range: Up to 120 meters between each phone</span>
            <span>Zero Wi-Fi or cellular needed</span>
          </div>
        </div>

        <div className="lg:col-span-5 glass-card p-5 flex flex-col justify-between space-y-3 border border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
              <Signal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Nearby Devices Found ({devices.length})
            </h3>
            <span className="text-xs text-stone-400 dark:text-stone-500">Scanning in background</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
            {devices.map((dev) => (
              <div
                key={dev.deviceId}
                className="bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 rounded-2xl p-3 text-xs flex items-center justify-between gap-2 backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 dark:text-white">{dev.deviceName}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-stone-200">
                      {dev.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">Distance: Approx. {Math.abs(dev.rssi + 40)}m</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                    <Battery className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{dev.batteryLevel}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200/70 dark:border-white/10 text-xs text-stone-500 dark:text-stone-400">
            Phones automatically detect each other without pairing or passwords.
          </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-3 border border-white/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-stone-700 dark:text-stone-300" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Live Phone Radio Log
            </h3>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {packetLogs.length} Packets Relayed
          </span>
        </div>

        <div className="bg-white/40 dark:bg-slate-900/60 rounded-2xl p-4 border border-stone-200/70 dark:border-white/10 font-mono text-xs space-y-2 max-h-48 overflow-y-auto backdrop-blur-md">
          {packetLogs.length === 0 ? (
            <p className="text-stone-400 dark:text-stone-500 font-sans text-xs">Waiting for Bluetooth radio packet activity...</p>
          ) : (
            packetLogs.map((log) => {
              let badgeColor = 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
              if (log.direction === 'TX') badgeColor = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
              if (log.direction === 'RELAY') badgeColor = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
              if (log.direction === 'DROPPED_DUPLICATE') badgeColor = 'bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-stone-300';

              return (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-stone-200/40 dark:border-white/5 font-sans"
                >
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                      {log.direction}
                    </span>
                    <span className="text-stone-800 dark:text-stone-200 text-xs">{log.summary}</span>
                  </div>
                  <span className="text-stone-400 dark:text-stone-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
