import {
  EmergencyResource,
  IncidentReport,
  SOSMessage,
  UserProfile,
  BLEDevice,
  BLEPacket,
} from '../types';
import { INITIAL_RESOURCES, DEFAULT_DISASTER_COORDS } from '../data/emergencyResources';

const STORAGE_KEYS = {
  USER_PROFILE: 'disasternet_user_profile',
  SOS_OUTBOX: 'disasternet_sos_outbox',
  SOS_RECEIVED: 'disasternet_sos_received',
  INCIDENTS: 'disasternet_incidents',
  RESOURCES: 'disasternet_resources',
  KNOWN_MESSAGE_IDS: 'disasternet_known_msg_ids',
  DISCOVERED_DEVICES: 'disasternet_devices',
  SETTINGS: 'disasternet_settings',
};

export const DEFAULT_USER: UserProfile = {
  id: 'usr-local-892',
  name: 'Alex Vance',
  emergencyContact: 'Elena Vance (Sister)',
  emergencyPhone: '+1-555-019-2831',
  bloodGroup: 'O+',
  allergies: 'Penicillin, NSAIDs',
  medicalConditions: ['Mild Asthma (Inhaler in pack)'],
};

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-901',
    type: 'flood_water',
    severity: 'HIGH',
    title: 'Flash Flood Inundation - Ring Road Underpass',
    description: 'Water depth approximately 1.4m (4.5 ft). Multiple stalled vehicles. Road impassable.',
    latitude: 26.4510,
    longitude: 80.3340,
    timestamp: Date.now() - 18 * 60 * 1000,
    status: 'active',
    verifiedByPeers: 4,
    waterDepthCm: 140,
    isPassable: false,
    reportedBy: 'MeshNode_Alpha',
    ttl: 4,
  },
  {
    id: 'inc-902',
    type: 'downed_powerline',
    severity: 'CRITICAL',
    title: 'High-Voltage Power Cable Submerged in Standing Water',
    description: 'Active sparking reported near Transformer #12. High electrocution hazard for pedestrians.',
    latitude: 26.4445,
    longitude: 80.3290,
    timestamp: Date.now() - 35 * 60 * 1000,
    status: 'active',
    verifiedByPeers: 6,
    isPassable: false,
    reportedBy: 'MeshNode_Charlie',
    ttl: 3,
  },
  {
    id: 'inc-903',
    type: 'road_blocked',
    severity: 'MEDIUM',
    title: 'Fallen Banyan Tree Blocking North Access Road',
    description: 'Single lane blocked by fallen branches. Small two-wheelers can squeeze through.',
    latitude: 26.4620,
    longitude: 80.3395,
    timestamp: Date.now() - 52 * 60 * 1000,
    status: 'investigating',
    verifiedByPeers: 3,
    isPassable: true,
    reportedBy: 'MeshNode_Beta',
    ttl: 2,
  },
];

export const INITIAL_RECEIVED_SOS: SOSMessage[] = [
  {
    id: 'DN-8F2A',
    userId: 'usr-sarah-331',
    senderName: 'Sarah Jenkins & 2 others',
    severity: 'CRITICAL',
    emergencyType: 'trapped',
    message: 'Person trapped inside building 2nd floor, water rising rapidly up stairwell. Need extraction boat.',
    latitude: 26.4499,
    longitude: 80.3319,
    timestamp: Date.now() - 12 * 60 * 1000,
    status: 'relaying',
    ttl: 4,
    peopleCount: 3,
    relayCount: 2,
    hopsTaken: 2,
    triageReason: 'Critical life threat indicator matched: "trapped", "water rising rapidly". Immediate peer dispatch required.',
    responders: ['Unit SAR-4'],
  },
  {
    id: 'DN-4B19',
    userId: 'usr-marcus-109',
    senderName: 'Marcus Cole',
    severity: 'HIGH',
    emergencyType: 'severe_bleeding',
    message: 'Compound leg fracture and severe deep laceration from collapsed masonry wall. Splinted but bleeding.',
    latitude: 26.4430,
    longitude: 80.3210,
    timestamp: Date.now() - 25 * 60 * 1000,
    status: 'responding',
    ttl: 3,
    peopleCount: 1,
    relayCount: 3,
    hopsTaken: 3,
    triageReason: 'Urgent hazards detected: "fracture", "deep laceration". Bleeding trauma protocol active.',
    responders: ['Apex Trauma Mobile Volunteer'],
  },
  {
    id: 'DN-1C90',
    userId: 'usr-priya-554',
    senderName: 'Priya Sharma (Infant Care)',
    severity: 'MEDIUM',
    emergencyType: 'food_water',
    message: 'Stranded on rooftop terrace with 4-month-old infant. Out of clean potable drinking water and baby formula.',
    latitude: 26.4580,
    longitude: 80.3355,
    timestamp: Date.now() - 48 * 60 * 1000,
    status: 'queued',
    ttl: 2,
    peopleCount: 2,
    relayCount: 1,
    hopsTaken: 1,
    triageReason: 'Basic sustenance and infant nutrition replenishment required.',
    responders: [],
  },
];

