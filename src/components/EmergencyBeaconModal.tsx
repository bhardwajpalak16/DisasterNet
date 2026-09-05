import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Zap,
  Flashlight,
  Sun,
  X,
  Maximize2,
  Minimize2,
  Radio,
  Sliders,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { emergencyAudio, SirenMode } from '../services/audioAlert';
import {
  emergencyLight,
  LightMode,
  LightColor,
  LightState,
} from '../services/emergencyLightService';

interface EmergencyBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'siren' | 'light';
}

export const EmergencyBeaconModal: React.FC<EmergencyBeaconModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'siren',
}) => {
  const [activeTab, setActiveTab] = useState<'siren' | 'light'>(initialTab);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [sirenMode, setSirenMode] = useState<SirenMode>('hi-lo');
  const [sirenVolume, setSirenVolume] = useState<number>(0.45);

  const [lightState, setLightState] = useState<LightState>(emergencyLight.getState());
  const [isFullscreenStrobe, setIsFullscreenStrobe] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const unsubAudio = emergencyAudio.subscribe((active, mode) => {
      setIsSirenActive(active);
      setSirenMode(mode);
    });

    const unsubLight = emergencyLight.subscribe((state) => {
      setLightState(state);
    });

    setSirenVolume(emergencyAudio.getVolume());

    return () => {
      unsubAudio();
      unsubLight();
    };
  }, []);

  const toggleSiren = () => {
    emergencyAudio.toggleSiren(sirenMode);
  };

  const handleSelectSirenMode = (mode: SirenMode) => {
    setSirenMode(mode);
    emergencyAudio.setSirenMode(mode);
  };

  const handleVolumeChange = (val: number) => {
    setSirenVolume(val);
    emergencyAudio.setVolume(val);
  };

  const toggleLight = () => {
    emergencyLight.toggleLight();
  };

  const handleLightModeChange = (mode: LightMode) => {
    emergencyLight.setMode(mode);
    if (!lightState.isActive) {
      emergencyLight.startLight(mode);
    }
  };

  const handleLightColorChange = (color: LightColor) => {
    emergencyLight.setColor(color);
  };

  const handleBrightnessChange = (b: number) => {
    emergencyLight.setBrightness(b);
  };

  const handleToggleHardwareTorch = async () => {
    await emergencyLight.toggleHardwareTorch();
  };

  // Dual Emergency Beacon: Turn on both Siren and Strobe
  const handleDualDistressBeacon = () => {
    if (isSirenActive && lightState.isActive) {
      emergencyAudio.stopSiren();
      emergencyLight.stopLight();
    } else {
      if (!isSirenActive) emergencyAudio.startSiren('hi-lo');
      if (!lightState.isActive) emergencyLight.startLight('strobe-rapid', 'white');
    }
  };

  const sirenOptions: { id: SirenMode; name: string; desc: string; icon: string }[] = [
    {
      id: 'hi-lo',
      name: 'Dual-Tone Hi-Lo',
      desc: 'European Ambulance / Rescue Horn (660Hz / 920Hz)',
      icon: '🚑',
    },
    {
      id: 'wail',
      name: 'Urgent Wail',
      desc: 'Classic Police / Fire sweeping siren with thick resonance',
      icon: '🚨',
    },
    {
      id: 'yelp',
      name: 'Tactical Yelp',
      desc: 'High-speed rapid cycling alert for imminent danger',
      icon: '⚡',
    },
    {
      id: 'piercing',
      name: 'SAR Distress Alarm',
      desc: 'Piercing dual tone penetrating rubble & outdoor noise',
      icon: '🔊',
    },
  ];

  const lightModeOptions: { id: LightMode; label: string; desc: string }[] = [
    { id: 'solid', label: 'Solid High-Beam', desc: 'Continuous bright flashlight & camp lantern' },
    { id: 'strobe-rapid', label: '8 Hz Rapid Strobe', desc: 'Blinding rescue team & helicopter beacon' },
    { id: 'strobe-warning', label: '4 Hz Warning Flash', desc: 'Steady hazard identification flasher' },
    { id: 'sos', label: 'SOS Morse Optical', desc: 'Official ... --- ... flashing signal rhythm' },
    { id: 'hazard-police', label: 'Hazard Red/Blue', desc: 'Alternating high-visibility dual strobe' },
    { id: 'pulse', label: 'Breathing Beacon', desc: '1 Hz gentle location marker for darkness' },
  ];

  const colorOptions: { id: LightColor; name: string; hex: string; bgClass: string }[] = [
    { id: 'white', name: 'Ultra-White', hex: '#FFFFFF', bgClass: 'bg-white' },
    { id: 'amber', name: 'Rescue Amber', hex: '#F59E0B', bgClass: 'bg-amber-400' },
    { id: 'red', name: 'Distress Red', hex: '#EF4444', bgClass: 'bg-rose-500' },
    { id: 'blue', name: 'Emergency Blue', hex: '#3B82F6', bgClass: 'bg-blue-500' },
    { id: 'green', name: 'All-Clear Green', hex: '#10B981', bgClass: 'bg-emerald-500' },
  ];

  const getColorHex = (c: LightColor) => {
    switch (c) {
      case 'white':
        return '#FFFFFF';
      case 'amber':
        return '#F59E0B';
      case 'red':
        return '#EF4444';
      case 'blue':
        return '#3B82F6';
      case 'green':
        return '#10B981';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <>
      {/* Fullscreen High-Power Strobe Blaster Overlay */}
      <AnimatePresence>
        {isFullscreenStrobe && lightState.isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 select-none cursor-pointer transition-colors"
            style={{
              backgroundColor: lightState.isIlluminated
                ? getColorHex(lightState.color)
                : '#000000',
              opacity: lightState.isIlluminated ? lightState.brightness : 1,
            }}
            onClick={() => setIsFullscreenStrobe(false)}
          >
            <div className="w-full flex justify-between items-center z-10 pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md border border-white/20">
                {lightState.mode.toUpperCase()} ACTIVE
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreenStrobe(false);
                }}
                className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </button>
            </div>

            <div className="text-center p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/20 text-white max-w-sm space-y-2 shadow-2xl z-10">
              <h3 className="text-lg font-bold tracking-wide">Handheld Rescue Beacon</h3>
              <p className="text-xs text-white/80">
                Hold phone screen pointing outward toward rescuers, boats, or aircraft.
              </p>
              <div className="text-[11px] text-white/60 pt-2 font-medium">
                Tap anywhere to close fullscreen
              </div>
            </div>

            <div className="pb-4 z-10">
              <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                Luminance: {Math.round(lightState.brightness * 100)}% • Mode: {lightState.color}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-card-elevated border border-white/70 dark:border-white/15 p-5 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.45)] text-stone-900 dark:text-stone-100 flex flex-col gap-5 relative scrollbar-thin"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
                      <span>Emergency Beacon &amp; Siren</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 font-semibold">
                        Acoustic &amp; Optical SAR
                      </span>
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      High-decibel emergency siren and multi-mode rescue strobe flashlight
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="close-beacon-modal-btn"
                  onClick={onClose}
                  className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Master Dual Distress Action Bar */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-sky-500/15 border border-rose-500/30 dark:border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isSirenActive || lightState.isActive
                        ? 'bg-rose-500 animate-ping'
                        : 'bg-stone-400 dark:bg-stone-600'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-white">
                      All-Out Distress Signal (Siren + Strobe)
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-300">
                      {isSirenActive && lightState.isActive
                        ? 'Both Siren and Strobe Light are blaring.'
                        : 'Fire both audio siren and screen strobe together for maximum rescue attention.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDualDistressBeacon}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap ${
                    isSirenActive && lightState.isActive
                      ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-900'
                      : 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {isSirenActive && lightState.isActive ? 'Stop Both Signals' : 'Blast Siren & Strobe'}
                  </span>
                </button>
              </div>

              {/* Navigation Tabs (Siren / Light) */}
              <div className="flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-slate-800/80 border border-stone-200/80 dark:border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('siren')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'siren'
                      ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Loud Siren Sounds</span>
                  {isSirenActive && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('light')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'light'
                      ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-white shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Strobe Light &amp; Flashlight</span>
                  {lightState.isActive && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>
              </div>

              {/* TAB 1: SIREN CONTROLS & ANIMATIONS */}
              {activeTab === 'siren' && (
                <div className="space-y-5">
                  {/* Visual Soundwave & Beacon Animation Stage */}
                  <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-stone-900 via-[#101422] to-stone-950 text-white flex flex-col items-center justify-center border border-white/15 shadow-inner">
                    {/* Concentric Acoustic Shockwaves Animation */}
                    {isSirenActive && (
                      <>
                        <div className="absolute w-44 h-44 rounded-full border-2 border-rose-500/40 animate-ping pointer-events-none" />
                        <div className="absolute w-64 h-64 rounded-full border border-amber-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
                        <div className="absolute w-88 h-88 rounded-full border border-rose-400/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
                      </>
                    )}

                    {/* Central Glowing Acoustic Core */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <motion.div
                        animate={
                          isSirenActive
                            ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all border-4 ${
                          isSirenActive
                            ? 'bg-rose-600 border-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.8)] text-white'
                            : 'bg-stone-800 border-stone-700 text-stone-400'
                        }`}
                      >
                        {isSirenActive ? (
                          <Volume2 className="w-9 h-9 animate-pulse" />
                        ) : (
                          <VolumeX className="w-8 h-8" />
                        )}
                      </motion.div>

                      <div className="text-center">
                        <div className="text-sm font-bold tracking-wide">
                          {isSirenActive ? `Siren Active (${sirenMode.toUpperCase()})` : 'Siren Inactive'}
                        </div>
                        <div className="text-xs text-stone-400">
                          {isSirenActive
                            ? 'Loud synthesizer blasting to alert search teams'
                            : 'Click the button below to start sounding'}
                        </div>
                      </div>

                      {/* Live Oscillating Audio Equalizer Bars */}
                      <div className="flex items-end gap-1.5 h-10 pt-2">
                        {[18, 32, 14, 28, 40, 22, 35, 12, 38, 25].map((h, i) => (
                          <motion.span
                            key={i}
                            animate={
                              isSirenActive
                                ? { height: [6, h, 8, h + 4, 6] }
                                : { height: 4 }
                            }
                            transition={{
                              repeat: Infinity,
                              duration: 0.4 + (i % 4) * 0.15,
                              ease: 'easeInOut',
                            }}
                            className={`w-1.5 rounded-full ${
                              isSirenActive
                                ? 'bg-gradient-to-t from-rose-500 to-amber-400'
                                : 'bg-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Master Sound Button inside visualizer */}
                    <div className="pt-4 z-10">
                      <button
                        type="button"
                        id="toggle-master-siren-btn"
                        onClick={toggleSiren}
                        className={`px-8 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
                          isSirenActive
                            ? 'bg-white text-stone-900 hover:bg-stone-100'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/40'
                        }`}
                      >
                        {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span>{isSirenActive ? 'Silence Siren' : 'Sound Emergency Siren'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Siren Sound Type Selection */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Select Siren Sound Mode:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sirenOptions.map((opt) => {
                        const isSelected = sirenMode === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectSirenMode(opt.id)}
                            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 backdrop-blur-md ${
                              isSelected
                                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 shadow-sm'
                                : 'bg-white/70 dark:bg-slate-800/60 border-stone-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-xl flex-shrink-0">{opt.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-900 dark:text-white">
                                  {opt.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-semibold">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                                {opt.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-stone-200/80 dark:border-white/10 flex items-center gap-4 backdrop-blur-md">
                    <Volume2 className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                          Siren Decibel Volume
                        </span>
                        <span className="font-bold text-stone-900 dark:text-white">
                          {Math.round(sirenVolume * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={sirenVolume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-stone-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STROBE LIGHT & FLASHLIGHT CONTROLS */}
              {activeTab === 'light' && (
                <div className="space-y-5">
                  {/* Light Simulator Stage */}
                  <div
                    className="relative overflow-hidden rounded-3xl p-6 flex flex-col items-center justify-center border border-white/20 transition-all duration-150 min-h-[170px]"
                    style={{
                      backgroundColor:
                        lightState.isActive && lightState.isIlluminated
                          ? getColorHex(lightState.color)
                          : '#0d1117',
                      color:
                        lightState.isActive &&
                        lightState.isIlluminated &&
                        (lightState.color === 'white' || lightState.color === 'amber')
                          ? '#1c1917'
                          : '#FFFFFF',
                      boxShadow:
                        lightState.isActive && lightState.isIlluminated
                          ? `0 0 45px ${getColorHex(lightState.color)}66`
                          : 'none',
                    }}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                      <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg">
                        <Zap className="w-7 h-7" />
                      </div>

                      <div className="font-extrabold text-sm tracking-wide">
                        {lightState.isActive
                          ? `${lightState.mode.toUpperCase()} ACTIVE`
                          : 'Emergency Light Off'}
                      </div>
                      <p className="text-xs max-w-xs opacity-80">
                        {lightState.isActive
                          ? `Flashing in ${lightState.color.toUpperCase()} at ${Math.round(
                              lightState.brightness * 100
                            )}% intensity.`
                          : 'Select a light mode or open Fullscreen Blaster.'}
                      </p>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          id="toggle-master-light-btn"
                          onClick={toggleLight}
                          className="px-5 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white font-bold text-xs backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{lightState.isActive ? 'Turn Off Light' : 'Ignite Light'}</span>
                        </button>

                        <button
                          type="button"
                          id="launch-fullscreen-strobe-btn"
                          onClick={() => {
                            if (!lightState.isActive) emergencyLight.startLight();
                            setIsFullscreenStrobe(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/25 hover:bg-white/35 text-white font-bold text-xs backdrop-blur-md border border-white/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Fullscreen Blaster</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hardware Camera Torch Button if Available */}
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-stone-200/80 dark:border-white/10 flex items-center justify-between gap-3 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Flashlight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-white">
                          Phone Camera LED Flashlight
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {lightState.hardwareTorchActive
                            ? 'Physical back-camera LED is turned ON.'
                            : 'Turn on real hardware rear LED (supported mobile browsers).'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleHardwareTorch}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        lightState.hardwareTorchActive
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-white/15 hover:bg-stone-100'
                      }`}
                    >
                      <Flashlight className="w-3 h-3" />
                      <span>{lightState.hardwareTorchActive ? 'LED On' : 'Turn On LED'}</span>
                    </button>
                  </div>

                  {/* Strobe / Light Mode Options */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Light &amp; Strobe Pattern:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {lightModeOptions.map((opt) => {
                        const isSelected = lightState.mode === opt.id && lightState.isActive;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleLightModeChange(opt.id)}
                            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-2.5 backdrop-blur-md ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 shadow-sm'
                                : 'bg-white/70 dark:bg-slate-800/60 border-stone-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            <Zap
                              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                isSelected
                                  ? 'text-amber-500'
                                  : 'text-stone-400 dark:text-stone-500'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-900 dark:text-white">
                                  {opt.label}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-semibold">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                                {opt.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Screen Optical Filter Color:
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {colorOptions.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleLightColorChange(c.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-all ${
                            lightState.color === c.id
                              ? 'border-stone-900 dark:border-white ring-2 ring-amber-400/50 bg-white/90 dark:bg-slate-700 font-bold'
                              : 'border-stone-200 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span
                            className={`w-3 h-3 rounded-full border border-black/20 ${c.bgClass}`}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brightness Slider */}
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-stone-200/80 dark:border-white/10 flex items-center gap-4 backdrop-blur-md">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                          Luminescence / Brightness
                        </span>
                        <span className="font-bold text-stone-900 dark:text-white">
                          {Math.round(lightState.brightness * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1.0"
                        step="0.05"
                        value={lightState.brightness}
                        onChange={(e) => handleBrightnessChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-stone-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
