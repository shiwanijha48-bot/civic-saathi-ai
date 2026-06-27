import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ReportActions } from '@/components/reports/ReportActions';
import { VerificationBadge } from '@/components/reports/VerificationBadge';
import { ValidationButtons } from '@/components/reports/ValidationButtons';
import Link from 'next/link';
import { ArrowUp, MessageSquare, MapPin, Calendar, Building } from 'lucide-react';
import { CommentSection } from '@/components/reports/CommentSection';
import { UpvoteButton } from '@/components/reports/UpvoteButton';
import { IssueTimeline } from '@/components/reports/IssueTimeline';

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

// Fetch timeline events
  const { data: timelineEvents } = await supabase
    .from('timeline_events')
    .select('*, users(name)')
    .eq('report_id', report.id)
    .order('created_at', { ascending: true });

  // Validation counts — ADD THESE HERE
  const { count: confirmsCount } = await supabase
    .from('report_validations')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', report.id)
    .eq('type', 'confirm');

  const { count: disputesCount } = await supabase
    .from('report_validations')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', report.id)
    .eq('type', 'dispute');

  const { data: userValidation } = user ? await supabase
    .from('report_validations')
    .select('type')
    .eq('report_id', report.id)
    .eq('user_id', user.id)
    .maybeSingle() : { data: null };

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: report, error } = await supabase
    .from('reports')
    .select('*, users(name, email), departments(name, email)')
    .eq('id', id)
    .single();

  if (error || !report) notFound();

  // Check if user is admin
  const { data: userProfile } = user
    ? await supabase.from('users').select('is_admin').eq('id', user.id).single()
    : { data: null };

  const isAdmin = userProfile?.is_admin ?? false;

  const { data: userUpvote } = user
    ? await supabase
        .from('upvotes')
        .select('id')
        .eq('report_id', report.id)
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null };

  const { data: comments } = await supabase
    .from('comments')
    .select('*, users(name)')
    .eq('report_id', report.id)
    .order('created_at', { ascending: true });

  const { count: liveCommentsCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', report.id);

  const { count: liveUpvotesCount } = await supabase
    .from('upvotes')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', report.id);


  // Fetch timeline events
  const { data: timelineEvents } = await supabase
    .from('timeline_events')
    .select('*, users(name)')
    .eq('report_id', report.id)
    .order('created_at', { ascending: true });

  const sev  = SEVERITY_COLORS[report.severity] ?? SEVERITY_COLORS.medium;
  const stat = STATUS_COLORS[report.status]     ?? STATUS_COLORS.open;
  const dept     = (report as any).departments;
  const reporter = (report as any).users;

  return (
    <div style={{ padding: '32px', maxWidth: '760px', margin: '0 auto' }}>
      <Link href="/community" style={{
        color: 'rgba(255,255,255,0.4)', fontSize: '14px',
        display: 'inline-block', marginBottom: '24px',
      }}>
        ← Back to community
      </Link>

      {/* Image */}
      {report.image_url && (
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          <img
            src={report.image_url}
            alt={report.title}
            style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, background: sev.bg, color: sev.text }}>
          {report.severity?.toUpperCase()}
        </span>
        <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500, background: stat.bg, color: stat.text }}>
          {report.status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </span>
        <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '12px', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
          {report.category}
        </span>
        <VerificationBadge
  upvotesCount={liveUpvotesCount ?? 0}
  isVerified={report.is_verified ?? false}
/>
      </div>

      {/* Title */}
      <h1 style={{ color: '#f8fafc', fontSize: '26px', fontWeight: 700, margin: '0 0 24px', lineHeight: 1.3 }}>
        {report.title}
      </h1>
      

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { icon: ArrowUp,       label: 'Upvotes',    value: liveUpvotesCount ?? 0 },
          { icon: MessageSquare, label: 'Comments',   value: liveCommentsCount ?? 0 },
          { icon: Calendar,      label: 'Reported',   value: new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
          { icon: Building,      label: 'Department', value: dept?.name ?? 'Unassigned' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '14px',
          }}>
            <m.icon size={15} style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }} />
            <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{m.value}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Reporter */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '14px 16px', marginBottom: '16px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: '14px',
        }}>
          {report.is_anonymous ? '?' : (reporter?.name?.charAt(0)?.toUpperCase() ?? '?')}
        </div>
        <div>
          <p style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500, margin: 0 }}>
            {report.is_anonymous ? 'Anonymous' : (reporter?.name ?? 'Unknown')}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
            Reported this issue
          </p>
        </div>
      </div>

      {/* Description */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: '0 0 10px' }}>Description</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
          {report.description}
        </p>
      </div>

      {/* AI Summary */}
      {report.ai_summary && (
        <div style={{
          background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: '16px', padding: '20px', marginBottom: '16px',
        }}>
          <h2 style={{ color: '#c084fc', fontWeight: 600, fontSize: '15px', margin: '0 0 10px' }}>
            ✨ AI Summary
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
            {report.ai_summary}
          </p>
        </div>
      )}

      {/* Location */}
      {(report.address || report.latitude) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '14px 16px', marginBottom: '24px',
        }}>
          <MapPin size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
            {report.address ?? `${report.latitude?.toFixed(5)}, ${report.longitude?.toFixed(5)}`}
          </p>
        </div>
      )}

      {/* Edit / Delete — only shown to report author */}
{user && (
  <ReportActions
    reportId={report.id}
    userId={user.id}
    reportUserId={report.user_id}
    initialTitle={report.title}
    initialDescription={report.description}
  />
)}

      {/* Upvote */}
      <UpvoteButton
        reportId={report.id}
        initialCount={report.upvotes_count ?? 0}
        initialUpvoted={!!userUpvote}
        userId={user?.id}
      />

      <ValidationButtons
  reportId={report.id}
  userId={user?.id}
  initialConfirms={confirmsCount ?? 0}
  initialDisputes={disputesCount ?? 0}
  initialUserValidation={(userValidation?.type as 'confirm' | 'dispute') ?? null}
/>


      {/* ✅ Timeline — new feature */}
      <div style={{ marginBottom: '24px' }}>
        <IssueTimeline
          reportId={report.id}
          currentStatus={report.status}
          events={timelineEvents ?? []}
          isAdmin={isAdmin}
        />
      </div>

      {/* Comments */}
      <CommentSection
        reportId={report.id}
        comments={comments ?? []}
        userId={user?.id}
      />
    </div>
  );
}