'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Report } from '@/types';
import Link from 'next/link';
import { MapPin, AlertTriangle, Filter } from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: '🔴 Critical',
  high: '🟠 High',
  medium: '🟡 Medium',
  low: '🟢 Low',
};

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('reports')
      .select('*, users(name), departments(name)')
      .not('latitude', 'is', null)
      .then(({ data, error }) => {
        if (data) setReports(data as Report[]);
        if (error) console.error(error);
      });
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError(true); return; }

    if (window.google?.maps) { setMapLoaded(true); return; }

const existing = document.querySelector('script[src*="maps.googleapis.com"]');
if (existing) {
  existing.addEventListener('load', () => setMapLoaded(true));
  return;
}

const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
script.async = true;
script.onload = () => setMapLoaded(true);
script.onerror = () => setMapError(true);
document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded || reports.length === 0) return;

    const filtered = filter === 'all' ? reports : reports.filter(r => r.severity === filter);

    const map = new window.google.maps.Map(document.getElementById('gmap')!, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      styles: darkMapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    // Try user location
    navigator.geolocation?.getCurrentPosition(pos => {
      map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      map.setZoom(12);
    });

    // Add markers
    filtered.forEach(report => {
      if (!report.latitude || !report.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: report.latitude, lng: report.longitude },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: SEVERITY_COLORS[report.severity] ?? '#3b82f6',
          fillOpacity: 0.9,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: report.title,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding:8px;max-width:200px;font-family:system-ui,sans-serif">
            <p style="font-weight:600;font-size:14px;margin:0 0 4px;color:#111">${report.title}</p>
            <p style="font-size:12px;color:#666;margin:0 0 8px">${report.category}</p>
            <a href="/reports/${report.id}" style="font-size:12px;color:#3b82f6;font-weight:500">
              View details →
            </a>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setSelected(report);
      });
    });
  }, [mapLoaded, reports, filter]);

  const filteredCount = filter === 'all' ? reports.length : reports.filter(r => r.severity === filter).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '20px', margin: 0 }}>Issue map</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '2px' }}>
            {filteredCount} issue{filteredCount !== 1 ? 's' : ''} plotted
          </p>
        </div>

        {/* Severity filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer', border: 'none',
                background: filter === s
                  ? (s === 'all' ? '#3b82f6' : SEVERITY_COLORS[s])
                  : 'rgba(255,255,255,0.08)',
                color: filter === s ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}
            >
              {s === 'all' ? 'All' : SEVERITY_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {mapError && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px',
            color: 'rgba(255,255,255,0.4)',
          }}>
            <AlertTriangle size={40} style={{ color: '#f97316' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              Google Maps API key missing
            </p>
            <p style={{ fontSize: '13px', margin: 0, textAlign: 'center', maxWidth: '300px' }}>
              Add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </code> to your .env.local file
            </p>
            {/* Fallback list view */}
            <div style={{ marginTop: '24px', width: '100%', maxWidth: '500px', padding: '0 24px' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px' }}>
                Showing {reports.length} reported issues:
              </p>
              {reports.slice(0, 8).map(r => (
                <Link key={r.id} href={`/reports/${r.id}`}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px', marginBottom: '6px',
                    background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: SEVERITY_COLORS[r.severity] ?? '#3b82f6',
                    }} />
                    <span style={{ color: '#f8fafc', fontSize: '13px', flex: 1 }}>{r.title}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{r.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!mapError && !mapLoaded && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'rgba(255,255,255,0.4)', gap: '10px',
          }}>
            <div style={{
              width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.2)',
              borderTop: '2px solid #3b82f6', borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading map…
          </div>
        )}

        <div id="gmap" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Selected report panel */}
      {selected && (
        <div style={{
          position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px', padding: '16px 20px', minWidth: '280px', maxWidth: '380px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 10,
          display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%', marginTop: '4px', flexShrink: 0,
            background: SEVERITY_COLORS[selected.severity] ?? '#3b82f6',
          }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
              {selected.title}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '0 0 10px' }}>
              {selected.category} · {selected.severity}
            </p>
            <Link href={`/reports/${selected.id}`} style={{
              color: '#60a5fa', fontSize: '13px', fontWeight: 500,
            }}>
              View full report →
            </Link>
          </div>
          <button
            onClick={() => setSelected(null)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '0',
            }}
          >×</button>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window { google: any; }
}

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];