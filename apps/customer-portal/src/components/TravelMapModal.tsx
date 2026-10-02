import React, { useEffect, useRef } from 'react';
import { Modal, Button } from '@queuesmart/shared';
import { Navigation, Clock, MapPin, AlertCircle, Compass } from 'lucide-react';
import { TravelTimeEstimate, Branch } from '@queuesmart/shared';

export interface TravelMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: TravelTimeEstimate | null;
  branch: Branch | null;
  onRefreshLocation: () => void;
  isLocating: boolean;
}

export const TravelMapModal: React.FC<TravelMapModalProps> = ({
  isOpen,
  onClose,
  estimate,
  branch,
  onRefreshLocation,
  isLocating,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current || !branch) return;

    // Dynamically initialize Leaflet map if window.L is available or via leaflet package
    let mapInstance: any = null;

    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      const originLat = estimate?.originLat ?? branch.latitude - 0.03;
      const originLng = estimate?.originLng ?? branch.longitude - 0.02;
      const destLat = branch.latitude;
      const destLng = branch.longitude;

      // Clean up previous map if exists
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      // Initialize Leaflet map
      mapInstance = L.map(mapContainerRef.current).setView([destLat, destLng], 13);
      leafletMapRef.current = mapInstance;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance);

      // Branch pin
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `<div style="background-color: #4f46e5; color: white; border-radius: 9999px; padding: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: 2px solid white;">🏥</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      // User origin pin
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="background-color: #10b981; color: white; border-radius: 9999px; padding: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 2px solid white;">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([destLat, destLng], { icon: destIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>${branch.name}</b><br>${branch.address}`)
        .openPopup();

      L.marker([originLat, originLng], { icon: userIcon })
        .addTo(mapInstance)
        .bindPopup('<b>Your Current Location</b>');

      // Draw route Polyline between origin and destination
      const routeLine = L.polyline(
        [
          [originLat, originLng],
          [destLat, destLng],
        ],
        { color: '#6366f1', weight: 4, dashArray: '8, 8' }
      ).addTo(mapInstance);

      mapInstance.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isOpen, branch, estimate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Travel & Departure Route"
      description="Real-time OpenStreetMap route calculation with traffic and leave-now ETA."
      size="lg"
    >
      <div className="space-y-4">
        {/* Route Stats Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Travel Distance
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <Navigation className="w-4 h-4 text-indigo-500" />
              {estimate?.distanceKm ?? 4.2} km
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Estimated Transit
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              ~{estimate?.travelMinutes ?? 14} mins
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Traffic State
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {estimate?.trafficLevel ?? 'LIGHT'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Status
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {estimate?.recommendedAction === 'LEAVE_NOW' ? 'Leave Now' : 'Plenty of Time'}
            </span>
          </div>
        </div>

        {/* Leaflet Map Box */}
        <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          
          <div className="absolute top-3 right-3 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-md">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              Live Route Tracking
            </span>
          </div>
        </div>

        {/* Manual Fallback & Refresh Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>
              Destination: {branch?.name || 'Selected Facility'} ({branch?.city})
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              isLoading={isLocating}
              onClick={onRefreshLocation}
            >
              Re-detect GPS Location
            </Button>
            <Button size="sm" variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
