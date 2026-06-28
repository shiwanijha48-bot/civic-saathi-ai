import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Users, Clock } from 'lucide-react';
import { AdminStatusUpdate } from '@/components/admin/AdminStatusUpdate';
import { ImpactCharts } from '@/components/admin/ImpactCharts';
import { PredictiveInsights } from '@/components/admin/PredictiveInsights';

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  high:     { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' },
  medium:   { bg: 'rgba(234,179,8,0.15)',  text: '#facc15' },
  low:      { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  in_progress: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc' },
  resolved:    { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
  closed:      { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
};

const BADGE_ICONS: Record<string, string> = {
  newcomer: '🌱', reporter: '📋', guardian: '🛡️', hero: '⭐', champion: '🏆',
};

export const revalidate = 0;

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [
    { data: reports },
    { data: leaderboard },
  ] = await Promise.all([
    supabase.from('reports').select('*, users(name), departments(name)').order('created_at', { ascending: false }),
    supabase.from('users').select('id, name, points, reports_count, badge_level').order('points', { ascending: false }).limit(10),
  ]);

  const total       = reports?.length ?? 0;
  const open        = reports?.filter(r => r.status === 'open').length ?? 0;
  const inProgress  = reports?.filter(r => r.status === 'in_progress').length ?? 0;
  const resolved    = reports?.filter(r => r.status === 'resolved').length ?? 0;
  const critical    = reports?.filter(r => r.severity === 'critical').length ?? 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const resolvedReports = reports?.filter(r => r.status === 'resolved') ?? [];
  const avgDays = resolvedReports.length > 0
    ? Math.round(resolvedReports.reduce((acc, r: any) => {
        return acc + (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / 86400000;
      }, 0) / resolvedReports.length)
    : 0;

  const catMap: Record<string, number> = {};
  reports?.forEach((r: any) => { catMap[r.category] = (catMap[r.category] ?? 0) + 1; });

  const statusData = { open, in_progress: inProgress, resolved, closed: reports?.filter(r => r.status === 'closed').length ?? 0 };

  const last7: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7[d.toLocaleDateString('en-IN', { weekday: 'short' })] = 0;
  }
  reports?.forEach((r: any) => {
    const key = new Date(r.created_at).toLocaleDateString('en-IN', { weekday: 'short' });
    if (key in last7) last7[key]++;
  });

  const sevData = {
    critical, high: reports?.filter(r => r.severity === 'high').length ?? 0,
    medium: reports?.filter(r => r.severity === 'medium').length ?? 0,
    low: reports?.filter(r => r.severity === 'low').length ?? 0,
  };

  const now = Date.now();
  const overdue = reports?.filter((r: any) => {
    if (r.status === 'resolved' || r.status === 'closed') return false;
    const age = (now - new Date(r.created_at).getTime()) / 86400000;
    const sla = r.severity === 'critical' ? 1 : r.severity === 'high' ? 3 : r.severity === 'medium' ? 7 : 14;
    return age > sla;
  }) ?? [];

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '24px', margin: 0 }}>
          Impact dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '6px' }}>
          Real-time civic issue analytics and management
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: FileText,      label: 'Total',        value: total,                color: '#60a5fa' },
          { icon: AlertTriangle, label: 'Open',         value: open,                 color: '#facc15' },
          { icon: TrendingUp,    label: 'In progress',  value: inProgress,           color: '#c084fc' },
          { icon: CheckCircle,   label: 'Resolved',     value: resolved,             color: '#4ade80' },
          { icon: Clock,         label: 'Avg. days',    value: `${avgDays}d`,        color: '#fb923c' },
          { icon: Users,         label: 'Resolution %', value: `${resolutionRate}%`, color: '#34d399' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '16px' }}>
            <s.icon size={15} style={{ color: s.color, marginBottom: '10px' }} />
            <p style={{ color: s.color, fontSize: '22px', fontWeight: 700, margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <PredictiveInsights reports={reports ?? []} />

      <ImpactCharts
        categoryData={catMap}
        statusData={statusData}
        weeklyData={last7}
        severityData={sevData}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginTop: '20px' }}>

        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: 0 }}>All reports</h2>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{total} total</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Issue', 'Severity', 'Status', 'Reporter', 'Date', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports?.map((r: any) => {
                  const sev  = SEVERITY_COLORS[r.severity] ?? SEVERITY_COLORS.medium;
                  const stat = STATUS_COLORS[r.status]     ?? STATUS_COLORS.open;
                  const isOverdue = overdue.some(o => o.id === r.id);
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: isOverdue ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <Link href={`/reports/${r.id}`}>
                          <p style={{ color: '#f8fafc', fontWeight: 500, margin: '0 0 2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isOverdue && '⚠️ '}{r.title}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>
                            {r.departments?.name ?? 'Unassigned'}
                          </p>
                        </Link>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: sev.bg, color: sev.text }}>
                          {r.severity}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', background: stat.bg, color: stat.text }}>
                          {r.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                        {r.is_anonymous ? 'Anonymous' : (r.users?.name ?? '—')}
                      </td>
                      <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <AdminStatusUpdate reportId={r.id} currentStatus={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!reports || reports.length === 0) && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '40px', fontSize: '14px' }}>
                No reports yet
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ ...card, padding: '20px' }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: '0 0 14px' }}>⏱️ SLA status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: overdue.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <p style={{ color: overdue.length > 0 ? '#f87171' : '#4ade80', fontSize: '22px', fontWeight: 700, margin: '0 0 2px' }}>
                  {overdue.length}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>Overdue</p>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <p style={{ color: '#60a5fa', fontSize: '22px', fontWeight: 700, margin: '0 0 2px' }}>{resolutionRate}%</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>Resolved</p>
              </div>
            </div>
            {overdue.length > 0 ? overdue.slice(0, 4).map((r: any) => (
              <Link key={r.id} href={`/reports/${r.id}`}>
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', marginBottom: '6px' }}>
                  <p style={{ color: '#f87171', fontSize: '12px', fontWeight: 500, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>
                    {Math.floor((now - new Date(r.created_at).getTime()) / 86400000)}d old · {r.severity}
                  </p>
                </div>
              </Link>
            )) : (
              <p style={{ color: '#4ade80', fontSize: '13px', textAlign: 'center', margin: 0 }}>
                All issues within SLA ✓
              </p>
            )}
          </div>

          <div style={{ ...card, padding: '20px' }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: '0 0 14px' }}>🏆 Leaderboard</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaderboard?.map((u: any, i) => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, width: '20px', textAlign: 'center', flexShrink: 0,
                    color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'rgba(255,255,255,0.2)',
                  }}>#{i + 1}</span>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: '12px' }}>
                    {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 500, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {BADGE_ICONS[u.badge_level] ?? '🌱'} {u.name}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{u.reports_count ?? 0} reports</p>
                  </div>
                  <span style={{ color: '#facc15', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>{u.points}pt</span>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>No users yet</p>
              )}
            </div>
          </div>

          <div style={{ ...card, padding: '20px' }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: '0 0 14px' }}>📊 By category</h2>
            {Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([cat, count]) => {
              const max = Math.max(...Object.values(catMap));
              return (
                <div key={cat} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{cat}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{count}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '99px', height: '4px' }}>
                    <div style={{ background: '#3b82f6', borderRadius: '99px', height: '100%', width: `${(count / max) * 100}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(catMap).length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}