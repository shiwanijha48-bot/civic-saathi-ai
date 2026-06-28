import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import Link from 'next/link';
import { FileText, TrendingUp, Award, Plus, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BADGE_LEVELS } from '@/lib/constants';

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  open:        { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa',  label: 'Open' },
  in_progress: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc',  label: 'In Progress' },
  resolved:    { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80',  label: 'Resolved' },
  closed:      { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', label: 'Closed' },
};

const SEVERITY_DOT: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: profile },
    { data: myReports },
    { data: recentReports },
    { count: totalReports },
    { count: resolvedCount },
    { data: weeklyData },
    { data: hotspots },
    { data: criticalUnresolved },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('reports').select('*, departments(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('reports').select('*, users(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'resolved'),
    supabase.from('reports').select('created_at, status').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: true }),
    supabase.from('reports').select('category, severity, status').neq('status', 'resolved').neq('status', 'closed'),
    supabase.from('reports').select('id, title, category, created_at').eq('severity', 'critical').eq('status', 'open').order('created_at', { ascending: true }).limit(3),
  ]);

  const badge = profile
    ? (BADGE_LEVELS[profile.badge_level as keyof typeof BADGE_LEVELS] ?? BADGE_LEVELS.newcomer)
    : BADGE_LEVELS.newcomer;

  const nextBadgeLevels = [
    { key: 'reporter',  pts: 50   },
    { key: 'guardian',  pts: 200  },
    { key: 'hero',      pts: 500  },
    { key: 'champion',  pts: 1000 },
  ];
  const nextBadge = nextBadgeLevels.find(l => (profile?.points ?? 0) < l.pts);
  const prevPts   = nextBadge
    ? (nextBadgeLevels[nextBadgeLevels.findIndex(l => l.key === nextBadge.key) - 1]?.pts ?? 0)
    : 0;
  const progressPct = nextBadge
    ? Math.min(Math.round(((profile?.points ?? 0) - prevPts) / (nextBadge.pts - prevPts) * 100), 100)
    : 100;

  /* ── Hotspot calculations ── */
  const catMap: Record<string, number> = {};
  hotspots?.forEach((r: any) => { catMap[r.category] = (catMap[r.category] ?? 0) + 1; });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxCat  = topCats[0]?.[1] ?? 1;

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '20px',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '24px', margin: 0 }}>
            Welcome back, {profile?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontSize: '14px' }}>
            Here's your civic impact at a glance.
          </p>
        </div>
        <Link href="/report" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#3b82f6', color: 'white', padding: '10px 18px',
          borderRadius: '10px', fontWeight: 600, fontSize: '14px',
        }}>
          <Plus size={16} /> New report
        </Link>
      </div>

      {/* ── KPI Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: FileText,      label: 'Reports filed',   value: totalReports ?? 0,  color: '#60a5fa' },
          { icon: TrendingUp,    label: 'Issues resolved', value: resolvedCount ?? 0, color: '#4ade80' },
          { icon: Award,         label: 'Points earned',   value: profile?.points ?? 0, color: '#facc15' },
          { icon: ShieldCheck,   label: 'Rank',            value: `${badge.icon} ${badge.label}`, color: '#c084fc' },
        ].map(s => (
          <div key={s.label} style={card}>
            <s.icon size={16} style={{ color: s.color, marginBottom: '10px' }} />
            <p style={{ color: s.color, fontSize: '22px', fontWeight: 700, margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Badge progress ── */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'newcomer', icon: '🌱', label: 'Newcomer',       pts: 0    },
              { key: 'reporter', icon: '📋', label: 'Reporter',        pts: 50   },
              { key: 'guardian', icon: '🛡️', label: 'Guardian',       pts: 200  },
              { key: 'hero',     icon: '⭐', label: 'Community Hero',  pts: 500  },
              { key: 'champion', icon: '🏆', label: 'Champion',        pts: 1000 },
            ].map(b => {
              const earned  = (profile?.points ?? 0) >= b.pts;
              const current = profile?.badge_level === b.key;
              return (
                <div key={b.key} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  padding: '10px 14px', borderRadius: '10px', minWidth: '80px',
                  background: current ? 'rgba(59,130,246,0.15)' : earned ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${current ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: earned ? 1 : 0.35,
                }}>
                  <span style={{ fontSize: '20px', filter: earned ? 'none' : 'grayscale(1)' }}>{b.icon}</span>
                  <span style={{ color: current ? '#60a5fa' : '#f8fafc', fontSize: '10px', fontWeight: 600, textAlign: 'center' }}>
                    {b.label}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>{b.pts}pts</span>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
            <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600, margin: '0 0 2px' }}>
              {profile?.points ?? 0} points
            </p>
            {nextBadge && (
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                {nextBadge.pts - (profile?.points ?? 0)} to next rank
              </p>
            )}
          </div>
        </div>
        {nextBadge && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '99px', height: '5px' }}>
              <div style={{
                background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                borderRadius: '99px', height: '100%',
                width: `${progressPct}%`, transition: 'width 0.6s ease',
              }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '4px' }}>
              {progressPct}% to {BADGE_LEVELS[nextBadge.key as keyof typeof BADGE_LEVELS]?.label}
            </p>
          </div>
        )}
      </div>

      {/* ── My reports + Community feed ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

        {/* My reports */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: 0 }}>My recent reports</h2>
            <Link href="/community" style={{ color: '#60a5fa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {myReports && myReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {myReports.map((report: any) => {
                const stat = STATUS_STYLE[report.status] ?? STATUS_STYLE.open;
                return (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '10px', borderRadius: '10px',
                    }}>
                      <div style={{
                        width: '7px', height: '7px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
                        background: SEVERITY_DOT[report.severity] ?? '#64748b',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 500, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {report.title}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{report.category}</p>
                      </div>
                      <span style={{
                        fontSize: '11px', padding: '2px 7px', borderRadius: '99px', flexShrink: 0,
                        background: stat.bg, color: stat.text, fontWeight: 500,
                      }}>
                        {stat.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.25)' }}>
              <FileText size={36} style={{ marginBottom: '10px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px', margin: '0 0 8px' }}>No reports yet</p>
              <Link href="/report" style={{ color: '#60a5fa', fontSize: '12px' }}>
                File your first report →
              </Link>
            </div>
          )}
        </div>

        {/* Community feed */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: 0 }}>Community feed</h2>
            <Link href="/community" style={{ color: '#60a5fa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentReports && recentReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentReports.map((report: any) => (
                <Link key={report.id} href={`/reports/${report.id}`}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', borderRadius: '10px' }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
                      background: SEVERITY_DOT[report.severity] ?? '#64748b',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 500, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.title}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                        {report.users?.name ?? 'Anonymous'} · {report.category}
                      </p>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', flexShrink: 0 }}>
                      ↑ {report.upvotes_count ?? 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>
              No community reports yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Predictive Insights ── */}
      <div style={{ ...card }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <TrendingUp size={18} style={{ color: '#c084fc' }} />
          <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: 0 }}>Predictive insights</h2>
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '99px',
            background: 'rgba(168,85,247,0.15)', color: '#c084fc', fontWeight: 600,
          }}>
            AI POWERED
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>

          {/* Problem hotspots */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              🔥 Problem hotspots
            </p>
            {topCats.length > 0 ? topCats.map(([cat, count]) => (
              <div key={cat} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#f8fafc', fontSize: '12px' }}>{cat}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{count} open</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '99px', height: '4px' }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                    borderRadius: '99px', height: '100%',
                    width: `${(count / maxCat) * 100}%`,
                  }} />
                </div>
              </div>
            )) : (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>No open issues 🎉</p>
            )}
          </div>

          {/* Severity breakdown */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              📊 Severity breakdown
            </p>
            {[
              { key: 'critical', label: 'Critical', color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
              { key: 'high',     label: 'High',     color: '#fb923c', bg: 'rgba(249,115,22,0.15)' },
              { key: 'medium',   label: 'Medium',   color: '#facc15', bg: 'rgba(234,179,8,0.15)'  },
              { key: 'low',      label: 'Low',      color: '#4ade80', bg: 'rgba(34,197,94,0.15)'  },
            ].map(s => {
              const count = hotspots?.filter((r: any) => r.severity === s.key).length ?? 0;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px', borderRadius: '99px', background: s.bg, color: s.color }}>
                    {count}
                  </span>
                </div>
              );
            })}
            <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <p style={{ color: '#c084fc', fontSize: '12px', margin: 0 }}>
                {(hotspots?.filter((r: any) => r.severity === 'critical').length ?? 0) > 0
                  ? `⚠️ ${hotspots?.filter((r: any) => r.severity === 'critical').length} critical issue(s) need immediate attention`
                  : '✅ No critical issues right now'
                }
              </p>
            </div>
          </div>

          {/* Needs attention */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              ⚠️ Needs attention
            </p>
            {criticalUnresolved && criticalUnresolved.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criticalUnresolved.map((r: any) => {
                  const daysOld = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
                  return (
                    <Link key={r.id} href={`/reports/${r.id}`}>
                      <div style={{
                        padding: '9px 10px', borderRadius: '8px',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                      }}>
                        <p style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 500, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.title}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                          {r.category} · {daysOld === 0 ? 'today' : `${daysOld}d ago`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: '28px', margin: '0 0 6px' }}>✅</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
                  No critical issues pending
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly trend chart */}
        <WeeklyTrendChart data={weeklyData ?? []} />
      </div>

    </div>
  );
}