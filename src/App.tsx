import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { OfflineMapScreen } from './components/OfflineMapScreen';
import { IncidentScreen } from './components/IncidentScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { BleMeshScreen } from './components/BleMeshScreen';
import { SurvivalGuidesScreen } from './components/SurvivalGuidesScreen';
import { SosModal } from './components/SosModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { SplashScreen } from './components/SplashScreen';
import { LandingPage } from './components/LandingPage';
import { SignUpPage } from './components/SignUpPage';
import { FloatingAiChatbot } from './components/FloatingAiChatbot';
import { EmergencyBeaconModal } from './components/EmergencyBeaconModal';
import { AlertOctagon, ArrowRight } from 'lucide-react';
import { UserProfile } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function DisasterNetAppContent() {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState<'splash' | 'landing' | 'signup' | 'dashboard'>('splash');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [airplaneMode, setAirplaneMode] = useState<boolean>(true);
  const [bleActive, setBleActive] = useState<boolean>(true);
  const [gpsActive, setGpsActive] = useState<boolean>(true);
  const [batterySaver, setBatterySaver] = useState<boolean>(false);

  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isBeaconOpen, setIsBeaconOpen] = useState<boolean>(false);
  const [beaconInitialTab, setBeaconInitialTab] = useState<'siren' | 'light'>('siren');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string>('Citizen');

  useEffect(() => {
    const saved = localStorage.getItem('disaster_net_profile');
    const savedRole = localStorage.getItem('disaster_net_role');
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const handleOpenBeacon = (tab: 'siren' | 'light' = 'siren') => {
    setBeaconInitialTab(tab);
    setIsBeaconOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden ${
        isDark ? 'dark-canvas text-slate-100' : 'paper-bg text-stone-900'
      }`}
    >
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/15 blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 rounded-full bg-sky-500/10 dark:bg-sky-500/15 blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {currentPage === 'splash' && (
          <SplashScreen onComplete={() => setCurrentPage('landing')} />
        )}

        {currentPage === 'landing' && (
          <LandingPage
            onGoToSignUp={() => setCurrentPage('signup')}
            onGoToDashboard={() => setCurrentPage('dashboard')}
            onTriggerSOS={() => setIsSosModalOpen(true)}
          />
        )}

        {currentPage === 'signup' && (
          <SignUpPage
            onComplete={(profile) => {
              setUserProfile(profile);
              const savedRole = localStorage.getItem('disaster_net_role');
              if (savedRole) setUserRole(savedRole);
              setCurrentPage('dashboard');
            }}
            onBackToLanding={() => setCurrentPage('landing')}
            onSkipToDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'dashboard' && (
          <>
            <Navbar
              airplaneMode={airplaneMode}
              setAirplaneMode={setAirplaneMode}
              bleActive={bleActive}
              setBleActive={setBleActive}
              gpsActive={gpsActive}
              setGpsActive={setGpsActive}
              batterySaver={batterySaver}
              setBatterySaver={setBatterySaver}
              onOpenProfile={() => setIsProfileOpen(true)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onNavigateToLanding={() => setCurrentPage('landing')}
              userName={userProfile?.name}
              userRole={userRole}
              onOpenBeacon={handleOpenBeacon}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24">
              {activeTab === 'home' && (
                <HomeScreen
                  onTriggerSOS={() => setIsSosModalOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  gpsActive={gpsActive}
                  userProfile={userProfile}
                />
              )}

              {activeTab === 'sos' && (
                <div className="space-y-6">
                  <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent border border-rose-500/30 dark:border-rose-500/20 backdrop-blur-md">
                    <div className="max-w-2xl space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold">
                        <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
                        <span>Emergency Assistance Dispatcher</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
                        Send Emergency SOS Broadcast
                      </h2>
                      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                        Broadcast your exact coordinates and medical situation directly to nearby citizens,
                        emergency responders, and search &amp; rescue teams over decentralized peer-to-peer Bluetooth mesh.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          id="open-sos-form-trigger"
                          onClick={() => setIsSosModalOpen(true)}
                          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <span>Open Emergency Dispatch Form</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          id="open-beacon-from-sos-trigger"
                          onClick={() => handleOpenBeacon('siren')}
                          className="px-5 py-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-semibold text-sm border border-stone-200 dark:border-white/10 shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                          <span>Siren &amp; Strobe Beacon HUD</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <AlertsScreen />
                </div>
              )}

              {activeTab === 'map' && <OfflineMapScreen gpsActive={gpsActive} />}

              {activeTab === 'incidents' && <IncidentScreen gpsActive={gpsActive} />}

              {activeTab === 'alerts' && <AlertsScreen />}

              {activeTab === 'mesh' && (
                <BleMeshScreen
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  setAirplaneMode={setAirplaneMode}
                />
              )}

              {activeTab === 'guides' && (
                <SurvivalGuidesScreen onOpenBeacon={handleOpenBeacon} />
              )}
            </main>

            {activeTab !== 'home' && (
              <button
                type="button"
                id="floating-emergency-sos-btn"
                onClick={() => setIsSosModalOpen(true)}
                className="fixed bottom-20 left-5 z-30 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg flex items-center gap-2 border border-rose-500 cursor-pointer active:scale-95 transition-all"
              >
                <AlertOctagon className="w-4 h-4 animate-pulse" />
                <span>SEND SOS</span>
              </button>
            )}

            <footer className="h-12 bg-white/70 dark:bg-slate-900/70 border-t border-stone-200/70 dark:border-white/10 flex flex-wrap items-center px-4 sm:px-6 text-xs text-stone-500 dark:text-stone-400 justify-between gap-3 select-none backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-stone-800 dark:text-stone-200 font-bold">Disaster Net</span>
                <span className="text-stone-400 dark:text-stone-600">•</span>
                <span>Offline Community Mesh Network</span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-stone-500 dark:text-stone-400">
                <span>Bluetooth P2P: Active</span>
                <span>GPS: Satellite Linked</span>
                <span className="hidden sm:inline">Zero Internet Required</span>
              </div>
            </footer>
          </>
        )}

        {/* Flowing Type Google Assistant */}
        <FloatingAiChatbot
          onTriggerSOS={() => setIsSosModalOpen(true)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenBeacon={handleOpenBeacon}
        />

        {/* Emergency Beacon & Siren HUD Modal */}
        <EmergencyBeaconModal
          isOpen={isBeaconOpen}
          onClose={() => setIsBeaconOpen(false)}
          initialTab={beaconInitialTab}
        />

        <SosModal
          isOpen={isSosModalOpen}
          onClose={() => setIsSosModalOpen(false)}
          gpsActive={gpsActive}
          onSOSCreated={() => {}}
        />

        <ProfileSettingsModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DisasterNetAppContent />
    </ThemeProvider>
  );
}
