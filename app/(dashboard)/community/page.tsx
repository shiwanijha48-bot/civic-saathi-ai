import { createClient } from '@/lib/supabase/server';
import { VerificationBadge } from '@/components/reports/VerificationBadge';
import Link from 'next/link';
import { ArrowUp, MessageSquare, MapPin, Calendar, Plus } from 'lucide-react';

const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', dot: '#ef4444' },
  high:     { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', dot: '#f97316' },
  medium:   { bg: 'rgba(234,179,8,0.15)',  text: '#facc15', dot: '#eab308' },
  low:      { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', dot: '#22c55e' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  in_progress: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc' },
  resolved:    { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
  closed:      { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
};

export const revalidate = 0;
export default async function CommunityPage() {
  const supabase = await createClient();

  const { data: reports, error } = await supabase
    .from('reports')
    .select(`
      *,
      users(name),
      departments(name),
      upvotes(count),
      comments(count)
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Community fetch error:', error);

  const total    = reports?.length ?? 0;
  const open     = reports?.filter(r => r.status === 'open').length ?? 0;
  const resolved = reports?.filter(r => r.status === 'resolved').length ?? 0;
  const critical = reports?.filter(r => r.severity === 'critical').length ?? 0;

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '24px', margin: 0 }}>
            Community reports
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '6px' }}>
            {total} civic issues reported by your community
          </p>
        </div>
        <Link href="/report" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#3b82f6', color: 'white', padding: '10px 18px',
          borderRadius: '10px', fontWeight: 600, fontSize: '14px',
        }}>
          <Plus size={16} /> Report issue
        </Link>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total',    value: total,    color: '#60a5fa' },
          { label: 'Open',     value: open,     color: '#facc15' },
          { label: 'Resolved', value: resolved, color: '#4ade80' },
          { label: 'Critical', value: critical, color: '#f87171' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px',
          }}>
            <p style={{ color: s.color, fontSize: '22px', fontWeight: 700, margin: '0 0 2px' }}>{s.value}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Reports list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reports && reports.length > 0 ? (
          reports.map((report: any) => {
            const sev  = SEVERITY_COLORS[report.severity] ?? SEVERITY_COLORS.medium;
            const stat = STATUS_COLORS[report.status]     ?? STATUS_COLORS.open;

            return (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '20px',
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Image or placeholder */}
                    {report.image_url ? (
                      <img
                        src={report.image_url}
                        alt=""
                        style={{
                          width: '80px', height: '80px', borderRadius: '10px',
                          objectFit: 'cover', flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <MapPin size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Badges */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                          background: sev.bg, color: sev.text,
                        }}>
                          {report.severity?.toUpperCase()}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 500,
                          background: stat.bg, color: stat.text,
                        }}>
                          {report.status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '99px', fontSize: '11px',
                          background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
                        }}>
                          {report.category}
                        </span>
                        {(report.upvotes?.[0]?.count ?? 0) >= 5 && (
  <span style={{
    padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
    background: 'rgba(34,197,94,0.15)', color: '#4ade80',
  }}>
    ✓ Verified
  </span>
)}
                      </div>

                      {/* Title */}
                      <h3 style={{
                        color: '#f8fafc', fontWeight: 600, fontSize: '15px',
                        margin: '0 0 6px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {report.title}
                      </h3>

                      {/* Description */}
                      <p style={{
                        color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 12px',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {report.description}
                      </p>

                      {/* Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                          <ArrowUp size={12} /> {report.upvotes?.[0]?.count ?? 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                          <MessageSquare size={12} /> {report.comments?.[0]?.count ?? 0}
                        </span>
                        {report.address && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                            <MapPin size={12} />
                            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {report.address}
                            </span>
                          </span>
                        )}
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                          <Calendar size={12} />
                          {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {report.is_anonymous ? 'Anonymous' : (report.users?.name ?? 'Unknown')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: 'rgba(255,255,255,0.3)' }}>
            <MapPin size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
              No reports yet
            </p>
            <p style={{ fontSize: '14px', margin: '0 0 20px' }}>Be the first to report a civic issue</p>
            <Link href="/report" style={{
              background: '#3b82f6', color: 'white', padding: '10px 22px',
              borderRadius: '10px', fontWeight: 600, fontSize: '14px',
            }}>
              Report an issue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}