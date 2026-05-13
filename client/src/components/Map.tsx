/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

// O usuário deve configurar VITE_GOOGLE_MAPS_API_KEY no Vercel
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

function loadMapScript() {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(null);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(null);
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: -1.4558, lng: -48.4902 }, // Belém, PA
  initialZoom = 13,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  const init = usePersistFn(async () => {
    if (!API_KEY) {
      setError("Google Maps API Key não configurada.");
      return;
    }
    try {
      await loadMapScript();
      if (!mapContainer.current) return;
      
      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
        mapId: "DEMO_MAP_ID",
      });
      
      if (onMapReady) {
        onMapReady(map.current);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar o mapa.");
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  if (error) {
    return (
      <div className={cn("w-full h-[500px] flex items-center justify-center bg-muted text-muted-foreground rounded-lg border", className)}>
        {error}
      </div>
    );
  }

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px] rounded-lg border", className)} />
  );
}
