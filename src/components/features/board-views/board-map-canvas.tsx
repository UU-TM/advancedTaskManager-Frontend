"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  title: string;
  lat: number;
  lng: number;
};

type BoardMapCanvasProps = {
  points: MapPoint[];
  selectedId?: string | null;
  draft?: { lat: number; lng: number } | null;
  pickEnabled?: boolean;
  onSelect: (id: string) => void;
  onPick?: (lat: number, lng: number) => void;
};

function pinIcon(active: boolean, draft = false) {
  const size = active ? 26 : 20;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);background:${
      draft ? "#f59e0b" : "#0d9488"
    }"></span>`,
  });
}

/** Leaflet map — client-only; load through `next/dynamic` with ssr: false. */
export default function BoardMapCanvas({
  points,
  selectedId,
  draft,
  pickEnabled,
  onSelect,
  onPick,
}: BoardMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const draftRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  const onPickRef = useRef(onPick);
  const pickEnabledRef = useRef(pickEnabled);
  const fittedRef = useRef(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onPickRef.current = onPick;
    pickEnabledRef.current = pickEnabled;
  }, [onSelect, onPick, pickEnabled]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (pickEnabledRef.current) {
        onPickRef.current?.(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6)),
        );
      }
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      draftRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], {
        icon: pinIcon(p.id === selectedId),
        title: p.title,
        keyboard: true,
      });
      marker.bindTooltip(p.title, { direction: "top", offset: [0, -10] });
      marker.on("click", () => onSelectRef.current(p.id));
      marker.addTo(layer);
    }
    if (!fittedRef.current && points.length > 0) {
      fittedRef.current = true;
      if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], 12);
      } else {
        map.fitBounds(
          L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
          { padding: [40, 40], maxZoom: 14 },
        );
      }
    }
  }, [points, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (draftRef.current) {
      draftRef.current.remove();
      draftRef.current = null;
    }
    if (draft) {
      draftRef.current = L.marker([draft.lat, draft.lng], {
        icon: pinIcon(true, true),
      }).addTo(map);
    }
  }, [draft]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = points.find((x) => x.id === selectedId);
    if (p) map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 10), { duration: 0.6 });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="size-full min-h-64 rounded-lg border border-border"
      style={{ cursor: pickEnabled ? "crosshair" : undefined }}
    />
  );
}
