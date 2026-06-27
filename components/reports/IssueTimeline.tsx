'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle, Clock, Loader2 } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
  created_by: string | null;
  users?: { name: string } | null;
}

interface Props {
  reportId: string;
  currentStatus: string;
  events: TimelineEvent[];
  isAdmin: boolean;
}

const STEPS = [
  {
    status: 'open',
    label: 'Reported',
    desc: 'Issue submitted by citizen',
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.15)',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    desc: 'Department working on it',
    color: '#c084fc',
    bg: 'rgba(168,85,247,0.15)',
  },
  {
    status: 'resolved',
    label: 'Resolved',
    desc: 'Issue has been fixed',
    color: '#4ade80',
    bg: 'rgba(34,197,94,0.15)',
  },
  {
    status: 'closed',
    label: 'Closed',
    desc: 'Verified and closed',
    color: '#94a3b8',
    bg: 'rgba(100,116,139,0.15)',
  },
];

export function IssueTimeline({ reportId, currentStatus, events, isAdmin }: Props) {
  const [updating, setUpdating]   = useState(false);
  const [note, setNote]           = useState('');
  const [showNote, setShowNote]   = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const router = useRouter();

  const currentStepIndex = STEPS.findIndex(s => s.status === currentStatus);

  const advanceStatus = async (targetStatus: string, noteText: string) => {
    setUpdating(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Not authenticated'); setUpdating(false); return; }

    // Update report status
    const { error: reportError } = await supabase
      .from('reports')
      .update({ status: targetStatus, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (reportError) {
      toast.error('Failed to update status');
      setUpdating(false);
      return;
    }

    // Add timeline event
    const stepLabel = STEPS.find(s => s.status === targetStatus)?.label ?? targetStatus;
    await supabase.from('timeline_events').insert({
      report_id: reportId,
      status: targetStatus,
      note: noteText || `Status updated to ${stepLabel}`,
      created_by: user.id,
    });

    toast.success(`Status updated to ${stepLabel}`);
    try {
  const { data: reportData } = await supabase
    .from('reports')
    .select('title, user_id, users(email, name)')
    .eq('id', reportId)
    .single();

  const owner = (reportData as any)?.users;
  if (owner?.email) {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportTitle: reportData?.title,
        reportId,
        newStatus: targetStatus,
        userEmail: owner.email,
        userName: owner.name,
      }),
    });
  }
} catch (e) {
  console.error('Notification failed:', e);
}
    setNote('');
    setShowNote(false);
    setNextStatus('');
    setUpdating(false);
    router.refresh();
  };

  const handleStepClick = (targetStatus: string) => {
    if (!isAdmin) return;
    setNextStatus(targetStatus);
    setShowNote(true);
  };

  const confirmAdvance = () => {
    if (!nextStatus) return;
    advanceStatus(nextStatus, note);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: 0 }}>
          Issue timeline
        </h2>
        {isAdmin && (
          <span style={{
            fontSize: '11px', padding: '3px 8px', borderRadius: '99px',
            background: 'rgba(239,68,68,0.15)', color: '#f87171', fontWeight: 600,
          }}>
            ADMIN
          </span>
        )}
      </div>

      {/* Step indicators */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        {/* Connector line */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          right: '20px', height: '2px',
          background: 'rgba(255,255,255,0.08)', zIndex: 0,
        }} />
        {/* Progress fill */}
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          height: '2px', zIndex: 1, transition: 'width 0.5s ease',
          background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
          width: currentStepIndex <= 0 ? '0%'
            : currentStepIndex === 1 ? '33%'
            : currentStepIndex === 2 ? '66%'
            : '100%',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          {STEPS.map((step, i) => {
            const isDone    = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const isNext    = i === currentStepIndex + 1;
            const canClick  = isAdmin && (i === currentStepIndex + 1);

            return (
              <div
                key={step.status}
                onClick={() => canClick && handleStepClick(step.status)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '8px', flex: 1,
                  cursor: canClick ? 'pointer' : 'default',
                }}
              >
                {/* Circle */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? step.bg : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isDone ? step.color : 'rgba(255,255,255,0.12)'}`,
                  transition: 'all 0.3s ease',
                  transform: isCurrent ? 'scale(1.15)' : canClick ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isCurrent ? `0 0 0 4px ${step.color}22` : 'none',
                }}>
                  {isDone
                    ? <CheckCircle size={18} style={{ color: step.color }} />
                    : isNext && isAdmin
                    ? <Circle size={18} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    : <Clock size={18} style={{ color: 'rgba(255,255,255,0.15)' }} />
                  }
                </div>

                {/* Label */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    color: isDone ? '#f8fafc' : 'rgba(255,255,255,0.3)',
                    fontSize: '12px', fontWeight: isDone ? 600 : 400,
                    margin: '0 0 2px', transition: 'color 0.3s',
                  }}>
                    {step.label}
                  </p>
                  {canClick && isAdmin && (
                    <span style={{
                      fontSize: '10px', color: '#60a5fa',
                      background: 'rgba(59,130,246,0.1)',
                      padding: '1px 6px', borderRadius: '99px',
                    }}>
                      click to advance
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin note input */}
      {showNote && isAdmin && (
        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '12px', padding: '16px', marginBottom: '20px',
        }}>
          <p style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 500, margin: '0 0 10px' }}>
            Advancing to: {STEPS.find(s => s.status === nextStatus)?.label}
          </p>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note (optional) — e.g. Assigned to road repair team"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '9px 12px',
              color: '#f8fafc', fontSize: '13px', outline: 'none',
              fontFamily: 'inherit', marginBottom: '10px',
            }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={confirmAdvance}
              disabled={updating}
              style={{
                background: '#3b82f6', border: 'none', borderRadius: '8px',
                padding: '8px 16px', color: 'white', fontSize: '13px',
                fontWeight: 600, cursor: updating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'inherit',
              }}
            >
              {updating && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
              Confirm
            </button>
            <button
              onClick={() => { setShowNote(false); setNote(''); setNextStatus(''); }}
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.5)',
                fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Timeline event log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
          Activity log
        </p>
        {events.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>No events yet.</p>
        )}
        {events.map((event, i) => {
          const step = STEPS.find(s => s.status === event.status);
          return (
            <div key={event.id} style={{ display: 'flex', gap: '12px', paddingBottom: i < events.length - 1 ? '16px' : '0' }}>
              {/* Dot + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', marginTop: '4px',
                  background: step?.color ?? '#94a3b8', flexShrink: 0,
                }} />
                {i < events.length - 1 && (
                  <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.07)', marginTop: '4px' }} />
                )}
              </div>
              {/* Content */}
              <div style={{ flex: 1, paddingBottom: i < events.length - 1 ? '4px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '1px 7px',
                    borderRadius: '99px', background: step?.bg ?? 'rgba(255,255,255,0.1)',
                    color: step?.color ?? '#94a3b8',
                  }}>
                    {step?.label ?? event.status}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                    {new Date(event.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {event.note && (
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}