import React, { useState, useEffect } from 'react';
import {
  Radio,
  WifiOff,
  Battery,
  MapPin,
  Volume2,
  VolumeX,
  User,
  Globe,
  Sun,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import { emergencyAudio } from '../services/audioAlert';
import { DisasterNetLogo } from './DisasterNetLogo';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  airplaneMode: boolean;
  setAirplaneMode: (val: boolean) => void;
  bleActive: boolean;
  setBleActive: (val: boolean) => void;
  gpsActive: boolean;
  setGpsActive: (val: boolean) => void;
  batterySaver: boolean;
  setBatterySaver: (val: boolean) => void;
  onOpenProfile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateToLanding?: () => void;
  userRole?: string;
  userName?: string;
  onOpenBeacon?: (tab?: 'siren' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  airplaneMode,
  setAirplaneMode,
  bleActive,
  setBleActive,
  gpsActive,
  setGpsActive,
  batterySaver,
  setBatterySaver,
  onOpenProfile,
  activeTab,
  setActiveTab,
  onNavigateToLanding,
  userRole,
  userName,
  onOpenBeacon,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [sirenOn, setSirenOn] = useState(false);
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}:${secs}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubAudio = emergencyAudio.subscribe((active) => {
      setSirenOn(active);
    });

    return () => {
      unsubAudio();
    };
  }, []);

  const toggleSiren = () => {
    emergencyAudio.toggleSiren();
  };

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'sos', label: 'Emergency SOS' },
    { id: 'map', label: 'Shelter Map' },
    { id: 'alerts', label: 'Community Alerts' },
    { id: 'incidents', label: 'Incident Reports' },
    { id: 'mesh', label: 'Nearby Helpers' },
    { id: 'guides', label: 'First Aid & Guides' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090D16]/90 backdrop-blur-xl border-b border-stone-200 dark:border-white/10 shadow-[0_4px_24px_0_rgba(0,0,0,0.06)] select-none transition-colors">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6">
        <div
          id="brand-logo"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <DisasterNetLogo size="sm" showPulse={false} />
          <div>
            <div className="flex items-center gap-2">
              <div className="text-base sm:text-lg font-black tracking-tight flex items-center leading-none">
                <span className="text-slate-950 dark:text-white">Disaster</span>
                <span className="text-[#EE2D42]">Net</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/70 font-bold shadow-2xs">
                Offline Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold hidden md:block">
              {userName ? `${userName} (${userRole || 'Citizen'}) • Stay Safe. Stay Connected.` : 'Stay Safe. Stay Connected.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Darker Mode'}
            className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800/80 hover:bg-stone-200 dark:hover:bg-slate-700/80 border border-stone-300 dark:border-white/10 text-stone-900 dark:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-stone-300 text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-800" />
                <span className="hidden sm:inline text-stone-800 text-[11px]">Dark Mode</span>
              </>
            )}
          </button>

          {onNavigateToLanding && (
            <button
              id="return-to-landing-btn"
              onClick={onNavigateToLanding}
              title="Return to Main Landing Page"
              className="px-3 py-1.5 bg-stone-100 dark:bg-slate-800/80 hover:bg-stone-200 dark:hover:bg-slate-700/80 border border-stone-300 dark:border-white/10 text-stone-900 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span className="hidden sm:inline">Main Page</span>
            </button>
          )}

          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] text-stone-600 dark:text-stone-400 font-bold uppercase tracking-wider">
              Network
            </span>
            <span className="text-xs text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {airplaneMode ? 'BLE Mesh' : 'Online'}
            </span>
          </div>

          <div className="h-6 w-px bg-stone-300 dark:bg-white/10 hidden sm:block"></div>

          {/* Real-time Clock (HH:MM:SS) */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-stone-600 dark:text-stone-400 font-bold uppercase tracking-wider">
              Real-Time
            </span>
            <span className="text-xs font-mono font-bold text-stone-950 dark:text-stone-100 tracking-wider">
              {timeStr || '00:00:00'}
            </span>
          </div>

          <div className="h-6 w-px bg-stone-300 dark:bg-white/10 hidden sm:block"></div>

          <button
            id="profile-settings-btn"
            onClick={onOpenProfile}
            className="px-3 py-1.5 bg-stone-100 dark:bg-slate-800/80 border border-stone-300 dark:border-white/10 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-900 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-rose-600" />
            <span>Medical ID</span>
          </button>
        </div>
      </div>

      <div className="bg-stone-50 dark:bg-slate-900/80 px-4 sm:px-6 py-2 border-t border-b border-stone-200 dark:border-white/10 text-xs backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="airplane-mode-toggle"
              onClick={() => setAirplaneMode(!airplaneMode)}
              title={airplaneMode ? 'Airplane Mode: ON (Works with zero cellular/Wi-Fi)' : 'Switch to Airplane Mode'}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                airplaneMode
                  ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-white dark:bg-slate-800 border-stone-300 dark:border-white/10 text-stone-800 dark:text-stone-200'
              }`}
            >
              <WifiOff className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>{airplaneMode ? 'Airplane Mode (Offline)' : 'Cellular Connected'}</span>
            </button>

            <button
              id="ble-radio-toggle"
              onClick={() => setBleActive(!bleActive)}
              title="Toggle Bluetooth radio"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                bleActive
                  ? 'bg-sky-100 dark:bg-sky-950/60 border-sky-400 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                  : 'bg-white dark:bg-slate-800 border-stone-300 dark:border-white/10 text-stone-600 dark:text-stone-400'
              }`}
            >
              <Radio className={`w-3 h-3 ${bleActive ? 'text-sky-700 dark:text-sky-400 animate-pulse' : 'text-stone-500'}`} />
              <span>Bluetooth: {bleActive ? 'Mesh Connected' : 'Off'}</span>
            </button>

            <button
              id="gps-lock-toggle"
              onClick={() => setGpsActive(!gpsActive)}
              title="Toggle satellite GPS"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                gpsActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-white dark:bg-slate-800 border-stone-300 dark:border-white/10 text-stone-600 dark:text-stone-400'
              }`}
            >
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>GPS: {gpsActive ? 'Satellite Fix' : 'Off'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="battery-saver-toggle"
              onClick={() => setBatterySaver(!batterySaver)}
              title="Toggle Battery Saver"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                batterySaver
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-white dark:bg-slate-800 border-stone-300 dark:border-white/10 text-stone-800 dark:text-stone-200'
              }`}
            >
              <Battery className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{batterySaver ? 'Battery Saver' : '88%'}</span>
            </button>

            {/* Emergency Siren Toggle */}
            <button
              id="emergency-siren-toggle"
              onClick={toggleSiren}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                sirenOn
                  ? 'bg-rose-600 border-rose-700 text-white animate-pulse shadow-md shadow-rose-600/30'
                  : 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-900/60'
              }`}
              title="Loud Emergency Siren Sound"
            >
              {sirenOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>{sirenOn ? 'Siren Active' : 'Sound Siren'}</span>
            </button>

            {/* Full Beacon & Siren Controls HUD opener */}
            {onOpenBeacon && (
              <button
                id="open-beacon-hud-btn"
                onClick={() => onOpenBeacon('siren')}
                className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-white/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                title="Open Emergency Beacon & Siren HUD"
              >
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                <span className="hidden sm:inline">Beacon HUD</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-2.5 bg-white/95 dark:bg-slate-900/80 border-b border-stone-200 dark:border-white/10 flex items-center overflow-x-auto scrollbar-none backdrop-blur-md">
        <nav className="flex items-center gap-2 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === item.id
                  ? 'bg-stone-900 dark:bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-slate-800/80 text-stone-800 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
