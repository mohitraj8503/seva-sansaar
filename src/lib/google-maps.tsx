/**
 * A7 – Google Maps / Places Autocomplete React integration
 * useGoogleMaps() hook loads the Maps JS SDK once and triggers autocomplete
 * on any <input> element via initAutocomplete().
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
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
    loadGoogleMapsScript()
      .then(() => setReady(true))
      .catch(console.error);
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
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
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

export function BusinessMap({
  lat,
  lng,
  name,
  className = '',
}: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { ready } = useGoogleMaps();

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
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
      style={{
        minHeight: '300px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
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

export function SearchResultsMap({
  center,
  results,
  className = '',
}: SearchResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    results.forEach((res) => {
      const markerIcon = L.divIcon({
        className: '',
        html: `
          <div
            style="
              width: 34px;
              height: 34px;
              border-radius: 50% 50% 50% 0;
              background: #0f172a;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              border: 3px solid white;
              transition: transform 0.2s ease;
            "
          >
            <span
              style="
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: white;
              "
            ></span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([res.lat, res.lng], {
        icon: markerIcon,
        title: res.address,
      }).addTo(map);

      marker.bindPopup(`
        <div
          style="
            width: 220px;
            padding: 4px;
            font-family: Arial, sans-serif;
          "
        >
          <div
            style="
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 6px;
            "
          >
            ${res.address}
          </div>

          <div
            style="
              font-size: 12px;
              color: #64748b;
              margin-bottom: 10px;
            "
          >
            Local service provider
          </div>

          <div
            style="
              display: inline-block;
              padding: 5px 9px;
              border-radius: 999px;
              background: #f1f5f9;
              color: #334155;
              font-size: 11px;
              font-weight: 600;
            "
          >
            Seva Sansaar
          </div>
        </div>
      `);

      marker.on('mouseover', () => {
        const element = marker.getElement();

        if (element) {
          element.style.transform = 'scale(1.2)';
          element.style.zIndex = '1000';
        }
      });

      marker.on('mouseout', () => {
        const element = marker.getElement();

        if (element) {
          element.style.transform = '';
          element.style.zIndex = '';
        }
      });

      marker.on('click', () => {
        marker.openPopup();
      });
    });

    if (results.length > 0) {
      const bounds = L.latLngBounds(
        results.map(
          (res) => [res.lat, res.lng] as [number, number]
        )
      );

      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
      });
    }

    return () => {
      map.remove();
    };
  }, [center.lat, center.lng, results]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{
        minHeight: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
      aria-label="Map showing service providers"
      role="region"
    />
  );
}