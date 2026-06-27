import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, TrendingUp, Award, Plus, ArrowRight, AlertTriangle } from 'lucide-react';
import { SEVERITY_CONFIG, STATUS_CONFIG, BADGE_LEVELS } from '@/lib/constants';
import { Report } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
const { data: hotspots } = await supabase
    .from('reports')
    .select('category, severity, status, address')
    .neq('status', 'resolved')
    .neq('status', 'closed');

  const { data: criticalUnresolved } = await supabase
    .from('reports')
    .select('id, title, category, created_at')
    .eq('severity', 'critical')
    .eq('status', 'open')
    .order('created_at', { ascending: true })
    .limit(3);

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: myReports } = await supabase
    .from('reports')
    .select('*, departments(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentReports } = await supabase
    .from('reports')
    .select('*, users(name), departments(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: totalReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: resolvedCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'resolved');

  const badge = profile
    ? (BADGE_LEVELS[profile.badge_level as keyof typeof BADGE_LEVELS] ?? BADGE_LEVELS.newcomer)
    : BADGE_LEVELS.newcomer;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/50 mt-1">Here's your civic impact at a glance.</p>
        </div>
        <Link
          href="/report"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: 'Reports filed', value: totalReports ?? 0, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Issues resolved', value: resolvedCount ?? 0, color: 'text-green-400' },
          { icon: Award, label: 'Points earned', value: profile?.points ?? 0, color: 'text-yellow-400' },
          { icon: AlertTriangle, label: 'Rank', value: badge.label, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My recent reports */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">My recent reports</h2>
            <Link href="/community" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {myReports && myReports.length > 0 ? (
            <div className="space-y-3">
              {(myReports as Report[]).map((report) => (
                <Link key={report.id} href={`/reports/${report.id}`}>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${SEVERITY_CONFIG[report.severity]?.dot ?? 'bg-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{report.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">{report.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[report.status]?.color}`}>
                      {STATUS_CONFIG[report.status]?.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No reports yet</p>
              <Link href="/report" className="text-blue-400 text-xs mt-2 inline-block">File your first report →</Link>
            </div>
          )}
        </div>

        {/* Community feed */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Community feed</h2>
            <Link href="/community" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentReports && recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report: any) => (
                <Link key={report.id} href={`/reports/${report.id}`}>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG]?.dot ?? 'bg-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{report.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {report.users?.name ?? 'Anonymous'} · {report.category}
                      </p>
                    </div>
                    <span className="text-white/30 text-xs">↑ {report.upvotes_count}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm text-center py-8">No community reports yet.</p>
          )}
        </div>
      </div>
      {/* Predictive Insights */}
<div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6">
  <div className="flex items-center gap-2 mb-5">
    <TrendingUp className="w-5 h-5 text-purple-400" />
    <h2 className="font-semibold text-white">Predictive insights</h2>
    <span style={{
      fontSize: '10px', padding: '2px 8px', borderRadius: '99px',
      background: 'rgba(168,85,247,0.15)', color: '#c084fc', fontWeight: 600,
    }}>
      AI POWERED
    </span>
  </div>

  <div className="grid md:grid-cols-3 gap-4">
    {/* Category hotspots */}
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '16px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        🔥 Problem hotspots
      </p>
      {(() => {
        const cats: Record<string, number> = {};
        hotspots?.forEach((r: any) => {
          cats[r.category] = (cats[r.category] ?? 0) + 1;
        });
        const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 4);
        const max = sorted[0]?.[1] ?? 1;
        return sorted.length > 0 ? sorted.map(([cat, count]) => (
          <div key={cat} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#f8fafc', fontSize: '12px' }}>{cat}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{count} open</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '99px', height: '4px' }}>
              <div style={{
                background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                borderRadius: '99px', height: '100%',
                width: `${(count / max) * 100}%`,
              }} />
            </div>
          </div>
        )) : <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>No open issues</p>;
      })()}
    </div>

    {/* Severity breakdown */}
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '16px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        📊 Severity breakdown
      </p>
      {[
        { key: 'critical', label: 'Critical', color: '#f87171', bg: 'rgba(239,68,68,0.2)' },
        { key: 'high',     label: 'High',     color: '#fb923c', bg: 'rgba(249,115,22,0.2)' },
        { key: 'medium',   label: 'Medium',   color: '#facc15', bg: 'rgba(234,179,8,0.2)' },
        { key: 'low',      label: 'Low',      color: '#4ade80', bg: 'rgba(34,197,94,0.2)' },
      ].map(s => {
        const count = hotspots?.filter((r: any) => r.severity === s.key).length ?? 0;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', flex: 1 }}>{s.label}</span>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '1px 8px',
              borderRadius: '99px', background: s.bg, color: s.color,
            }}>{count}</span>
          </div>
        );
      })}
      <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
        <p style={{ color: '#c084fc', fontSize: '12px', margin: 0 }}>
          💡 {hotspots && hotspots.filter((r: any) => r.severity === 'critical').length > 0
            ? `${hotspots.filter((r: any) => r.severity === 'critical').length} critical issue${hotspots.filter((r: any) => r.severity === 'critical').length > 1 ? 's' : ''} need immediate attention`
            : 'No critical issues — community is in good shape!'}
        </p>
      </div>
    </div>

    {/* Critical alerts */}
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '16px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        ⚠️ Needs attention
      </p>
      {criticalUnresolved && criticalUnresolved.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {criticalUnresolved.map((r: any) => {
            const daysOld = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
            return (
              <Link key={r.id} href={`/reports/${r.id}`}>
                <div style={{
                  padding: '10px', borderRadius: '8px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                  cursor: 'pointer',
                }}>
                  <p style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 500, margin: '0 0 3px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          <p style={{ fontSize: '24px', margin: '0 0 6px' }}>✅</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
            No critical issues pending
          </p>
        </div>
      )}
    </div>
  </div>
</div>
    </div>
  );
}