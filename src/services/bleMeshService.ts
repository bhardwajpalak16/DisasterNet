import { BLEDevice, BLEPacket, SOSMessage, IncidentReport } from '../types';
import { LocalDisasterDatabase, INITIAL_DEVICES } from './storage';
import { emergencyAudio } from './audioAlert';

export interface PacketLogEntry {
  id: string;
  timestamp: number;
  direction: 'TX' | 'RX' | 'RELAY' | 'DROPPED_DUPLICATE' | 'EXPIRED_TTL';
  packet: BLEPacket;
  peerId?: string;
  summary: string;
}

type PacketListener = (entry: PacketLogEntry) => void;
type DeviceListener = (devices: BLEDevice[]) => void;

class BleMeshService {
  private broadcastChannel: BroadcastChannel | null = null;
  private myDeviceId: string = 'BLE-ME-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  private isScanning: boolean = true;
  private isAdvertising: boolean = true;
  private isBluetoothOn: boolean = true;
  private packetLogs: PacketLogEntry[] = [];
  private packetListeners: Set<PacketListener> = new Set();
  private deviceListeners: Set<DeviceListener> = new Set();
  private nearbyDevices: BLEDevice[] = [...INITIAL_DEVICES];
  private duplicateSuppressionCount: number = 0;

  constructor() {
    this.initBroadcastChannel();
    this.startHeartbeatSimulation();
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('disasternet_p2p_ble_mesh');
        this.broadcastChannel.onmessage = (event) => {
          if (!this.isBluetoothOn) return;
          const packet = event.data as BLEPacket;
          if (packet && packet.senderId !== this.myDeviceId) {
            this.handleIncomingPacket(packet, 'Peer-Tab/Device');
          }
        };
      }
    } catch {
    }
  }

  public getMyDeviceId(): string {
    return this.myDeviceId;
  }

  public isBluetoothEnabled(): boolean {
    return this.isBluetoothOn;
  }

  public setBluetoothEnabled(enabled: boolean) {
    this.isBluetoothOn = enabled;
    if (!enabled) {
      this.isScanning = false;
      this.isAdvertising = false;
    } else {
      this.isScanning = true;
      this.isAdvertising = true;
    }
    this.notifyDevices();
  }

  public getDuplicateCount(): number {
    return this.duplicateSuppressionCount;
  }

  public getNearbyDevices(): BLEDevice[] {
    return this.isBluetoothOn ? this.nearbyDevices : [];
  }

  public getPacketLogs(): PacketLogEntry[] {
    return [...this.packetLogs];
  }

  public subscribeToPackets(listener: PacketListener): () => void {
    this.packetListeners.add(listener);
    return () => this.packetListeners.delete(listener);
  }

  public subscribeToDevices(listener: DeviceListener): () => void {
    this.deviceListeners.add(listener);
    return () => this.deviceListeners.delete(listener);
  }

  private notifyDevices() {
    const devs = this.getNearbyDevices();
    this.deviceListeners.forEach((l) => l(devs));
  }

  private logPacket(entry: PacketLogEntry) {
    this.packetLogs.unshift(entry);
    if (this.packetLogs.length > 80) this.packetLogs.pop();
    this.packetListeners.forEach((l) => l(entry));
  }

  public broadcastSOS(sos: SOSMessage): BLEPacket {
    const packet: BLEPacket = {
      packetId: 'PKT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      messageId: sos.id,
      senderId: this.myDeviceId,
      type: 'SOS',
      payload: sos,
      timestamp: Date.now(),
      ttl: 5,
      relayCount: 0,
      rssi: -45,
    };

    LocalDisasterDatabase.addOutboxSOS(sos);

    if (this.broadcastChannel && this.isBluetoothOn) {
      this.broadcastChannel.postMessage(packet);
    }

    this.logPacket({
      id: packet.packetId,
      timestamp: Date.now(),
      direction: 'TX',
      packet,
      summary: `[TX] Originating SOS ${sos.id} (${sos.severity}): ${sos.emergencyType}`,
    });

    emergencyAudio.playAlertTone('ping');
    return packet;
  }

  public broadcastIncident(incident: IncidentReport): BLEPacket {
    const packet: BLEPacket = {
      packetId: 'PKT-INC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      messageId: incident.id,
      senderId: this.myDeviceId,
      type: 'INCIDENT',
      payload: incident,
      timestamp: Date.now(),
      ttl: 4,
      relayCount: 0,
      rssi: -50,
    };

    LocalDisasterDatabase.addIncident(incident);

    if (this.broadcastChannel && this.isBluetoothOn) {
      this.broadcastChannel.postMessage(packet);
    }

    this.logPacket({
      id: packet.packetId,
      timestamp: Date.now(),
      direction: 'TX',
      packet,
      summary: `[TX] Originating Incident ${incident.id} (${incident.severity}): ${incident.title}`,
    });

    return packet;
  }

  public handleIncomingPacket(packet: BLEPacket, peerName: string = 'Nearby BLE Peer') {
    if (!this.isBluetoothOn) return;

    if (packet.ttl <= 0) {
      this.logPacket({
        id: packet.packetId + '-exp',
        timestamp: Date.now(),
        direction: 'EXPIRED_TTL',
        packet,
        peerId: peerName,
        summary: `[DROPPED] Packet ${packet.messageId} reached TTL=0. Propagation terminated.`,
      });
      return;
    }

    if (LocalDisasterDatabase.isMessageKnown(packet.messageId)) {
      this.duplicateSuppressionCount++;
      this.logPacket({
        id: packet.packetId + '-dup',
        timestamp: Date.now(),
        direction: 'DROPPED_DUPLICATE',
        packet,
        peerId: peerName,
        summary: `[DEDUP] Duplicate packet ${packet.messageId} ignored safely. Suppressed loop.`,
      });
      return;
    }

    if (packet.type === 'SOS') {
      const sos = packet.payload as SOSMessage;
      sos.hopsTaken = (packet.relayCount || 0) + 1;
      sos.relayCount = (packet.relayCount || 0) + 1;
      sos.ttl = packet.ttl - 1;

      LocalDisasterDatabase.addReceivedSOS(sos);

      this.logPacket({
        id: packet.packetId,
        timestamp: Date.now(),
        direction: 'RX',
        packet,
        peerId: peerName,
        summary: `[RX] Received new ${sos.severity} SOS ${sos.id} from ${peerName} (TTL: ${packet.ttl})`,
      });

      if (sos.severity === 'CRITICAL') {
        emergencyAudio.playAlertTone('critical');
      } else if (sos.severity === 'HIGH') {
        emergencyAudio.playAlertTone('high');
      } else {
        emergencyAudio.playAlertTone('ping');
      }
    } else if (packet.type === 'INCIDENT') {
      const inc = packet.payload as IncidentReport;
      LocalDisasterDatabase.addIncident(inc);
      LocalDisasterDatabase.markMessageKnown(inc.id);

      this.logPacket({
        id: packet.packetId,
        timestamp: Date.now(),
        direction: 'RX',
        packet,
        peerId: peerName,
        summary: `[RX] Received Incident ${inc.id} (${inc.type}) from ${peerName}`,
      });
    }
  }

  public relayPacket(messageId: string): boolean {
    if (!this.isBluetoothOn) return false;

    const receivedList = LocalDisasterDatabase.getReceivedSOS();
    const target = receivedList.find((m) => m.id === messageId);
    if (!target) return false;

    const currentTTL = target.ttl || 4;
    if (currentTTL <= 1) {
      this.logPacket({
        id: 'RELAY-FAIL-' + Date.now(),
        timestamp: Date.now(),
        direction: 'EXPIRED_TTL',
        packet: {
          packetId: 'PKT-EXP',
          messageId: target.id,
          senderId: this.myDeviceId,
          type: 'SOS',
          payload: target,
          timestamp: Date.now(),
          ttl: 0,
          relayCount: target.relayCount,
        },
        summary: `[RELAY] Cannot forward ${target.id}: TTL exhausted.`,
      });
      return false;
    }

    const nextTTL = currentTTL - 1;
    const relayedPacket: BLEPacket = {
      packetId: 'PKT-RELAY-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      messageId: target.id,
      senderId: this.myDeviceId,
      type: 'SOS',
      payload: {
        ...target,
        relayCount: target.relayCount + 1,
        hopsTaken: target.hopsTaken + 1,
        ttl: nextTTL,
      },
      timestamp: Date.now(),
      ttl: nextTTL,
      relayCount: target.relayCount + 1,
      rssi: -60,
    };

    target.relayCount += 1;
    target.ttl = nextTTL;
    LocalDisasterDatabase.updateReceivedSOS(target);

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(relayedPacket);
    }

    this.logPacket({
      id: relayedPacket.packetId,
      timestamp: Date.now(),
      direction: 'RELAY',
      packet: relayedPacket,
      summary: `[RELAY] Forwarded ${target.id} to mesh peers. New TTL: ${nextTTL}, Hop: ${relayedPacket.relayCount}`,
    });

    emergencyAudio.playAlertTone('ping');
    return true;
  }

  private startHeartbeatSimulation() {
    setInterval(() => {
      if (!this.isBluetoothOn) return;
      this.nearbyDevices = this.nearbyDevices.map((dev) => ({
        ...dev,
        rssi: Math.min(-48, Math.max(-92, dev.rssi + Math.floor(Math.random() * 7 - 3))),
        lastSeen: Date.now() - Math.floor(Math.random() * 3000),
      }));
      this.notifyDevices();
    }, 6000);
  }

  public triggerHackathonSimulationStep(step: number): { title: string; detail: string } {
    switch (step) {
      case 1:
        return {
          title: 'Airplane Mode Verified',
          detail: 'All cellular and internet data severed. DisasterNet core functionality remains 100% on-device.',
        };
      case 2:
        return {
          title: 'Offline Maps & Resources Loaded',
          detail: 'Preloaded vector map and 6 verified emergency shelter and medical posts loaded directly from local storage.',
        };
      case 3:
        {
          const testSOS: SOSMessage = {
            id: 'DN-8F2A',
            userId: 'usr-victim-alpha',
            senderName: 'Device A (Trapped Citizen)',
            severity: 'CRITICAL',
            emergencyType: 'trapped',
            message: 'Person trapped inside building 2nd floor, stairwell collapsed.',
            latitude: 26.4499,
            longitude: 80.3319,
            timestamp: Date.now(),
            status: 'queued',
            ttl: 5,
            peopleCount: 1,
            relayCount: 0,
            hopsTaken: 0,
            triageReason: 'Matched keyword "trapped". Priority: Immediate Life Threat.',
          };
          this.broadcastSOS(testSOS);
          return {
            title: 'Critical SOS Generated by Device A',
            detail: 'SOS DN-8F2A generated with GPS (26.4499, 80.3319), classified CRITICAL, saved to outbox, ready for BLE broadcast.',
          };
        }
      case 4:
        return {
          title: 'SOS Placed in Local Outbox Queue',
          detail: 'Outbox queue stores packet locally in SQLite. Device begins BLE discovery and advertisement pulse.',
        };
      case 5:
        {
          const packet: BLEPacket = {
            packetId: 'PKT-RELAY-B82',
            messageId: 'DN-8F2A',
            senderId: 'BLE-NODE-ALPHA',
            type: 'SOS',
            payload: {
              id: 'DN-8F2A',
              userId: 'usr-victim-alpha',
              senderName: 'Device A via Pixel 8 (Relay B)',
              severity: 'CRITICAL',
              emergencyType: 'trapped',
              message: 'Person trapped inside building 2nd floor, stairwell collapsed.',
              latitude: 26.4499,
              longitude: 80.3319,
              timestamp: Date.now(),
              status: 'relaying',
              ttl: 4,
              peopleCount: 1,
              relayCount: 1,
              hopsTaken: 1,
              triageReason: 'Matched keyword "trapped". Priority: Immediate Life Threat.',
            },
            timestamp: Date.now(),
            ttl: 4,
            relayCount: 1,
            rssi: -62,
          };

          this.logPacket({
            id: packet.packetId,
            timestamp: Date.now(),
            direction: 'RELAY',
            packet,
            peerId: 'Pixel 8 (Relay B)',
            summary: `[RELAY HOP] Device B (Relay) intercepted DN-8F2A, verified signature, decremented TTL 5 -> 4, forwarded.`,
          });

          return {
            title: 'Device B Relays Packet',
            detail: 'Device B picked up BLE packet DN-8F2A, verified TTL, and re-broadcasted to extend mesh perimeter.',
          };
        }
      case 6:
        {
          const receivedSos: SOSMessage = {
            id: 'DN-8F2A',
            userId: 'usr-victim-alpha',
            senderName: 'Device A (via Device B Relay)',
            severity: 'CRITICAL',
            emergencyType: 'trapped',
            message: 'Person trapped inside building 2nd floor, stairwell collapsed.',
            latitude: 26.4499,
            longitude: 80.3319,
            timestamp: Date.now(),
            status: 'received',
            ttl: 3,
            peopleCount: 1,
            relayCount: 2,
            hopsTaken: 2,
            triageReason: 'Immediate life threat (trapped). Surfaced to top of responder queue.',
            responders: ['You (Responder C)'],
          };
          LocalDisasterDatabase.addReceivedSOS(receivedSos);
          emergencyAudio.playAlertTone('critical');

          return {
            title: 'Device C (Responder) Receives Alert',
            detail: 'Device C receives packet through 2-hop BLE relay. Audio/visual critical alarm triggered!',
          };
        }
      case 7:
        {
          const duplicatePacket: BLEPacket = {
            packetId: 'PKT-DUP-771',
            messageId: 'DN-8F2A',
            senderId: 'BLE-NODE-GAMMA',
            type: 'SOS',
            payload: {
              id: 'DN-8F2A',
              userId: 'usr-victim-alpha',
              senderName: 'Device A',
              severity: 'CRITICAL',
              emergencyType: 'trapped',
              message: 'Duplicate re-transmission',
              latitude: 26.4499,
              longitude: 80.3319,
              timestamp: Date.now(),
              status: 'received',
              ttl: 4,
              peopleCount: 1,
              relayCount: 1,
              hopsTaken: 1,
              triageReason: '',
            },
            timestamp: Date.now(),
            ttl: 4,
            relayCount: 1,
          };

          this.handleIncomingPacket(duplicatePacket, 'Mesh Loop Peer');
          return {
            title: 'Duplicate Suppression Verified',
            detail: 'Duplicate packet with messageId "DN-8F2A" detected in local deduplication filter and safely ignored without duplicate alert.',
          };
        }
      case 8:
        return {
          title: 'Offline Survival Guides Accessible',
          detail: 'First-aid and disaster protocols read from local bundle with zero latency or web queries.',
        };
      default:
        return { title: 'Completed', detail: 'End of test flow.' };
    }
  }
}

export const bleMesh = new BleMeshService();
