/**
 * A7 – Google Maps / Places Autocomplete React integration
 * useGoogleMaps() hook loads the Maps JS SDK once and triggers autocomplete
 * on any <input> element via initAutocomplete().
 */
'use client';

import { useEffect, useRef, useState } from 'react';

// Extend window to satisfy TypeScript
declare global {
  interface Window {
    google: typeof google;
    __googleMapsScriptLoaded?: boolean;
  }
}

// ——— Map Loader ———————————————————————————————————
const MAPS_SCRIPT_ID = 'google-maps-script';

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.__googleMapsScriptLoaded) return resolve();

    const existingScript = document.getElementById(MAPS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.id   = MAPS_SCRIPT_ID;
    script.src  = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      window.__googleMapsScriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ——— Hook ——————————————————————————————————————————
interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

export function useGoogleMaps() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript().then(() => setReady(true)).catch(console.error);
  }, []);

  /**
   * Attach Places Autocomplete to an <input> element.
   * @returns cleanup function to remove the listener
   */
  function initAutocomplete(
    input: HTMLInputElement,
    onPlace: (result: PlaceResult) => void,
    options?: google.maps.places.AutocompleteOptions,
  ): () => void {
    if (!ready || !window.google) return () => {};

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'IN' },
      fields: ['formatted_address', 'geometry', 'place_id'],
      ...options,
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;
      onPlace({
        address: place.formatted_address ?? '',
        lat:     place.geometry.location.lat(),
        lng:     place.geometry.location.lng(),
        placeId: place.place_id ?? '',
      });
    });

    return () => google.maps.event.removeListener(listener);
  }

  return { ready, initAutocomplete };
}

// ——— Map Component ——————————————————————————————————
interface BusinessMapProps {
  lat: number;
  lng: number;
  name: string;
  className?: string;
}

export function BusinessMap({ lat, lng, name, className = '' }: BusinessMapProps) {
  const mapRef   = useRef<HTMLDivElement>(null);
  const { ready } = useGoogleMaps();

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom:   15,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    new window.google.maps.Marker({
      position: { lat, lng },
      map,
      title: name,
      animation: window.google.maps.Animation.DROP,
    });
  }, [ready, lat, lng, name]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ minHeight: "300px", borderRadius: "12px", overflow: "hidden" }}
      aria-label={`Map showing location of ${name}`}
      role="region"
    />
  );
}

// ——— Results Map (Multiple) ————————————————————————
interface SearchResultsMapProps {
  center: { lat: number; lng: number };
  results: PlaceResult[];
  className?: string;
}

export function SearchResultsMap({ center, results, className = "" }: SearchResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { ready } = useGoogleMaps();

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
    });

    results.forEach((res) => {
      new window.google.maps.Marker({
        position: { lat: res.lat, lng: res.lng },
        map,
        title: res.address,
        animation: window.google.maps.Animation.DROP,
      });
    });
  }, [ready, center, results]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ minHeight: "400px", borderRadius: "12px", overflow: "hidden" }}
    />
  );
}

