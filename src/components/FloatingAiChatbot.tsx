import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RefreshCw,
  AlertTriangle,
  MapPin,
  HeartPulse,
  Radio,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionType?: 'sos' | 'map' | 'guides' | 'mesh' | 'siren' | 'light';
  isStreaming?: boolean;
}

interface FloatingAiChatbotProps {
  onTriggerSOS?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenBeacon?: (tab?: 'siren' | 'light') => void;
}

const DEFAULT_GREETING: ChatMessage = {
  id: 'greeting',
  sender: 'assistant',
  text: 'Hi, I am Aegis — your offline emergency guardian for Disaster Net (Google Offline AI). I run entirely offline without cellular network or Wi-Fi to guide you through emergency SOS broadcasts, locating safe shelters, Bluetooth mesh relays, and life-saving first aid. How can I protect and assist you right now?',
  timestamp: 'Just now',
};

const OFFLINE_RESPONSES: Record<
  string,
  { text: string; actionType?: 'sos' | 'map' | 'guides' | 'mesh' | 'siren' | 'light' }
> = {
  sos: {
    text: 'To broadcast an emergency SOS: Tap the red "SEND SOS" button. Your phone transmits your exact GPS coordinates, medical ID, and emergency details over phone-to-phone Bluetooth mesh with zero cellular or Wi-Fi connectivity.',
    actionType: 'sos',
  },
  siren: {
    text: 'Disaster Net features a high-decibel acoustic siren suite with 4 distinct modes: European Dual-Tone Hi-Lo Horn, Urgent Police Wail, Tactical Yelp, and SAR Distress Alarm. Tap below to launch the Emergency Beacon & Siren HUD.',
    actionType: 'siren',
  },
  light: {
    text: 'The Emergency Light & Strobe suite provides: Solid High-Beam Torch, 8 Hz Helicopter Rescue Strobe, 4 Hz Warning Flash, and official Morse Code optical SOS (... --- ...). You can also turn on the rear camera LED flashlight.',
    actionType: 'light',
  },
  shelter: {
    text: 'Offline Shelter Map is active! You can view verified evacuation camps, field hospitals, and clean drinking water distribution points sorted by proximity to your GPS satellite fix.',
    actionType: 'map',
  },
  bleeding: {
    text: 'Immediate First-Aid for Severe Bleeding:\n1. Apply firm, continuous direct pressure with a clean cloth.\n2. Keep wounded limb elevated above heart level.\n3. If blood soaks through, do not remove initial cloth—stack more on top.\n4. If arterial spurting continues, apply a tourniquet 2-3 inches above the wound.\n5. Broadcast an SOS distress signal immediately.',
    actionType: 'guides',
  },
  burn: {
    text: 'First-Aid for Burns:\n1. Cool burn immediately under clean, cold running water for at least 10 minutes.\n2. Never apply ice, butter, grease, or ointments.\n3. Remove constrictive rings and clothing before tissue swelling starts.\n4. Cover loosely with sterile non-adhesive dressing.',
    actionType: 'guides',
  },
  trapped: {
    text: 'Survival Protocol if Trapped in Rubble / Debris:\n1. Cover your mouth and nose with cloth to filter toxic particulate dust.\n2. Avoid shouting continuously to preserve oxygen; instead, tap rhythmically on metal pipes or walls in sets of three (Morse SOS rhythm: tap-tap-tap).\n3. Turn on the Screen Strobe or Morse SOS in the Emergency Beacon tool.',
    actionType: 'light',
  },
  water: {
    text: 'Safe Water Purification in Emergencies:\n1. Bring water to a rolling boil for 1 full minute.\n2. If boiling is impossible, filter through clean cloth, then add water purification tablets or 2 drops unscented household chlorine bleach per liter.\n3. Inspect the Shelter Map for tested emergency water points.',
    actionType: 'map',
  },
  mesh: {
    text: 'How Disaster Net Bluetooth Mesh Works:\nNearby phones create an automatic ad-hoc chain without towers or internet. When an SOS or alert is issued, it relays hop-by-hop across devices (up to 120m per hop) until reaching emergency coordinators.',
    actionType: 'mesh',
  },
};

