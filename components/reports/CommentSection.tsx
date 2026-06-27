'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  users?: { name: string };
}

interface Props {
  reportId: string;
  comments: Comment[];
  userId?: string;
}

export function CommentSection({ reportId, comments, userId }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (!text.trim()) return;
    if (!userId) { toast.error('Sign in to comment'); return; }
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from('comments').insert({
      report_id: reportId,
      user_id: userId,
      content: text.trim(),
    });

    if (error) {
      toast.error('Failed to post comment');
    } else {
      setText('');
      toast.success('Comment posted!');
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '20px',
    }}>
      <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: '0 0 16px' }}>
        Comments ({comments.length})
      </h2>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: '13px',
              }}>
                {c.users?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 500 }}>
                    {c.users?.name ?? 'Anonymous'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', marginBottom: '16px' }}>
          No comments yet. Be the first to comment.
        </p>
      )}

      {/* Divider */}
      {userId && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder="Write a comment…"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', padding: '10px 14px',
                color: '#f8fafc', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={submit}
              disabled={submitting || !text.trim()}
              style={{
                background: text.trim() ? '#3b82f6' : 'rgba(59,130,246,0.3)',
                border: 'none', borderRadius: '10px', padding: '10px 14px',
                color: 'white', cursor: text.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {!userId && (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
          <a href="/login" style={{ color: '#60a5fa' }}>Sign in</a> to leave a comment
        </p>
      )}
    </div>
  );
}