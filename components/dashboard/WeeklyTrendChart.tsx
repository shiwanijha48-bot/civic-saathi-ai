'use client';

import { useMemo } from 'react';

interface Report {
  created_at: string;
  status: string;
}

interface Props {
  data: Report[];
}

export function WeeklyTrendChart({ data }: Props) {
  const days = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const count = data.filter(r => r.created_at.startsWith(dateStr)).length;
      const resolved = data.filter(r => r.created_at.startsWith(dateStr) && r.status === 'resolved').length;
      result.push({ label, count, resolved, dateStr });
    }
    return result;
  }, [data]);

  const maxCount = Math.max(...days.map(d => d.count), 1);
  const totalThisWeek = days.reduce((sum, d) => sum + d.count, 0);
  const totalResolved = days.reduce((sum, d) => sum + d.resolved, 0);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '24px', marginTop: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: '0 0 4px' }}>
            📈 Weekly activity
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
            Reports filed in the last 7 days
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#60a5fa', fontSize: '20px', fontWeight: 700, margin: 0 }}>{totalThisWeek}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>reported</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#4ade80', fontSize: '20px', fontWeight: 700, margin: 0 }}>{totalResolved}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>resolved</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', marginBottom: '8px' }}>
        {days.map((day, i) => {
          const heightPct = maxCount === 0 ? 0 : (day.count / maxCount) * 100;
          const resolvedPct = day.count === 0 ? 0 : (day.resolved / day.count) * 100;
          const isToday = i === 6;

          return (
            <div key={day.dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              {/* Count label */}
              {day.count > 0 && (
                <span style={{ color: isToday ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600 }}>
                  {day.count}
                </span>
              )}
              {/* Bar */}
              <div style={{
                width: '100%', borderRadius: '6px 6px 0 0', overflow: 'hidden',
                height: `${Math.max(heightPct, day.count > 0 ? 8 : 2)}%`,
                background: 'rgba(255,255,255,0.07)',
                border: isToday ? '1px solid rgba(96,165,250,0.3)' : 'none',
                position: 'relative', minHeight: '4px',
              }}>
                {/* Resolved portion */}
                {day.resolved > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: `${resolvedPct}%`,
                    background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                    minHeight: '4px',
                  }} />
                )}
                {/* Total portion */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: `${100 - resolvedPct}%`,
                  background: isToday
                    ? 'linear-gradient(180deg, #3b82f6, #2563eb)'
                    : 'linear-gradient(180deg, rgba(96,165,250,0.5), rgba(59,130,246,0.3))',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Day labels */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {days.map((day, i) => (
          <div key={day.dateStr} style={{ flex: 1, textAlign: 'center' }}>
            <span style={{
              color: i === 6 ? '#60a5fa' : 'rgba(255,255,255,0.3)',
              fontSize: '11px', fontWeight: i === 6 ? 600 : 400,
            }}>
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Reported</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Resolved</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            {totalThisWeek === 0 ? 'No reports this week' :
              `${Math.round((totalResolved / totalThisWeek) * 100)}% resolution rate this week`}
          </span>
        </div>
      </div>
    </div>
  );
}