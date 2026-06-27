'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Locate, CheckCircle, Loader2 } from 'lucide-react';
import { INDIA_STATES, STATE_COORDINATES } from '@/lib/india-locations';

export interface LocationData {
  state: string;
  city: string;
  address: string;
  fullAddress: string;
  lat: number | null;
  lng: number | null;
}

interface Props {
  onChange: (location: LocationData) => void;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Surat': { lat: 21.1702, lng: 72.8311 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Thane': { lat: 19.2183, lng: 72.9781 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Vadodara': { lat: 22.3072, lng: 73.1812 },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'Ludhiana': { lat: 30.9010, lng: 75.8573 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
  'Meerut': { lat: 28.9845, lng: 77.7064 },
  'Rajkot': { lat: 22.3039, lng: 70.8022 },
  'Amritsar': { lat: 31.6340, lng: 74.8723 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Darbhanga': { lat: 26.1542, lng: 85.8918 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Guwahati': { lat: 26.1445, lng: 91.7362 },
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'Mysuru': { lat: 12.2958, lng: 76.6394 },
  'Noida': { lat: 28.5355, lng: 77.3910 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
  'Gurugram': { lat: 28.4595, lng: 77.0266 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
  'Raipur': { lat: 21.2514, lng: 81.6296 },
  'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'Allahabad': { lat: 25.4358, lng: 81.8463 },
  'Gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'Jodhpur': { lat: 26.2389, lng: 73.0243 },
  'Udaipur': { lat: 24.5854, lng: 73.7125 },
  'Kota': { lat: 25.2138, lng: 75.8648 },
  'Bikaner': { lat: 28.0229, lng: 73.3119 },
  'Ajmer': { lat: 26.4499, lng: 74.6399 },
  'Srinagar': { lat: 34.0837, lng: 74.7973 },
  'Jammu': { lat: 32.7266, lng: 74.8570 },
  'Shimla': { lat: 31.1048, lng: 77.1734 },
  'Panaji': { lat: 15.4989, lng: 73.8278 },
  'Imphal': { lat: 24.8170, lng: 93.9368 },
  'Shillong': { lat: 25.5788, lng: 91.8933 },
  'Aizawl': { lat: 23.7307, lng: 92.7173 },
  'Kohima': { lat: 25.6751, lng: 94.1086 },
  'Agartala': { lat: 23.8315, lng: 91.2868 },
  'Gangtok': { lat: 27.3389, lng: 88.6065 },
  'Itanagar': { lat: 27.0844, lng: 93.6053 },
  'Dispur': { lat: 26.1433, lng: 91.7898 },
  'Port Blair': { lat: 11.6234, lng: 92.7265 },
  'Leh': { lat: 34.1526, lng: 77.5771 },
  'Silvassa': { lat: 20.2766, lng: 72.9959 },
  'Daman': { lat: 20.3974, lng: 72.8328 },
  'Kavaratti': { lat: 10.5626, lng: 72.6369 },
};

type Mode = 'choose' | 'gps' | 'manual';

export function LocationPicker({ onChange }: Props) {
  const [mode, setMode]               = useState<Mode>('choose');
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [gpsData, setGpsData]         = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [gpsAddress, setGpsAddress]   = useState('');

  // Manual mode state
  const [state, setState]   = useState('');
  const [city, setCity]     = useState('');
  const [address, setAddress] = useState('');
  const [cities, setCities] = useState<string[]>([]);

  /* ── Update cities when state changes ── */
  useEffect(() => {
    if (state) {
      setCities(INDIA_STATES[state] ?? []);
      setCity('');
    }
  }, [state]);

  /* ── Emit onChange for manual mode ── */
  useEffect(() => {
    if (mode !== 'manual' || !state) return;
    const cityCoords  = city ? CITY_COORDINATES[city] : null;
    const stateCoords = STATE_COORDINATES[state];
    const coords      = cityCoords ?? stateCoords ?? null;
    const fullAddress = [address, city, state, 'India'].filter(Boolean).join(', ');
    onChange({
      state, city, address, fullAddress,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    });
  }, [state, city, address, mode]);

  /* ── GPS handler ── */
  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        // Reverse geocode using free Nominatim API
        let label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          label = data.display_name ?? label;
        } catch {
          // Use raw coords if reverse geocode fails
        }

        setGpsData({ lat, lng, label });
        setGpsLoading(false);
        onChange({
          state: '',
          city: '',
          address: label,
          fullAddress: label,
          lat,
          lng,
        });
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          alert('Location permission denied. Please allow location access or use manual entry.');
          setMode('choose');
        } else {
          alert('Could not get your location. Please try manual entry.');
          setMode('choose');
        }
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  /* ── Styles ── */
  const selectStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', padding: '11px 36px 11px 14px',
    color: '#f8fafc', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none',
    transition: 'border-color 0.2s',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', padding: '11px 14px',
    color: '#f8fafc', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  };

  /* ── CHOOSE mode ── */
  if (mode === 'choose') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
          How would you like to add the location?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* GPS option */}
          <button
            type="button"
            onClick={() => { setMode('gps'); handleGPS(); }}
            style={{
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.15)';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)';
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(59,130,246,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Locate size={22} style={{ color: '#60a5fa' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
                Use GPS
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>
                Auto-detect my current location
              </p>
            </div>
          </button>

          {/* Manual option */}
          <button
            type="button"
            onClick={() => setMode('manual')}
            style={{
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(52,211,153,0.15)';
              e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(52,211,153,0.08)';
              e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)';
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <MapPin size={22} style={{ color: '#34d399' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
                Enter manually
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>
                Select state, city and address
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ── GPS mode ── */
  if (mode === 'gps') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Loading state */}
        {gpsLoading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '12px', padding: '16px',
          }}>
            <Loader2 size={20} style={{ color: '#60a5fa', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <div>
              <p style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                Getting your location…
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0' }}>
                Please allow location access if prompted
              </p>
            </div>
          </div>
        )}

        {/* Success state */}
        {!gpsLoading && gpsData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '12px', padding: '14px 16px',
            }}>
              <CheckCircle size={18} style={{ color: '#4ade80', flexShrink: 0, marginTop: '1px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#4ade80', fontSize: '13px', fontWeight: 600, margin: '0 0 4px' }}>
                  Location captured!
                </p>
                <p style={{
                  color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 4px',
                  wordBreak: 'break-word', lineHeight: 1.5,
                }}>
                  {gpsData.label}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>
                  {gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)}
                </p>
              </div>
            </div>

            {/* Optional extra detail */}
            <div>
              <label style={labelStyle}>Add more detail (optional)</label>
              <input
                value={gpsAddress}
                onChange={e => {
                  setGpsAddress(e.target.value);
                  onChange({
                    state: '', city: '', address: e.target.value,
                    fullAddress: e.target.value ? `${e.target.value}, ${gpsData.label}` : gpsData.label,
                    lat: gpsData.lat, lng: gpsData.lng,
                  });
                }}
                placeholder="e.g. Near bus stop, Ward 5, opposite school"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>
          </div>
        )}

        {/* Change method button */}
        <button
          type="button"
          onClick={() => { setMode('choose'); setGpsData(null); setGpsLoading(false); }}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '7px 14px', color: 'rgba(255,255,255,0.4)',
            fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-start',
            fontFamily: 'inherit',
          }}
        >
          ← Change location method
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── MANUAL mode ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* State */}
      <div>
        <label style={labelStyle}>State / UT *</label>
        <div style={{ position: 'relative' }}>
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            style={{ ...selectStyle, color: state ? '#f8fafc' : 'rgba(255,255,255,0.3)' }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          >
            <option value="" disabled style={{ background: '#1e293b' }}>Select your state</option>
            {Object.keys(INDIA_STATES).sort().map(s => (
              <option key={s} value={s} style={{ background: '#1e293b', color: '#f8fafc' }}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown size={15} style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* City — appears after state chosen */}
      {state && (
        <div>
          <label style={labelStyle}>City / District *</label>
          <div style={{ position: 'relative' }}>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              style={{ ...selectStyle, color: city ? '#f8fafc' : 'rgba(255,255,255,0.3)' }}
              onFocus={e => (e.target.style.borderColor = '#3b82f6')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            >
              <option value="" disabled style={{ background: '#1e293b' }}>Select your city</option>
              {cities.sort().map(c => (
                <option key={c} value={c} style={{ background: '#1e293b', color: '#f8fafc' }}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={15} style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none',
            }} />
          </div>
        </div>
      )}

      {/* Address — appears after city chosen */}
      {city && (
        <div>
          <label style={labelStyle}>Street / Colony / Ward (optional)</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. Ward 12, MG Road, Near Bus Stand, Gandhi Nagar"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '4px' }}>
            Be specific so authorities can find the exact spot
          </p>
        </div>
      )}

      {/* Preview */}
      {state && city && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px',
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: '10px', padding: '10px 14px',
        }}>
          <MapPin size={14} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ color: '#6ee7b7', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            {[address, city, state, 'India'].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {/* Change method */}
      <button
        type="button"
        onClick={() => { setMode('choose'); setState(''); setCity(''); setAddress(''); }}
        style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '7px 14px', color: 'rgba(255,255,255,0.4)',
          fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-start',
          fontFamily: 'inherit',
        }}
      >
        ← Change location method
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.55)',
  fontSize: '13px', fontWeight: 500, marginBottom: '6px',
};