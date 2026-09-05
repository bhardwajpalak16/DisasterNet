import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LifeBuoy,
  Volume2,
  CheckCircle2,
  XCircle,
  Search,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { SURVIVAL_GUIDES } from '../data/survivalGuides';
import { emergencyAudio } from '../services/audioAlert';
import { emergencyLight, LightState } from '../services/emergencyLightService';

interface SurvivalGuidesScreenProps {
  onOpenBeacon?: (tab?: 'siren' | 'light') => void;
}

export const SurvivalGuidesScreen: React.FC<SurvivalGuidesScreenProps> = ({
  onOpenBeacon,
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>('guide-flood');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMorsePlaying, setIsMorsePlaying] = useState<boolean>(false);
  const [lightState, setLightState] = useState<LightState>(emergencyLight.getState());
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = emergencyLight.subscribe((state) => {
      setLightState(state);
    });
    return () => unsub();
  }, []);

  const activeGuide =
    SURVIVAL_GUIDES.find((g) => g.id === selectedGuideId) || SURVIVAL_GUIDES[0];

  const handlePlayMorse = () => {
    if (isMorsePlaying) return;
    setIsMorsePlaying(true);
    emergencyAudio.playMorseCodeSOS(() => {
      setIsMorsePlaying(false);
    });
  };

  const handleToggleStrobe = () => {
    if (onOpenBeacon) {
      onOpenBeacon('light');
    } else {
      emergencyLight.toggleLight('strobe-rapid', 'white');
    }
  };

  const toggleCheckStep = (stepKey: string) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const filteredGuides = SURVIVAL_GUIDES.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.disasterType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-white/60 dark:border-white/10"
      >
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Offline First-Aid &amp; Survival Guides
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              Offline Ready
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Step-by-step procedures for mass trauma, CPR, flood rescue, and emergency audio beacons.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="play-morse-sos-btn"
            onClick={handlePlayMorse}
            disabled={isMorsePlaying}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isMorsePlaying
                ? 'bg-rose-600 border-rose-700 text-white animate-pulse shadow-md shadow-rose-600/30'
                : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 border-stone-200/70 dark:border-white/10'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{isMorsePlaying ? 'Playing Morse SOS...' : 'Sound Morse SOS'}</span>
          </button>

          <button
            id="toggle-screen-strobe-btn"
            onClick={handleToggleStrobe}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
              lightState.isActive
                ? 'bg-amber-500 border-amber-600 text-white animate-pulse shadow-md shadow-amber-500/30'
                : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200 border-stone-200/70 dark:border-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{lightState.isActive ? 'Strobe Active (Configure)' : 'Screen Strobe & Torch'}</span>
          </button>

          {onOpenBeacon && (
            <button
              id="open-beacon-from-guides-btn"
              onClick={() => onOpenBeacon('siren')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Siren &amp; Beacon HUD</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search first aid topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-2">
            {filteredGuides.map((guide) => {
              const isSelected = guide.id === activeGuide.id;

              return (
                <button
                  key={guide.id}
                  id={`guide-tab-${guide.disasterType}`}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 dark:bg-rose-600 text-white border-stone-900 dark:border-rose-600 shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 border-stone-200/70 dark:border-white/10 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold">{guide.title}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {guide.disasterType}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-stone-200' : 'text-stone-500 dark:text-stone-400'}`}>
                    {guide.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 glass-card p-6 space-y-6 border border-white/60 dark:border-white/10">
          <div className="border-b border-stone-200/70 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                {activeGuide.disasterType}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500">•</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Field Proven Safety Guide</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-2">
              {activeGuide.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
              {activeGuide.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Step-by-Step Instructions
            </h3>
            <div className="space-y-3">
              {activeGuide.steps.map((step, idx) => {
                const stepKey = `${activeGuide.id}-step-${idx}`;
                const isDone = !!checkedSteps[stepKey];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheckStep(stepKey)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 backdrop-blur-md ${
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/60 border-stone-200/70 dark:border-white/10 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-400 dark:border-slate-500 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {isDone ? '✓' : step.step}
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold ${isDone ? 'line-through opacity-70' : 'text-stone-900 dark:text-white'}`}>
                        {step.title}
                      </h4>
                    </div>

                    <ul className="pl-7 space-y-1 text-xs text-stone-600 dark:text-stone-300 list-disc">
                      {step.instructions.map((inst, i) => (
                        <li key={i} className={isDone ? 'line-through opacity-70' : ''}>
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>WHAT TO DO</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {activeGuide.dos.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-rose-50/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold text-xs">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>WHAT NOT TO DO</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {activeGuide.donts.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
