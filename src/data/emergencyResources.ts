import { EmergencyResource } from '../types';

export const DEFAULT_DISASTER_COORDS = {
  lat: 26.4499,
  lng: 80.3319,
};

export const INITIAL_RESOURCES: EmergencyResource[] = [
  {
    id: 'res-01',
    name: 'Central City Civic Relief Shelter #1',
    type: 'shelter',
    latitude: 26.4532,
    longitude: 80.3385,
    capacity: 350,
    currentOccupancy: 210,
    verified: true,
    status: 'open',
    address: 'Sector 4 Stadium Ground, Near Ring Road',
    supplies: ['Drinking Water', 'Dry Rations', 'Blankets', 'Solar Backup', 'Basic First Aid'],
    contactRadio: 'VHF 156.800 MHz (Ch 16)',
    lastUpdated: '15 mins ago',
  },
  {
    id: 'res-02',
    name: 'Apex General Trauma & Emergency Hospital',
    type: 'hospital',
    latitude: 26.4412,
    longitude: 80.3245,
    capacity: 120,
    currentOccupancy: 95,
    verified: true,
    status: 'crowded',
    address: '42 Medical Enclave, Elevated Corridor',
    supplies: ['Trauma Center', 'Blood Bank (O+, A+)', 'Emergency OT', 'Oxygen Reserves'],
    contactRadio: 'VHF 155.340 MHz (Hospital Net)',
    lastUpdated: '8 mins ago',
  },
  {
    id: 'res-03',
    name: 'Red Cross Flood Relief Staging Center',
    type: 'relief_center',
    latitude: 26.4601,
    longitude: 80.3278,
    capacity: 500,
    currentOccupancy: 140,
    verified: true,
    status: 'open',
    address: 'Old Poly-Technic Campus, High Grounds',
    supplies: ['Water Purification Tablets', 'Baby Formula', 'MRE Food Packs', 'Family Tents'],
    contactRadio: 'HAM 144.200 MHz',
    lastUpdated: '22 mins ago',
  },
  {
    id: 'res-04',
    name: 'Disaster Response & Search Command Post',
    type: 'police',
    latitude: 26.4385,
    longitude: 80.3412,
    capacity: 80,
    currentOccupancy: 45,
    verified: true,
    status: 'open',
    address: 'Barracks 3, Emergency Operations Center',
    supplies: ['Inflatable Rescue Boats', 'Satellite Uplink (Local Relay)', 'Rope Rescue Gear'],
    contactRadio: 'VHF 151.625 MHz (SAR Command)',
    lastUpdated: '5 mins ago',
  },
  {
    id: 'res-05',
    name: 'Community Potable Water Tanker Station',
    type: 'water_supply',
    latitude: 26.4578,
    longitude: 80.3456,
    capacity: 1000,
    currentOccupancy: 380,
    verified: true,
    status: 'open',
    address: 'Junction 9 Water Works Reservoir',
    supplies: ['10,000L Potable Water', 'Gravity Ceramic Filters', 'Jerrycan Distribution'],
    contactRadio: 'VHF 154.570 MHz',
    lastUpdated: '30 mins ago',
  },
  {
    id: 'res-06',
    name: 'North Highland School Emergency Evacuation Site',
    type: 'shelter',
    latitude: 26.4672,
    longitude: 80.3204,
    capacity: 200,
    currentOccupancy: 198,
    verified: true,
    status: 'full',
    address: 'Highland Ridge Road, Hilltop Zone',
    supplies: ['Dry Floor Bedding', 'Generator Power 24/7', 'Hot Soup Kitchen'],
    contactRadio: 'VHF 146.520 MHz',
    lastUpdated: '12 mins ago',
  },
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}
