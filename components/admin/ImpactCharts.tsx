'use client';

import { useEffect, useRef } from 'react';

interface Props {
  categoryData: Record<string, number>;
  statusData: Record<string, number>;
  weeklyData: Record<string, number>;
  severityData: Record<string, number>;
}

export function ImpactCharts({ categoryData, statusData, weeklyData, severityData }: Props) {
  const weeklyRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLCanvasElement>(null);
  const sevRef    = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => {
      const Chart = (window as any).Chart;

      if (weeklyRef.current) {
        new Chart(weeklyRef.current, {
          type: 'bar',
          data: {
            labels: Object.keys(weeklyData),
            datasets: [{
              label: 'Reports',
              data: Object.values(weeklyData),
              backgroundColor: 'rgba(59,130,246,0.6)',
              borderColor: '#3b82f6',
              borderWidth: 1,
              borderRadius: 6,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
            },
          },
        });
      }

      if (statusRef.current) {
        new Chart(statusRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
            datasets: [{
              data: [statusData.open ?? 0, statusData.in_progress ?? 0, statusData.resolved ?? 0, statusData.closed ?? 0],
              backgroundColor: ['#3b82f6', '#a855f7', '#22c55e', '#64748b'],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom' as const,
                labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, padding: 12, boxWidth: 10 },
              },
            },
            cutout: '65%',
          },
        });
      }

      if (sevRef.current) {
        new Chart(sevRef.current, {
          type: 'bar',
          data: {
            labels: ['Critical', 'High', 'Medium', 'Low'],
            datasets: [{
              data: [severityData.critical ?? 0, severityData.high ?? 0, severityData.medium ?? 0, severityData.low ?? 0],
              backgroundColor: [
                'rgba(239,68,68,0.7)',
                'rgba(249,115,22,0.7)',
                'rgba(234,179,8,0.7)',
                'rgba(34,197,94,0.7)',
              ],
              borderRadius: 6, borderWidth: 0,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
            },
          },
        });
      }
    };

    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '20px',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
      <div style={cardStyle}>
        <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', margin: '0 0 16px' }}>
          Reports this week
        </p>
        <div style={{ position: 'relative', height: '160px' }}>
          <canvas ref={weeklyRef} role="img" aria-label="Weekly reports bar chart" />
        </div>
      </div>

      <div style={cardStyle}>
        <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', margin: '0 0 16px' }}>
          By status
        </p>
        <div style={{ position: 'relative', height: '160px' }}>
          <canvas ref={statusRef} role="img" aria-label="Status breakdown doughnut chart" />
        </div>
      </div>

      <div style={cardStyle}>
        <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', margin: '0 0 16px' }}>
          By severity
        </p>
        <div style={{ position: 'relative', height: '160px' }}>
          <canvas ref={sevRef} role="img" aria-label="Severity breakdown bar chart" />
        </div>
      </div>
    </div>
  );
}