import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Technician, CommuneAbidjan } from '../../types';
import { formatFCFA } from '../../utils/formatters';

// Safely patch Leaflet's DomUtil.remove to prevent "NotFoundError: The object can not be found here"
if (typeof L !== 'undefined' && L.DomUtil) {
  const originalRemove = L.DomUtil.remove;
  L.DomUtil.remove = function (el: HTMLElement) {
    try {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    } catch {
      // Suppress NotFoundError on detached / unmounting nodes
    }
  };
}

interface MapProps {
  mode?: 'TRACKING' | 'FLEET';
  clientLocation?: { lat: number; lng: number; address?: string; commune?: CommuneAbidjan };
  technicianLocation?: { lat: number; lng: number; name?: string; vehicle?: string };
  allTechnicians?: Technician[];
  onSelectTechnician?: (tech: Technician) => void;
  height?: string;
  missionStatus?: string;
}

export const OpenStreetMap: React.FC<MapProps> = ({
  mode = 'TRACKING',
  clientLocation,
  technicianLocation,
  allTechnicians = [],
  onSelectTechnician,
  height = '320px',
  missionStatus,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  // Initialize Isolated Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    // Center of Abidjan (around Plateau / Cocody / Marcory)
    const defaultCenter: [number, number] = [5.3400, -4.0000];
    let map: L.Map | null = null;

    try {
      map = L.map(container, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Add CartoDB Positron / OSM clean tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add custom zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.featureGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Map init warning:', e);
    }

    return () => {
      try {
        if (markersGroupRef.current) {
          try {
            markersGroupRef.current.clearLayers();
          } catch {}
          markersGroupRef.current = null;
        }
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.stop();
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch {}
          mapInstanceRef.current = null;
        }
      } catch (err) {
        console.warn('Map cleanup error suppressed:', err);
      } finally {
        if (container && (container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }
      }
    };
  }, []);

  // Update Markers and Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    try {
      // Safely clear previous layers
      try {
        markersGroup.clearLayers();
      } catch {}

      const bounds = L.latLngBounds([]);

      // Custom Client Pin (Amber / Yellow #F59E0B)
      const createClientIcon = () => {
        return L.divIcon({
          className: 'custom-client-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-[#F59E0B] opacity-30 animate-ping"></div>
              <div class="w-8 h-8 rounded-full bg-[#F59E0B] border-2 border-white shadow-lg flex items-center justify-center text-[#1B2A4A] font-bold text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="absolute -bottom-6 whitespace-nowrap bg-[#1B2A4A] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                Vous (Client)
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      // Custom Tech Pin (Deep Navy #1B2A4A with Amber ring)
      const createTechIcon = (name: string, status?: string) => {
        const isOnline = status !== 'OFFLINE';
        const statusColor = isOnline ? '#10B981' : '#94A3B8';
        
        return L.divIcon({
          className: 'custom-tech-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-9 h-9 rounded-full bg-[#1B2A4A] border-2 border-[#F59E0B] shadow-xl flex items-center justify-center text-white text-xs transition-transform duration-300 hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white" style="background-color: ${statusColor};"></div>
              <div class="absolute -bottom-6 whitespace-nowrap bg-white text-[#1B2A4A] border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-md">
                ${name.split(' ')[0]} 🔧
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
      };

      if (mode === 'TRACKING') {
        if (clientLocation) {
          const clientLatLng = L.latLng(clientLocation.lat, clientLocation.lng);
          const clientMarker = L.marker(clientLatLng, { icon: createClientIcon() });
          clientMarker.bindPopup(`
            <div class="p-1 text-xs">
              <strong class="text-[#1B2A4A] block mb-0.5">Adresse d'intervention</strong>
              <span class="text-slate-600">${clientLocation.address || 'Abidjan'} (${clientLocation.commune || 'Abidjan'})</span>
            </div>
          `);
          markersGroup.addLayer(clientMarker);
          bounds.extend(clientLatLng);
        }

        if (technicianLocation) {
          const techLatLng = L.latLng(technicianLocation.lat, technicianLocation.lng);
          const techMarker = L.marker(techLatLng, {
            icon: createTechIcon(technicianLocation.name || 'Technicien Vraiga', 'ONLINE'),
          });
          
          techMarker.bindPopup(`
            <div class="p-1 text-xs">
              <strong class="text-[#1B2A4A] block mb-0.5">${technicianLocation.name || 'Technicien Vraiga'}</strong>
              <span class="text-slate-600 block">${technicianLocation.vehicle || 'Moto outillée'}</span>
              <span class="inline-block mt-1 bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                ${missionStatus === 'ARRIVED' ? 'Arrivé sur place' : 'En route vers votre domicile'}
              </span>
            </div>
          `);
          markersGroup.addLayer(techMarker);
          bounds.extend(techLatLng);

          // Draw animated/styled polyline between technician and client
          if (clientLocation) {
            const pathCoordinates: [number, number][] = [
              [technicianLocation.lat, technicianLocation.lng],
              // Add a realistic bend waypoint
              [
                (technicianLocation.lat + clientLocation.lat) / 2 + 0.002,
                (technicianLocation.lng + clientLocation.lng) / 2 - 0.002
              ],
              [clientLocation.lat, clientLocation.lng],
            ];

            const routePolyline = L.polyline(pathCoordinates, {
              color: '#1B2A4A',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            });

            markersGroup.addLayer(routePolyline);
          }
        }
      } else if (mode === 'FLEET') {
        // Render all technicians across Abidjan
        allTechnicians.forEach(tech => {
          const latLng = L.latLng(tech.coordinates.lat, tech.coordinates.lng);
          const marker = L.marker(latLng, {
            icon: createTechIcon(tech.name, tech.status),
          });

          marker.on('click', () => {
            if (onSelectTechnician) {
              onSelectTechnician(tech);
            }
          });

          const isLowBalance = tech.walletBalance < 2000;

          marker.bindPopup(`
            <div class="p-2 text-xs font-sans">
              <div class="flex items-center gap-2 mb-1.5">
                <img src="${tech.photo}" alt="${tech.name}" class="w-7 h-7 rounded-full object-cover border border-slate-300" />
                <div>
                  <strong class="text-[#1B2A4A] block">${tech.name}</strong>
                  <span class="text-slate-500 text-[10px]">${tech.commune}</span>
                </div>
              </div>
              <div class="space-y-1 my-1.5 border-t border-b border-slate-100 py-1">
                <div class="flex justify-between">
                  <span class="text-slate-500">Statut:</span>
                  <span class="font-bold ${tech.status === 'ONLINE' ? 'text-emerald-600' : 'text-slate-500'}">
                    ${tech.status === 'ONLINE' ? '● En ligne' : '○ Hors ligne'}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Solde portefeuille:</span>
                  <span class="font-bold ${isLowBalance ? 'text-rose-600' : 'text-[#1B2A4A]'}">
                    ${formatFCFA(tech.walletBalance)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Note:</span>
                  <span class="font-bold text-amber-600">★ ${tech.rating} (${tech.reviewCount})</span>
                </div>
              </div>
              <div class="text-[10px] text-slate-500">
                Véhicule: ${tech.vehicle}
              </div>
            </div>
          `);

          markersGroup.addLayer(marker);
          bounds.extend(latLng);
        });
      }

      // Fit map bounds smoothly
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 15,
          animate: true,
        });
      }
    } catch (err) {
      console.warn('Map marker layer update warning:', err);
    }
  }, [mode, clientLocation, technicianLocation, allTechnicians, onSelectTechnician, missionStatus]);

  // Handle Container Resizing
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        try {
          mapInstanceRef.current?.invalidateSize();
        } catch {}
      });
    });

    resizeObserver.observe(container);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Abidjan Map Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-[#1B2A4A]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Abidjan Live GPS</span>
      </div>
    </div>
  );
};

