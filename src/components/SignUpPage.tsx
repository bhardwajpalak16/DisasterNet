import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DisasterNetLogo } from './DisasterNetLogo';
import {
  User,
  Shield,
  Heart,
  Phone,
  Radio,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SignUpPageProps {
  onComplete: (profile: UserProfile) => void;
  onBackToLanding: () => void;
  onSkipToDashboard: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onComplete,
  onBackToLanding,
  onSkipToDashboard,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const defaultNodeId = `DN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const [name, setName] = useState('');
  const [role, setRole] = useState('Civilian');
  const [bloodGroup, setBloodGroup] = useState<UserProfile['bloodGroup']>('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [nodeId] = useState(defaultNodeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      id: nodeId,
      name: name.trim() || 'Community Member',
      bloodGroup,
      emergencyContact,
      emergencyPhone,
      allergies,
      medicalConditions,
    };

    localStorage.setItem('disaster_net_profile', JSON.stringify(profile));
    localStorage.setItem('disaster_net_node_id', nodeId);
    localStorage.setItem('disaster_net_role', role);

    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-x-hidden select-none transition-colors duration-300">
      <div className="fixed w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none -top-24 -right-24" />
      <div className="fixed w-96 h-96 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none -bottom-24 -left-24" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xl relative z-10 glass-card-elevated p-6 sm:p-8 space-y-6 border border-white/70 dark:border-white/10"
      >
        <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <DisasterNetLogo variant="horizontal" size="sm" showPulse={false} />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onBackToLanding}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-white/60 dark:bg-slate-800/60 border border-stone-200/70 dark:border-white/10 rounded-2xl text-stone-700 dark:text-stone-300 text-xs flex items-center gap-2.5 backdrop-blur-md">
          <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Device Node ID: <strong className="text-stone-900 dark:text-white">{nodeId}</strong> (Local phone storage only)</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Emergency Role
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="Civilian">Civilian / Community Member</option>
                  <option value="Community Volunteer">Community Volunteer</option>
                  <option value="Paramedic / EMT">Paramedic or EMT</option>
                  <option value="Fire & Rescue">Fire &amp; Rescue</option>
                  <option value="HAM Radio Operator">Radio Operator</option>
                  <option value="Medical Doctor">Doctor or Nurse</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Blood Group (Critical for First-Aid)
              </label>
              <div className="relative">
                <Heart className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as UserProfile['bloodGroup'])}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="Unknown">Not Sure / Unknown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Emergency Phone or Radio Channel
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +1 555-0192 or Walkie CH-3"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Emergency Contact Person (Family or Friend)
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. Alex Jenkins (Brother)"
              className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Allergies (Optional)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Medical Conditions (Optional)
              </label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Asthma, Diabetes"
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-300 bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-stone-200/70 dark:border-white/10 flex items-center gap-2 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Everything stays saved locally on your phone and works when offline.</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              id="skip-to-dashboard-btn"
              onClick={onSkipToDashboard}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs underline cursor-pointer order-2 sm:order-1"
            >
              Skip and continue anonymously &rarr;
            </button>

            <button
              type="submit"
              id="submit-node-registration-btn"
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-rose-600 dark:hover:bg-rose-700 active:scale-95 text-white font-medium text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer order-1 sm:order-2"
            >
              <span>Save Details &amp; Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
