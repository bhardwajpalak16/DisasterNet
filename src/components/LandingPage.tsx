import React from 'react';
import { motion } from 'motion/react';
import { DisasterNetLogo } from './DisasterNetLogo';
import {
  Radio,
  MapPin,
  HeartPulse,
  ArrowRight,
  UserPlus,
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Sun,
  Moon,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onGoToSignUp: () => void;
  onGoToDashboard: () => void;
  onTriggerSOS: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToSignUp,
  onGoToDashboard,
  onTriggerSOS,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden select-none transition-colors duration-300">
      <div className="fixed w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none -top-20 left-1/2 -translate-x-1/2" />
      <div className="fixed w-80 h-80 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none top-96 -left-20" />
      <div className="fixed w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none bottom-10 -right-20" />

      <header className="sticky top-0 z-40 bg-white/75 dark:bg-[#090D16]/80 backdrop-blur-xl border-b border-white/60 dark:border-white/10 shadow-[0_4px_24px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DisasterNetLogo variant="horizontal" size="sm" showPulse={false} />
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold shadow-2xs hidden sm:inline-block">
              Works 100% Offline
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="landing-theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Darker Mode'}
              className="p-2 rounded-xl bg-stone-100/80 dark:bg-slate-800/80 hover:bg-stone-200 dark:hover:bg-slate-700 border border-stone-200 dark:border-white/10 text-stone-700 dark:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-stone-300 text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="hidden md:inline text-stone-600 text-[11px]">Dark Mode</span>
                </>
              )}
            </button>

            <button
              id="landing-quick-sos-btn"
              onClick={onTriggerSOS}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>Emergency SOS</span>
            </button>

            <button
              id="landing-signup-nav-btn"
              onClick={onGoToSignUp}
              className="px-3.5 py-1.5 rounded-full bg-stone-100/90 dark:bg-slate-800/80 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 text-xs font-medium border border-stone-200 dark:border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span className="hidden sm:inline">Set Up Medical ID</span>
              <span className="sm:hidden">Sign Up</span>
            </button>

            <button
              id="landing-dashboard-nav-btn"
              onClick={onGoToDashboard}
              className="px-4 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-rose-600 dark:hover:bg-rose-700 active:scale-95 text-white text-xs font-medium shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Open Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-12 relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card-elevated p-6 sm:p-10 lg:p-12 text-center space-y-6 relative overflow-hidden border border-white/70 dark:border-white/10"
        >
          <div className="flex justify-center pb-2">
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
              <DisasterNetLogo variant="full" size="lg" showPulse={true} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-800 dark:text-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Reliable assistance when cellular towers and power go down</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
              Stay Safe &amp; Connected <br />
              <span className="text-rose-600 dark:text-rose-400">Even Without Internet</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              When storms, floods, or earthquakes knock out communication networks, <strong>Disaster Net</strong> connects nearby phones directly. Broadcast distress alerts, find safe shelters on offline maps, and receive life-saving first-aid instructions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="hero-go-dashboard-btn"
              onClick={onGoToDashboard}
              className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-medium text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-stone-200" />
              <span>Open Emergency Dashboard</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="hero-setup-profile-btn"
              onClick={onGoToSignUp}
              className="px-6 py-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-medium text-sm border border-stone-200 dark:border-white/10 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span>Save Your Medical ID</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="hero-instant-sos-btn"
              onClick={onTriggerSOS}
              className="px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-200 font-medium text-sm border border-rose-200 dark:border-rose-800 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>Send Quick SOS</span>
            </motion.button>
          </div>

          <div className="pt-4 border-t border-stone-200/50 dark:border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Zero cellular or Wi-Fi needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Private data stays on your phone
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Very low battery consumption
            </span>
          </div>
        </motion.section>

        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Simple Tools for Any Emergency
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              Designed to be intuitive, accessible, and dependable in high-stress moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div
              whileHover={{ y: -3 }}
              className="glass-card p-6 space-y-3.5 border border-white/60 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Safe Shelters &amp; Water
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Find marked high-ground camps, emergency medical stations, and clean drinking water points on an offline map that works with satellite GPS.
              </p>
              <div className="pt-1">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <span>Pre-cached for instant loading</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="glass-card p-6 space-y-3.5 border border-white/60 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-center shadow-xs">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Phone-to-Phone Emergency Help
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Send an SOS message directly to nearby neighbors and volunteers via Bluetooth. If rescue teams are farther away, other phones pass the message along.
              </p>
              <div className="pt-1">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <span>Automatic helper network</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="glass-card p-6 space-y-3.5 border border-white/60 dark:border-white/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Step-by-Step First Aid
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Access clear, illustrated guidance for stopping severe bleeding, treating burns, performing CPR, water purification, and surviving earthquakes.
              </p>
              <div className="pt-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <span>Always available offline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="glass-card p-6 sm:p-9 space-y-6 border border-white/60 dark:border-white/10">
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              How You Get Help During a Crisis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 space-y-2 backdrop-blur-md">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                Press the SOS Button
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Choose your emergency (medical, trapped, fire) and tap send. Your phone automatically includes your GPS coordinates and blood type.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 space-y-2 backdrop-blur-md">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                Neighbors Relay Your Alert
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Your phone reaches everyone within 100 meters. Their phones silently relay the alert to the next phone until it reaches rescue coordinators.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 space-y-2 backdrop-blur-md">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                Responders Reach You Safely
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                First-responders see your exact location on offline maps, know your medical needs in advance, and can dispatch aid immediately.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-stone-900 via-stone-950 to-black text-white rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          <DisasterNetLogo size="md" showPulse={false} className="mx-auto relative z-10" />
          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <h3 className="text-2xl font-bold tracking-tight">
              Ready to Explore Disaster Net?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Save your medical ID and open the simple dashboard to see safe shelters, active alerts, and step-by-step survival guides.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
            <button
              id="cta-enter-dashboard-btn"
              onClick={onGoToDashboard}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Dashboard</span>
            </button>

            <button
              id="cta-register-now-btn"
              onClick={onGoToSignUp}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-100 font-medium text-xs uppercase tracking-wider border border-white/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Save Medical Details</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 py-6 px-4 sm:px-6 text-stone-500 dark:text-stone-400 text-xs backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DisasterNetLogo size="xs" showPulse={false} />
            <span className="text-stone-800 dark:text-stone-200 font-bold">Disaster Net</span>
            <span>— Simple Offline Emergency Assistance</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={onGoToDashboard} className="hover:text-stone-800 dark:hover:text-white underline cursor-pointer">
              Dashboard
            </button>
            <button onClick={onGoToSignUp} className="hover:text-stone-800 dark:hover:text-white underline cursor-pointer">
              Medical ID Setup
            </button>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">100% Offline Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