export const FloatingAiChatbot: React.FC<FloatingAiChatbotProps> = ({
  onTriggerSOS,
  onNavigateTab,
  onOpenBeacon,
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '🚨 Broadcast SOS', query: 'How do I broadcast an emergency SOS?' },
    { label: '🔊 Siren Sounds', query: 'Tell me about the emergency siren sounds' },
    { label: '⚡ Strobe Light', query: 'How does the emergency strobe light work?' },
    { label: '📍 Nearest Shelter', query: 'Where is the nearest shelter and water?' },
    { label: '🩸 Stop Bleeding', query: 'First aid steps for severe bleeding' },
    { label: '📶 BLE Mesh', query: 'How does the phone Bluetooth mesh work offline?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const toggleVoiceMode = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice speech recognition is not supported in this browser environment. You can type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    const lower = textToSend.toLowerCase();

    // Check offline heuristics
    let matchedKey: string | null = null;
    if (lower.includes('sos') || lower.includes('distress') || lower.includes('help') || lower.includes('emergency') || lower.includes('rescue')) {
      matchedKey = 'sos';
    } else if (lower.includes('siren') || lower.includes('alarm') || lower.includes('sound') || lower.includes('horn') || lower.includes('yelp') || lower.includes('wail') || lower.includes('hilo')) {
      matchedKey = 'siren';
    } else if (lower.includes('light') || lower.includes('strobe') || lower.includes('flash') || lower.includes('torch') || lower.includes('morse') || lower.includes('beacon')) {
      matchedKey = 'light';
    } else if (lower.includes('shelter') || lower.includes('map') || lower.includes('evacuat') || lower.includes('hospital') || lower.includes('clinic')) {
      matchedKey = 'shelter';
    } else if (lower.includes('bleed') || lower.includes('wound') || lower.includes('cut') || lower.includes('tourniquet')) {
      matchedKey = 'bleeding';
    } else if (lower.includes('burn') || lower.includes('fire') || lower.includes('scald')) {
      matchedKey = 'burn';
    } else if (lower.includes('trap') || lower.includes('rubble') || lower.includes('collaps') || lower.includes('debris')) {
      matchedKey = 'trapped';
    } else if (lower.includes('water') || lower.includes('drink') || lower.includes('purif') || lower.includes('boil') || lower.includes('thirst')) {
      matchedKey = 'water';
    } else if (lower.includes('mesh') || lower.includes('bluetooth') || lower.includes('relay') || lower.includes('hop') || lower.includes('ble') || lower.includes('radio')) {
      matchedKey = 'mesh';
    }

    try {
      let replyText = '';
      let replyAction: 'sos' | 'map' | 'guides' | 'mesh' | 'siren' | 'light' | undefined = undefined;

      if (matchedKey && OFFLINE_RESPONSES[matchedKey]) {
        replyText = OFFLINE_RESPONSES[matchedKey].text;
        replyAction = OFFLINE_RESPONSES[matchedKey].actionType;
      } else {
        replyText = `Aegis Offline Protocol:\n\n• For immediate distress dispatch, tap "Broadcast SOS".\n• To attract nearby rescue squads, use the "Emergency Siren Sounds" or "Strobe Torch".\n• To find food, water, and evacuation camps, view the "Shelter Map".\n• To review step-by-step first-aid, open "First Aid & Survival Guides".`;
      }

      await new Promise((resolve) => setTimeout(resolve, 350));

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: replyAction,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(replyText);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Aegis is operating offline on local storage. Tap "Broadcast SOS" or inspect the "Shelter Map" for immediate guidance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (actionType?: string) => {
    if (actionType === 'sos' && onTriggerSOS) {
      onTriggerSOS();
      setIsOpen(false);
    } else if (actionType === 'siren' && onOpenBeacon) {
      onOpenBeacon('siren');
      setIsOpen(false);
    } else if (actionType === 'light' && onOpenBeacon) {
      onOpenBeacon('light');
      setIsOpen(false);
    } else if (actionType === 'map' && onNavigateTab) {
      onNavigateTab('map');
      setIsOpen(false);
    } else if (actionType === 'guides' && onNavigateTab) {
      onNavigateTab('guides');
      setIsOpen(false);
    } else if (actionType === 'mesh' && onNavigateTab) {
      onNavigateTab('mesh');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Flowing Ambient Google Light Bar at Screen Bottom when Assistant is Open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="fixed bottom-0 left-0 right-0 h-1.5 z-40 google-flowing-ribbon pointer-events-none shadow-[0_-4px_24px_rgba(66,133,244,0.6)]"
          />
        )}
      </AnimatePresence>

      {/* Floating Aegis "Flowing Type" Launcher Pill */}
      <div className="fixed bottom-5 right-5 z-40">
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative p-[2px] rounded-full google-flowing-gradient google-flowing-glow transition-all duration-300 shadow-[0_10px_35px_rgba(66,133,244,0.35)]"
        >
          <button
            type="button"
            id="google-assistant-launcher-btn"
            onClick={() => setIsOpen(!isOpen)}
            title="Launch Aegis (Google Offline AI)"
            className="px-4 py-2.5 rounded-full bg-white dark:bg-[#0c101c] text-slate-950 dark:text-slate-100 flex items-center gap-3 cursor-pointer select-none backdrop-blur-xl border border-slate-300 dark:border-white/10 group shadow-md"
          >
            {/* Fluid Google 4-Color Flowing Wave / Dots */}
            <div className="flex items-center gap-1.5 px-0.5">
              <span className="w-2.5 h-2.5 rounded-full google-dot-blue animate-[google-pulse-dots_1.4s_ease-in-out_infinite]" />
              <span className="w-2.5 h-2.5 rounded-full google-dot-red animate-[google-pulse-dots_1.4s_ease-in-out_infinite_0.2s]" />
              <span className="w-2.5 h-2.5 rounded-full google-dot-yellow animate-[google-pulse-dots_1.4s_ease-in-out_infinite_0.4s]" />
              <span className="w-2.5 h-2.5 rounded-full google-dot-green animate-[google-pulse-dots_1.4s_ease-in-out_infinite_0.6s]" />
            </div>

            <div className="text-left">
              <div className="text-xs font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5">
                <span>Aegis</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">
                {isListening ? 'Listening to voice...' : 'Offline Intelligence'}
              </div>
            </div>

            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 group-hover:rotate-45 transition-transform ml-1" />
          </button>
        </motion.div>
      </div>

      {/* Main "Flowing Type" Assistant Glassmorphic Dialog with Flowing Window Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.92 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="fixed bottom-20 right-3 sm:right-6 z-50 w-[95vw] sm:w-[430px] max-h-[620px] h-[560px] p-[2px] rounded-[28px] flowing-window-border flowing-window-subtle shadow-[0_28px_80px_rgba(15,23,42,0.35)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.7)]"
          >
            <div className="w-full h-full flex flex-col rounded-[26px] overflow-hidden bg-white dark:bg-[#0c101c] backdrop-blur-2xl text-slate-950 dark:text-slate-100 border border-slate-200 dark:border-white/10">
              {/* Top Flowing Iridescent Liquid Light Ribbon */}
              <div className="h-1.5 w-full google-flowing-ribbon flex-shrink-0" />

              {/* Flowing Window Header with OS Control Dots & Title */}
              <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-[#0c101c] border-b border-slate-200 dark:border-white/10 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  {/* Flowing Window Control Dots */}
                  <div className="flex items-center gap-1.5 pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) window.speechSynthesis.cancel();
                        setIsOpen(false);
                      }}
                      className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Close window"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) window.speechSynthesis.cancel();
                        setIsOpen(false);
                      }}
                      className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors cursor-pointer"
                      title="Minimize window"
                    />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>

                  <div className="h-5 w-px bg-slate-300 dark:bg-white/10" />

                  <div className="relative p-[1.5px] rounded-xl google-flowing-gradient">
                    <div className="w-7 h-7 rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center">
                      <div className="flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full google-dot-blue animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full google-dot-red animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full google-dot-yellow animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full google-dot-green animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold tracking-tight text-slate-950 dark:text-white">
                        Aegis
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 font-bold shadow-2xs">
                        Google AI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      Disaster Net • Offline Emergency Guardian
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    id="assistant-voice-toggle-btn"
                    onClick={toggleVoiceMode}
                    title={voiceEnabled ? 'Mute voice guidance' : 'Enable voice guidance'}
                    className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      voiceEnabled
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold'
                        : 'text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    id="assistant-reset-btn"
                    onClick={() => {
                      if (isSpeaking) window.speechSynthesis.cancel();
                      setMessages([DEFAULT_GREETING]);
                    }}
                    title="Reset conversation"
                    className="p-2 text-slate-600 hover:text-slate-950 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    id="assistant-close-btn"
                    onClick={() => {
                      if (isSpeaking) window.speechSynthesis.cancel();
                      setIsOpen(false);
                    }}
                    title="Close assistant"
                    className="p-2 text-slate-600 hover:text-slate-950 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Speaking / Listening Flowing Wave Ribbon */}
              {(isSpeaking || isListening) && (
                <div className="px-4 py-2 google-flowing-gradient text-white flex items-center justify-between text-xs backdrop-blur-md shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-0.5 h-4">
                      <span className="w-1 bg-white rounded-full google-wave-bar" />
                      <span className="w-1 bg-white rounded-full google-wave-bar [animation-delay:0.15s]" />
                      <span className="w-1 bg-white rounded-full google-wave-bar [animation-delay:0.3s]" />
                      <span className="w-1 bg-white rounded-full google-wave-bar [animation-delay:0.45s]" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide">
                      {isListening ? 'Listening to your voice...' : 'Aegis is speaking...'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                      setIsListening(false);
                    }}
                    className="text-[10px] text-white/90 hover:text-white underline cursor-pointer font-bold"
                  >
                    Stop
                  </button>
                </div>
              )}

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-slate-50/50 dark:bg-transparent">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                          isUser
                            ? 'bg-slate-950 text-white dark:bg-sky-600'
                            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 shadow-xs'
                        }`}
                      >
                        {isUser ? (
                          <User className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full google-dot-blue" />
                            <span className="w-1 h-1 rounded-full google-dot-red" />
                            <span className="w-1 h-1 rounded-full google-dot-green" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs transition-all ${
                          isUser
                            ? 'bg-slate-950 text-white dark:bg-sky-600'
                            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-950 dark:text-slate-100 font-medium'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {msg.actionType && !isUser && (
                          <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-white/10">
                            <button
                              type="button"
                              onClick={() => handleActionClick(msg.actionType)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                              {msg.actionType === 'sos' && (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Open SOS Dispatcher</span>
                                </>
                              )}
                              {msg.actionType === 'siren' && (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Open Siren Sounds HUD</span>
                                </>
                              )}
                              {msg.actionType === 'light' && (
                                <>
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Launch Strobe Light &amp; Torch</span>
                                </>
                              )}
                              {msg.actionType === 'map' && (
                                <>
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>View Shelters on Map</span>
                                </>
                              )}
                              {msg.actionType === 'guides' && (
                                <>
                                  <HeartPulse className="w-3.5 h-3.5" />
                                  <span>Open First-Aid Guide</span>
                                </>
                              )}
                              {msg.actionType === 'mesh' && (
                                <>
                                  <Radio className="w-3.5 h-3.5" />
                                  <span>Check BLE Mesh Status</span>
                                </>
                              )}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <span
                          className={`text-[9px] mt-1.5 block font-medium ${
                            isUser ? 'text-slate-300 dark:text-sky-200' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 rounded-2xl p-3 text-xs text-slate-900 dark:text-slate-200 flex items-center gap-2 shadow-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full google-dot-blue animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full google-dot-red animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full google-dot-yellow animate-bounce [animation-delay:0.4s]" />
                        <span className="w-1.5 h-1.5 rounded-full google-dot-green animate-bounce [animation-delay:0.6s]" />
                      </div>
                      <span className="text-[11px] font-semibold">Aegis is generating offline emergency response...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Chips */}
              <div className="px-3.5 pb-2.5 pt-1.5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 backdrop-blur-md">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-[10px] text-slate-800 dark:text-slate-300 font-bold uppercase tracking-wider">
                    Quick Voice Prompts:
                  </span>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">
                    Instant Answers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(item.query)}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 hover:border-sky-500 text-[11px] font-bold text-slate-900 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-all whitespace-nowrap cursor-pointer shadow-2xs active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flowing Input Box */}
              <div className="p-3 bg-slate-50 dark:bg-[#0c101c] border-t border-slate-200 dark:border-white/10 backdrop-blur-xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1 p-[1.5px] rounded-2xl google-flowing-gradient">
                    <div className="relative bg-white dark:bg-slate-900 rounded-[14px]">
                      <input
                        type="text"
                        id="assistant-input-box"
                        placeholder="Ask Aegis for offline emergency triage..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full pl-3.5 pr-9 py-2.5 rounded-[14px] bg-transparent text-xs text-slate-950 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none font-medium"
                      />
                      <button
                        type="button"
                        id="assistant-mic-btn"
                        onClick={startVoiceInput}
                        title="Speak to Aegis"
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-600 hover:text-slate-950 dark:hover:text-slate-200 transition-colors cursor-pointer ${
                          isListening ? 'text-red-500 animate-pulse' : ''
                        }`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="assistant-send-btn"
                    disabled={!input.trim() || loading}
                    className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:opacity-40 text-white shadow-md transition-all cursor-pointer flex-shrink-0 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
