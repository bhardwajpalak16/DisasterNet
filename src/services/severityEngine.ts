import { EmergencyType, SeverityLevel, TriageResult } from '../types';

interface SeverityRule {
  keywords: string[];
  severity: SeverityLevel;
  weight: number;
  reason: string;
}

const CRITICAL_KEYWORDS = [
  'unconscious',
  'trapped',
  'severe bleeding',
  'arterial bleed',
  'bleeding heavily',
  'immediate life threat',
  'collapsed',
  'buried under rubble',
  'crushed',
  'not breathing',
  'cardiac arrest',
  'drowning',
  'submerged',
  'suffocating',
  'airway blocked',
  'infant trapped',
  'child unconscious',
  'amputation',
  'head trauma',
  'cyanosis',
];

const HIGH_KEYWORDS = [
  'serious injury',
  'active fire',
  'fire spreading',
  'unsafe structure',
  'roof collapsing',
  'wall cracked',
  'rising floodwater',
  'water up to chest',
  'water neck high',
  'fracture',
  'broken bone',
  'deep laceration',
  'severe burn',
  'smoke inhalation',
  'asthma attack',
  'diabetic shock',
  'pregnant in labor',
  'elderly fallen',
];

const MEDIUM_KEYWORDS = [
  'need water',
  'clean water',
  'dehydrated',
  'need food',
  'starving',
  'need shelter',
  'lost roof',
  'evacuated',
  'medicine needed',
  'insulin needed',
  'prescription refill',
  'fever',
  'mild hypothermia',
  'cuts and scrapes',
  'minor injury',
  'disabled assistance',
];

const LOW_KEYWORDS = [
  'information request',
  'non-urgent',
  'road status',
  'power outage only',
  'lost property',
  'pet inquiry',
  'cellular update',
  'check-in',
  'safe and sound',
  'shelter location inquiry',
];

export function classifyEmergency(
  emergencyType: EmergencyType,
  description: string,
  peopleCount: number = 1
): TriageResult {
  const text = description.toLowerCase().trim();
  const matchedKeywords: string[] = [];
  let calculatedScore = 20;

  let baseSeverity: SeverityLevel = 'MEDIUM';
  if (['trapped', 'severe_bleeding', 'unconscious', 'structural_collapse'].includes(emergencyType)) {
    baseSeverity = 'CRITICAL';
    calculatedScore += 50;
  } else if (['active_fire', 'flood_surge', 'medical_urgent'].includes(emergencyType)) {
    baseSeverity = 'HIGH';
    calculatedScore += 35;
  } else if (['food_water', 'shelter_needed'].includes(emergencyType)) {
    baseSeverity = 'MEDIUM';
    calculatedScore += 15;
  } else {
    baseSeverity = 'LOW';
    calculatedScore += 5;
  }

  for (const kw of CRITICAL_KEYWORDS) {
    if (text.includes(kw)) {
      matchedKeywords.push(kw);
      calculatedScore += 30;
    }
  }

  for (const kw of HIGH_KEYWORDS) {
    if (text.includes(kw)) {
      matchedKeywords.push(kw);
      calculatedScore += 18;
    }
  }

  for (const kw of MEDIUM_KEYWORDS) {
    if (text.includes(kw)) {
      matchedKeywords.push(kw);
      calculatedScore += 10;
    }
  }

  for (const kw of LOW_KEYWORDS) {
    if (text.includes(kw)) {
      matchedKeywords.push(kw);
      calculatedScore -= 8;
    }
  }

  if (peopleCount > 3) {
    calculatedScore += 15;
  }

  let finalSeverity: SeverityLevel = baseSeverity;
  let reason = '';
  let recommendedAction = '';

  if (
    calculatedScore >= 70 ||
    matchedKeywords.some((k) => CRITICAL_KEYWORDS.includes(k)) ||
    ['trapped', 'severe_bleeding', 'unconscious'].includes(emergencyType)
  ) {
    finalSeverity = 'CRITICAL';
    reason = matchedKeywords.length > 0
      ? `Critical life threat indicator matched: "${matchedKeywords.slice(0, 3).join('", "')}". Immediate peer dispatch required.`
      : `High-risk incident category (${emergencyType.replace('_', ' ')}). Priority flagged as life-threatening.`;
    recommendedAction = 'Immediate BLE broadcast to all nearby nodes. Alert nearest volunteer and responder with high-volume alarm.';
  } else if (
    calculatedScore >= 45 ||
    matchedKeywords.some((k) => HIGH_KEYWORDS.includes(k)) ||
    ['active_fire', 'flood_surge'].includes(emergencyType)
  ) {
    finalSeverity = 'HIGH';
    reason = matchedKeywords.length > 0
      ? `Urgent hazards detected: "${matchedKeywords.slice(0, 3).join('", "')}". Elevated danger to safety.`
      : `Elevated danger from ${emergencyType.replace('_', ' ')}. Prompt assistance needed.`;
    recommendedAction = 'Relay to nearest volunteer units. Coordinate evacuation to secondary safe zones.';
  } else if (calculatedScore >= 25 || emergencyType === 'food_water' || emergencyType === 'shelter_needed') {
    finalSeverity = 'MEDIUM';
    reason = 'Basic survival need or non-fatal condition. Sustenance and shelter logistics required.';
    recommendedAction = 'Queue for regional relief center distribution and community volunteer visit.';
  } else {
    finalSeverity = 'LOW';
    reason = 'Informational or advisory bulletin. No direct threat to physical safety identified.';
    recommendedAction = 'Log to offline community bulletin board without preempting critical emergency channels.';
  }

  return {
    severity: finalSeverity,
    score: Math.min(Math.max(calculatedScore, 10), 100),
    matchedKeywords,
    reason,
    recommendedAction,
  };
}

export function getSeverityBadgeStyle(severity: SeverityLevel): {
  bg: string;
  text: string;
  border: string;
  pulse: boolean;
  label: string;
} {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-950/80',
        text: 'text-rose-400',
        border: 'border-rose-600',
        pulse: true,
        label: 'CRITICAL PRIORITY',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-950/80',
        text: 'text-amber-400',
        border: 'border-amber-600',
        pulse: false,
        label: 'HIGH PRIORITY',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-950/80',
        text: 'text-yellow-400',
        border: 'border-yellow-600',
        pulse: false,
        label: 'MEDIUM PRIORITY',
      };
    case 'LOW':
      return {
        bg: 'bg-emerald-950/80',
        text: 'text-emerald-400',
        border: 'border-emerald-600',
        pulse: false,
        label: 'LOW PRIORITY',
      };
  }
}
