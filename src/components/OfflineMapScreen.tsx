import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Navigation,
  Layers,
  Radio,
  CheckCircle2,
  Building,
  Home,
  HeartPulse,
} from 'lucide-react';
import { EmergencyResource, IncidentReport } from '../types';
import { LocalDisasterDatabase } from '../services/storage';
import {
  DEFAULT_DISASTER_COORDS,
  calculateDistanceKm,
} from '../data/emergencyResources';
import { useTheme } from '../context/ThemeContext';

interface OfflineMapScreenProps {
  gpsActive: boolean;
}

export const OfflineMapScreen: React.FC<OfflineMapScreenProps> = ({ gpsActive }) => {
  const { isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_DISASTER_COORDS.lat,
    lng: DEFAULT_DISASTER_COORDS.lng,
  });

  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<EmergencyResource | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'dark'>(() => (isDark ? 'dark' : 'standard'));

  useEffect(() => {
    setMapStyle(isDark ? 'dark' : 'standard');
  }, [isDark]);

  useEffect(() => {
    const rawResources = LocalDisasterDatabase.getResources();
    const rawIncidents = LocalDisasterDatabase.getIncidents();

    const withDistances = rawResources.map((res) => ({
      ...res,
      distanceKm: calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        res.latitude,
        res.longitude
      ),
    }));

    withDistances.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    setResources(withDistances);
    setIncidents(rawIncidents);
  }, [userLocation]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: true,
      });

      const tileUrl =
        mapStyle === 'standard'
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      });
      tileLayer.addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      map.on('click', (e) => {
        setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-rose-500/30 animate-ping absolute"></div>
          <div class="w-5 h-5 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold">
            YOU
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindTooltip('<div style="font-size: 11px;"><b>Your Location</b><br>GPS Active</div>')
      .addTo(markersGroup);

    const filtered =
      selectedFilter === 'all'
        ? resources
        : resources.filter((r) => r.type === selectedFilter);

    filtered.forEach((res) => {
      let iconColor = 'bg-emerald-600';
      let iconSymbol = 'H';
      if (res.type === 'shelter') {
        iconColor = 'bg-sky-600';
        iconSymbol = 'S';
      } else if (res.type === 'water_supply') {
        iconColor = 'bg-blue-600';
        iconSymbol = 'W';
      } else if (res.type === 'relief_center') {
        iconColor = 'bg-amber-600';
        iconSymbol = 'R';
      }

      const resIcon = L.divIcon({
        className: 'resource-marker',
        html: `
          <div class="w-7 h-7 rounded-xl ${iconColor} border-2 border-white text-white shadow-md flex items-center justify-center text-xs font-bold">
            ${iconSymbol}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([res.latitude, res.longitude], { icon: resIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #1c1917; padding: 4px;">
          <b style="font-size: 13px;">${res.name}</b><br/>
          <span style="color: #78716c;">${res.address}</span><br/>
          <span style="color: #16a34a; font-weight: bold;">Status: ${res.status.toUpperCase()}</span><br/>
          <span>Occupancy: ${res.currentOccupancy}/${res.capacity}</span><br/>
          <span>Radio: <b>${res.contactRadio}</b></span>
        </div>
      `);
      marker.addTo(markersGroup);
    });

    incidents.forEach((inc) => {
      const incIcon = L.divIcon({
        className: 'hazard-marker',
        html: `
          <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white text-white shadow-md flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([inc.latitude, inc.longitude], { icon: incIcon })
        .bindTooltip(
          `<div style="font-size: 11px;"><b>Hazard: ${inc.title}</b><br>Severity: ${inc.severity}<br>Passable: ${inc.isPassable ? 'Yes' : 'No'}</div>`
        )
        .addTo(markersGroup);
    });
  }, [userLocation, resources, incidents, selectedFilter]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15);
    }
  };

  return (
    <div className="space-y-4 select-none">
      <div className="glass-card-elevated p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-white/60 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Offline Resource Locator &amp; Safe Shelters
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              Offline Ready
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Locate nearest verified shelters, hospitals, drinking water, and active hazard zones without internet.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { id: 'all', label: 'All Places' },
            { id: 'shelter', label: 'Shelters' },
            { id: 'hospital', label: 'Hospitals' },
            { id: 'relief_center', label: 'Relief Hubs' },
            { id: 'water_supply', label: 'Water' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-stone-900 dark:bg-rose-600 text-white shadow-sm'
                  : 'bg-white/70 dark:bg-slate-800/80 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-slate-700 border border-stone-200/60 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 glass-card overflow-hidden relative h-[520px] border border-white/60 dark:border-white/10">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 border border-stone-200/80 dark:border-white/15 text-xs text-stone-700 dark:text-stone-200 rounded-2xl shadow-sm">
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Location: {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° W
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px]">Vector map cached on your phone</p>
          </div>

          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button
              id="recenter-map-btn"
              onClick={handleRecenter}
              title="Recenter on My Location"
              className="px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/80 dark:border-white/15 text-xs font-semibold hover:bg-white dark:hover:bg-slate-800 text-stone-700 dark:text-stone-200 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Recenter</span>
            </button>
            <button
              id="toggle-map-style-btn"
              onClick={() => setMapStyle(mapStyle === 'dark' ? 'standard' : 'dark')}
              title="Toggle Map Contrast"
              className="px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/80 dark:border-white/15 text-xs font-semibold hover:bg-white dark:hover:bg-slate-800 text-stone-700 dark:text-stone-200 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{mapStyle === 'dark' ? 'Standard Map' : 'Dark Map'}</span>
            </button>
          </div>

          <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-stone-200/80 dark:border-white/15 px-3 py-1.5 rounded-xl text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>GPS Active (Tap anywhere on map to reposition)</span>
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-4 flex flex-col h-[520px] overflow-hidden border border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-white/10">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">
              Nearby Emergency Shelters
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">Closest first</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
            {resources.map((res) => {
              const availableBeds = Math.max(0, res.capacity - res.currentOccupancy);
              const isSelected = selectedFacility?.id === res.id;

              return (
                <div
                  key={res.id}
                  onClick={() => {
                    setSelectedFacility(res);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([res.latitude, res.longitude], 15);
                    }
                  }}
                  className={`p-3 text-left cursor-pointer transition-all rounded-2xl border ${
                    isSelected
                      ? 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-400 dark:border-rose-700 shadow-sm'
                      : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/60 border-stone-200/70 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {res.type === 'hospital' ? (
                        <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      ) : res.type === 'shelter' ? (
                        <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">{res.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {res.distanceKm} km
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">{res.address}</p>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        res.status === 'open'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : res.status === 'crowded'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {res.status.toUpperCase()} ({availableBeds} beds available)
                    </span>
                    <span className="text-stone-500 dark:text-stone-400 text-[11px]">{res.contactRadio}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedFacility && (
            <div className="mt-2 pt-3 border-t border-stone-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 rounded-2xl p-3 text-xs space-y-1.5 border border-stone-200/70 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 dark:text-white">{selectedFacility.name}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedFacility.distanceKm} km</span>
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300">
                <strong className="text-stone-700 dark:text-stone-200">Supplies:</strong> {selectedFacility.supplies.join(', ')}
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1 font-semibold">
                  <Radio className="w-3.5 h-3.5" />
                  {selectedFacility.contactRadio}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Facility
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
