export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EmergencyType =
  | 'trapped'
  | 'severe_bleeding'
  | 'unconscious'
  | 'active_fire'
  | 'flood_surge'
  | 'structural_collapse'
  | 'medical_urgent'
  | 'food_water'
  | 'shelter_needed'
  | 'other';

export type ResourceType = 'shelter' | 'hospital' | 'relief_center' | 'police' | 'water_supply';

export type IncidentType =
  | 'flood_water'
  | 'road_blocked'
  | 'active_fire'
  | 'landslide'
  | 'downed_powerline'
  | 'bridge_damage'
  | 'gas_leak';

export interface UserProfile {
  id: string;
  name: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';
  allergies: string;
  medicalConditions: string[];
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: ResourceType;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  verified: boolean;
  status: 'open' | 'crowded' | 'full' | 'closed';
  address: string;
  supplies: string[];
  contactRadio: string;
  lastUpdated: string;
  distanceKm?: number;
}

export interface SOSMessage {
  id: string;
  userId: string;
  senderName: string;
  severity: SeverityLevel;
  emergencyType: EmergencyType;
  message: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: 'queued' | 'relaying' | 'delivered' | 'responding' | 'resolved' | 'received';
  ttl: number;
  peopleCount: number;
  relayCount: number;
  hopsTaken: number;
  triageReason: string;
  responders?: string[];
  bloodGroup?: string;
}

export interface IncidentReport {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: 'active' | 'investigating' | 'cleared';
  verifiedByPeers: number;
  waterDepthCm?: number;
  isPassable: boolean;
  reportedBy: string;
  ttl: number;
}

export interface BLEPacket {
  packetId: string;
  messageId: string;
  senderId: string;
  type: 'SOS' | 'INCIDENT' | 'ACK' | 'RESPOND_PING';
  payload: SOSMessage | IncidentReport | { ackMessageId: string; responderId: string; responderName: string };
  timestamp: number;
  ttl: number;
  relayCount: number;
  rssi?: number;
}

export interface BLEDevice {
  deviceId: string;
  deviceName: string;
  role: 'victim' | 'relay' | 'responder' | 'beacon';
  rssi: number;
  lastSeen: number;
  trustState: 'verified' | 'unverified' | 'mesh_peer';
  batteryLevel: number;
  hopsFromUser: number;
}

export interface SurvivalStep {
  step: number;
  title: string;
  instructions: string[];
  warning?: string;
}

export interface SurvivalGuide {
  id: string;
  disasterType: 'flood' | 'earthquake' | 'cyclone' | 'fire' | 'landslide' | 'first_aid';
  title: string;
  subtitle: string;
  iconName: string;
  steps: SurvivalStep[];
  criticalWarnings: string[];
  dos: string[];
  donts: string[];
}

export interface TriageResult {
  severity: SeverityLevel;
  score: number;
  matchedKeywords: string[];
  reason: string;
  recommendedAction: string;
}
