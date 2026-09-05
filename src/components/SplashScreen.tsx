import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DisasterNetLogo } from './DisasterNetLogo';
import { ShieldCheck, Radio, Database, ArrowRight, HeartPulse } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Initializing local offline database', icon: Database },
    { label: 'Connecting peer Bluetooth radio mesh', icon: Radio },
    { label: 'Caching vector map & safe shelter markers', icon: ShieldCheck },
    { label: 'Readying emergency first-aid & SOS triage', icon: HeartPulse },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + 5;
        if (next >= 25 && next < 50) setCurrentStep(1);
        else if (next >= 50 && next < 75) setCurrentStep(2);
        else if (next >= 75) setCurrentStep(3);
        return next;
      });
    }, 70);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const autoProceed = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(autoProceed);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none overflow-hidden transition-colors duration-300">
      <div className="absolute w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 glass-card-elevated p-7 sm:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.3)] text-center space-y-6 border border-white/70 dark:border-white/10"
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <DisasterNetLogo variant="full" size="xl" showPulse={true} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Works 100% Offline in Airplane Mode</span>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 rounded-2xl p-4 text-left space-y-3 backdrop-blur-md">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isFinished = progress >= (idx + 1) * 25 || progress === 100;
            const isCurrent = currentStep === idx && !isFinished;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-colors ${
                  isFinished
                    ? 'text-stone-800 dark:text-stone-200'
                    : isCurrent
                    ? 'text-stone-900 dark:text-white font-semibold'
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold flex-shrink-0 ${
                    isFinished
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                      : 'bg-white dark:bg-slate-700 border-stone-300 dark:border-white/10 text-stone-400'
                  }`}
                >
                  {isFinished ? '✓' : idx + 1}
                </div>
                <Icon className="w-3.5 h-3.5 flex-shrink-0 text-stone-500 dark:text-stone-400" />
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-2 bg-stone-200/80 dark:bg-slate-800 rounded-full overflow-hidden border border-stone-300/60 dark:border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            <span>Starting emergency modules</span>
            <span className="text-stone-800 dark:text-stone-200 font-bold">{progress}%</span>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="button"
            id="enter-disaster-net-splash-btn"
            onClick={onComplete}
            className="w-full py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-medium text-sm shadow-md shadow-rose-600/20 border border-rose-500 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{progress === 100 ? 'Enter Disaster Net' : 'Continue to Main Page'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
