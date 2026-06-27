import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Users, Building } from 'lucide-react';
import { AdminStatusUpdate } from '@/components/admin/AdminStatusUpdate';

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  high:     { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' },
  medium:   { bg: 'rgba(234,179,8,0.15)',  text: '#facc15' },
  low:      { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: 'rgba(59,130,246,0.15)',   text: '#60a5fa' },
  in_progress: { bg: 'rgba(168,85,247,0.15)',   text: '#c084fc' },
  resolved:    { bg: 'rgba(34,197,94,0.15)',    text: '#4ade80' },
  closed:      { bg: 'rgba(100,116,139,0.15)',  text: '#94a3b8' },
};

const BADGE_ICONS: Record<string, string> = {
  newcomer: '🌱', reporter: '📋', guardian: '🛡️', hero: '⭐', champion: '🏆',
};

export default async function AdminPage() {
  await requireAdmin(); 
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from('reports')
    .select('*, users(name), departments(name)')
    .order('created_at', { ascending: false });

  const { data: leaderboard } = await supabase
    .from('users')
    .select('id, name, points, reports_count, badge_level')
    .order('points', { ascending: false })
    .limit(10);

  const { data: deptStats } = await supabase
    .from('reports')
    .select('departments(name), status');

  const total = reports?.length ?? 0;
  const open = reports?.filter(r => r.status === 'open').length ?? 0;
  const inProgress = reports?.filter(r => r.status === 'in_progress').length ?? 0;
  const resolved = reports?.filter(r => r.status === 'resolved').length ?? 0;
  const critical = reports?.filter(r => r.severity === 'critical').length ?? 0;
  const totalUsers = leaderboard?.length ?? 0;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '24px', margin: 0 }}>
          Admin dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '6px' }}>
          Manage all civic reports and community activity
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { icon: FileText,      label: 'Total',       value: total,      color: '#60a5fa' },
          { icon: AlertTriangle, label: 'Open',        value: open,       color: '#facc15' },
          { icon: TrendingUp,    label: 'In Progress', value: inProgress,  color: '#c084fc' },
          { icon: CheckCircle,   label: 'Resolved',    value: resolved,   color: '#4ade80' },
          { icon: AlertTriangle, label: 'Critical',    value: critical,   color: '#f87171' },
          { icon: Users,         label: 'Users',       value: totalUsers, color: '#34d399' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px',
          }}>
            <s.icon size={16} style={{ color: s.color, marginBottom: '10px' }} />
            <p style={{ color: s.color, fontSize: '24px', fontWeight: 700, margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Reports table */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '16px', margin: 0 }}>All reports</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Issue', 'Severity', 'Status', 'Reporter', 'Date', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      color: 'rgba(255,255,255,0.35)', fontWeight: 500, whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports?.map((r: any) => {
                  const sev = SEVERITY_COLORS[r.severity] ?? SEVERITY_COLORS.medium;
                  const stat = STATUS_COLORS[r.status] ?? STATUS_COLORS.open;
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <Link href={`/reports/${r.id}`}>
                          <p style={{
                            color: '#f8fafc', fontWeight: 500, margin: '0 0 2px',
                            maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {r.title}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>
                            {r.departments?.name ?? 'Unassigned'}
                          </p>
                        </Link>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                          background: sev.bg, color: sev.text, whiteSpace: 'nowrap',
                        }}>
                          {r.severity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 500,
                          background: stat.bg, color: stat.text, whiteSpace: 'nowrap',
                        }}>
                          {r.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>
                        {r.is_anonymous ? 'Anonymous' : (r.users?.name ?? '—')}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <AdminStatusUpdate reportId={r.id} currentStatus={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {(!reports || reports.length === 0) && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                No reports yet
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Leaderboard */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '20px',
          }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '16px', margin: '0 0 16px' }}>
              🏆 Leaderboard
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaderboard?.map((user: any, i) => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 700, width: '20px', textAlign: 'center', flexShrink: 0,
                    color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'rgba(255,255,255,0.25)',
                  }}>
                    #{i + 1}
                  </span>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: '13px',
                  }}>
                    {user.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: '#f8fafc', fontSize: '13px', fontWeight: 500,
                      margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {BADGE_ICONS[user.badge_level] ?? '🌱'} {user.name}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                      {user.reports_count ?? 0} reports
                    </p>
                  </div>
                  <span style={{ color: '#facc15', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
                    {user.points}pt
                  </span>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                  No users yet
                </p>
              )}
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '20px',
          }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '16px', margin: '0 0 16px' }}>
              📊 By category
            </h2>
            {(() => {
              const cats: Record<string, number> = {};
              reports?.forEach((r: any) => { cats[r.category] = (cats[r.category] ?? 0) + 1; });
              const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6);
              const max = sorted[0]?.[1] ?? 1;
              return sorted.map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{cat}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{count}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '99px', height: '4px' }}>
                    <div style={{
                      background: '#3b82f6', borderRadius: '99px', height: '100%',
                      width: `${(count / max) * 100}%`, transition: 'width 0.5s',
                    }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}