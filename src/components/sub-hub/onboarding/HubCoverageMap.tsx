"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const hubIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#9A3412;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapViewport({
  lat,
  lng,
  radiusKm,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  useEffect(() => {
    const bounds = L.latLng(lat, lng).toBounds(radiusKm * 1000 * 2.2);
    map.fitBounds(bounds, { animate: true, padding: [24, 24] });
  }, [lat, lng, radiusKm, map]);

  return null;
}

interface HubCoverageMapProps {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export function HubCoverageMap({
  latitude,
  longitude,
  radiusKm,
}: HubCoverageMapProps) {
  const lat = Number.isFinite(latitude) ? latitude : 28.6139;
  const lng = Number.isFinite(longitude) ? longitude : 77.209;
  const radius = Math.max(1, radiusKm) * 1000;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={11}
      className="absolute inset-0 z-0 size-full"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={hubIcon} />
      <Circle
        center={[lat, lng]}
        radius={radius}
        pathOptions={{
          color: "#ff6b00",
          fillColor: "#ff6b00",
          fillOpacity: 0.12,
          weight: 2,
        }}
      />
      <MapViewport lat={lat} lng={lng} radiusKm={radiusKm} />
    </MapContainer>
  );
}