export const INITIAL_DEVICES: BLEDevice[] = [
  {
    deviceId: 'BLE-NODE-ALPHA',
    deviceName: 'Pixel 8 (Relay B)',
    role: 'relay',
    rssi: -62,
    lastSeen: Date.now() - 4000,
    trustState: 'verified',
    batteryLevel: 84,
    hopsFromUser: 1,
  },
  {
    deviceId: 'BLE-NODE-BETA',
    deviceName: 'Galaxy S23 (Volunteer/Responder C)',
    role: 'responder',
    rssi: -78,
    lastSeen: Date.now() - 9000,
    trustState: 'verified',
    batteryLevel: 67,
    hopsFromUser: 2,
  },
  {
    deviceId: 'BLE-NODE-GAMMA',
    deviceName: 'iPhone 15 (Victim Node A)',
    role: 'victim',
    rssi: -84,
    lastSeen: Date.now() - 15000,
    trustState: 'mesh_peer',
    batteryLevel: 42,
    hopsFromUser: 1,
  },
  {
    deviceId: 'BLE-BEACON-04',
    deviceName: 'Civic Shelter LoRa/BLE Gateway',
    role: 'beacon',
    rssi: -58,
    lastSeen: Date.now() - 2000,
    trustState: 'verified',
    batteryLevel: 98,
    hopsFromUser: 1,
  },
];

export class LocalDisasterDatabase {
  public static getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  }

  public static saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  public static getOutboxSOS(): SOSMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOS_OUTBOX);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addOutboxSOS(sos: SOSMessage): void {
    const list = this.getOutboxSOS();
    list.unshift(sos);
    localStorage.setItem(STORAGE_KEYS.SOS_OUTBOX, JSON.stringify(list));
    this.markMessageKnown(sos.id);
  }

  public static updateOutboxSOSStatus(id: string, status: SOSMessage['status']): void {
    const list = this.getOutboxSOS().map((msg) =>
      msg.id === id ? { ...msg, status } : msg
    );
    localStorage.setItem(STORAGE_KEYS.SOS_OUTBOX, JSON.stringify(list));
  }

  public static getReceivedSOS(): SOSMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOS_RECEIVED);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEYS.SOS_RECEIVED, JSON.stringify(INITIAL_RECEIVED_SOS));
      return INITIAL_RECEIVED_SOS;
    } catch {
      return INITIAL_RECEIVED_SOS;
    }
  }

  public static addReceivedSOS(sos: SOSMessage): boolean {
    if (this.isMessageKnown(sos.id)) {
      return false;
    }
    const list = this.getReceivedSOS();
    list.unshift(sos);
    localStorage.setItem(STORAGE_KEYS.SOS_RECEIVED, JSON.stringify(list));
    this.markMessageKnown(sos.id);
    return true;
  }

  public static updateReceivedSOS(updated: SOSMessage): void {
    const list = this.getReceivedSOS().map((item) =>
      item.id === updated.id ? updated : item
    );
    localStorage.setItem(STORAGE_KEYS.SOS_RECEIVED, JSON.stringify(list));
  }

  public static getIncidents(): IncidentReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
      return INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  }

  public static addIncident(incident: IncidentReport): void {
    const list = this.getIncidents();
    list.unshift(incident);
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(list));
  }

  public static verifyIncident(id: string): void {
    const list = this.getIncidents().map((inc) =>
      inc.id === id ? { ...inc, verifiedByPeers: inc.verifiedByPeers + 1 } : inc
    );
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(list));
  }

  public static getResources(): EmergencyResource[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
      return INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  }

  public static isMessageKnown(messageId: string): boolean {
    try {
      const known = JSON.parse(localStorage.getItem(STORAGE_KEYS.KNOWN_MESSAGE_IDS) || '[]');
      return known.includes(messageId);
    } catch {
      return false;
    }
  }

  public static markMessageKnown(messageId: string): void {
    try {
      const known = JSON.parse(localStorage.getItem(STORAGE_KEYS.KNOWN_MESSAGE_IDS) || '[]');
      if (!known.includes(messageId)) {
        known.push(messageId);
        if (known.length > 500) known.shift();
        localStorage.setItem(STORAGE_KEYS.KNOWN_MESSAGE_IDS, JSON.stringify(known));
      }
    } catch {
    }
  }

  public static resetDatabaseToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.SOS_OUTBOX);
    localStorage.removeItem(STORAGE_KEYS.SOS_RECEIVED);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.KNOWN_MESSAGE_IDS);
  }
}
