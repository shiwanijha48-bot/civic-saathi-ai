'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader2, RefreshCw } from 'lucide-react';

interface Insights {
  topIssue: string;
  riskZone: string;
  avgResolutionDays: number;
  prediction: string;
  recommendation: string;
  recurringPattern: string;
  urgentAction: string;
}

interface Props {
  reports: any[];
}

// Smart rule-based fallback — works without any API
function generateFallbackInsights(reports: any[]): Insights {
  const cats: Record<string, number> = {};
  const sevs: Record<string, number> = {};
  reports.forEach(r => {
    cats[r.category] = (cats[r.category] ?? 0) + 1;
    sevs[r.severity] = (sevs[r.severity] ?? 0) + 1;
  });

  const topCat   = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const open     = reports.filter(r => r.status === 'open').length;
  const critical = sevs.critical ?? 0;
  const resolved = reports.filter(r => r.status === 'resolved');

  const avgDays = resolved.length > 0
    ? Math.round(resolved.reduce((acc, r) => acc + (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / 86400000, 0) / resolved.length)
    : 3;

  const cities: Record<string, number> = {};
  reports.forEach(r => {
    const city = r.address?.split(',').find((p: string) => p.trim().length > 2)?.trim() ?? 'Unknown';
    cities[city] = (cities[city] ?? 0) + 1;
  });
  const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'your area';

  return {
    topIssue: topCat
      ? `${topCat[0]} is the most reported issue with ${topCat[1]} active report${topCat[1] > 1 ? 's' : ''}`
      : 'No issues reported yet — community is in good shape',
    riskZone: `${topCity} has the highest concentration of unresolved issues`,
    avgResolutionDays: avgDays,
    prediction: open > 5
      ? `With ${open} open issues, expect increased community pressure over the next 7 days`
      : 'Issue volume is manageable — maintain current response pace',
    recommendation: critical > 0
      ? `Immediately address ${critical} critical issue${critical > 1 ? 's' : ''} to prevent public safety risks`
      : topCat
      ? `Focus resources on resolving ${topCat[0]} issues — they represent the biggest community pain point`
      : 'Maintain proactive monitoring and encourage more citizen reporting',
    recurringPattern: topCat
      ? `${topCat[0]} issues are recurring — consider a permanent infrastructure audit`
      : 'No clear recurring pattern detected yet',
    urgentAction: critical > 0
      ? `${critical} critical issue${critical > 1 ? 's' : ''} flagged — requires immediate departmental action`
      : open > 0
      ? `${open} open issue${open > 1 ? 's' : ''} awaiting assignment — assign to departments now`
      : 'All issues are being tracked — no urgent action required',
  };
}

export function PredictiveInsights({ reports }: Props) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading]   = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchInsights = async () => {
    if (reports.length < 1) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports }),
      });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? 'failed');

      setInsights(data);
      setUsingFallback(false);
    } catch {
      // Silently fall back to rule-based insights
      setInsights(generateFallbackInsights(reports));
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always show fallback immediately, then try AI
    setInsights(generateFallbackInsights(reports));
    setUsingFallback(true);
    if (reports.length >= 3) fetchInsights();
  }, []);

  const cards = insights ? [
    { icon: TrendingUp,    color: '#60a5fa', label: 'Top issue',         value: insights.topIssue },
    { icon: AlertTriangle, color: '#f87171', label: 'Urgent action',     value: insights.urgentAction },
    { icon: Brain,         color: '#c084fc', label: 'Prediction',        value: insights.prediction },
    { icon: Lightbulb,     color: '#facc15', label: 'Recommendation',    value: insights.recommendation },
    { icon: RefreshCw,     color: '#fb923c', label: 'Recurring pattern', value: insights.recurringPattern },
    { icon: TrendingUp,    color: '#34d399', label: 'Risk zone',         value: insights.riskZone },
  ] : [];

  return (
    <div style={{
      background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
      borderRadius: '16px', padding: '20px', marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={18} style={{ color: '#c084fc' }} />
          <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: 0 }}>
            AI predictive insights
          </h2>
          {usingFallback && !loading && (
            <span style={{
              fontSize: '10px', padding: '2px 7px', borderRadius: '99px',
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)',
            }}>
              rule-based
            </span>
          )}
          {!usingFallback && !loading && (
            <span style={{
              fontSize: '10px', padding: '2px 7px', borderRadius: '99px',
              background: 'rgba(168,85,247,0.15)', color: '#c084fc',
            }}>
              GEMINI AI
            </span>
          )}
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading || reports.length < 3}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
            borderRadius: '8px', padding: '6px 12px', color: '#c084fc',
            fontSize: '12px', cursor: (loading || reports.length < 3) ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: reports.length < 3 ? 0.5 : 1,
          }}
        >
          {loading
            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analysing…</>
            : <><RefreshCw size={13} /> Refresh AI</>
          }
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {reports.length < 1 && (
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
          Submit reports to see insights.
        </p>
      )}

      {insights && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <card.icon size={13} style={{ color: card.color, flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </span>
              </div>
              <p style={{ color: '#f8fafc', fontSize: '13px', lineHeight: 1.55, margin: 0 }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}