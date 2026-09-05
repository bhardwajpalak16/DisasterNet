import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Download,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { DisasterNetLogo } from './DisasterNetLogo';
import { UserProfile } from '../types';
import { LocalDisasterDatabase } from '../services/storage';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [profile, setProfile] = useState<UserProfile>(
    LocalDisasterDatabase.getUserProfile()
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    LocalDisasterDatabase.saveUserProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      profile: LocalDisasterDatabase.getUserProfile(),
      outbox: LocalDisasterDatabase.getOutboxSOS(),
      received: LocalDisasterDatabase.getReceivedSOS(),
      incidents: LocalDisasterDatabase.getIncidents(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster-net-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset local emergency database to defaults? This will clear test outbox messages.'
      )
    ) {
      LocalDisasterDatabase.resetDatabaseToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-lg glass-card-elevated border border-white/70 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6 text-stone-900 dark:text-white font-sans"
      >
        <div className="bg-white/40 dark:bg-slate-900/40 px-6 py-4 border-b border-stone-200/70 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DisasterNetLogo size="xs" showPulse={false} />
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                Medical ID &amp; Emergency Profile
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Stored safely on your phone only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Medical ID saved directly to on-device storage.</span>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Blood Group</label>
              <select
                value={profile.bloodGroup || 'O+'}
                onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={profile.emergencyContact || ''}
                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                placeholder="Phone or radio channel"
                className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Medical Conditions or Allergies</label>
            <input
              type="text"
              value={profile.medicalConditions?.join(', ') || ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  medicalConditions: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              placeholder="e.g. Asthma, Penicillin allergy, Diabetic"
              className="w-full px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-stone-300 dark:border-white/15 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer border border-stone-200/70 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-rose-600 hover:bg-stone-800 dark:hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Save Medical ID
            </button>
          </div>

          <div className="pt-4 border-t border-stone-200/70 dark:border-white/10 space-y-2">
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Phone Data &amp; Offline Backup
            </h3>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-700 border border-stone-200/70 dark:border-white/10 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Local Backup</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
