'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Loader2, X, Check } from 'lucide-react';

interface Props {
  reportId: string;
  userId: string;
  reportUserId: string;
  initialTitle: string;
  initialDescription: string;
}

export function ReportActions({ reportId, userId, reportUserId, initialTitle, initialDescription }: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const router = useRouter();

  if (userId !== reportUserId) return null;

 const handleDelete = async () => {
  if (!confirm('Delete this report? This cannot be undone.')) return;
  setDeleting(true);
  const supabase = createClient();
  const { error } = await supabase.from('reports').delete().eq('id', reportId);
  console.log('Delete error:', error);
  if (error) {
    toast.error(`Failed to delete: ${error.message}`);
    setDeleting(false);
  }  else {
  toast.success('Report deleted');
  await new Promise(resolve => setTimeout(resolve, 500));
  window.location.href = '/community';
}
};

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title cannot be empty'); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('reports')
      .update({ title: title.trim(), description: description.trim(), updated_at: new Date().toISOString() })
      .eq('id', reportId);
    if (error) {
      toast.error('Failed to update report');
    } else {
      toast.success('Report updated!');
      setEditing(false);
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {!editing ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setEditing(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '8px', padding: '7px 14px', color: '#60a5fa',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '7px 14px', color: '#f87171',
              fontSize: '13px', fontWeight: 500, cursor: deleting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {deleting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
            Delete
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: '12px', padding: '16px',
        }}>
          <p style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Edit report
          </p>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '9px 12px', color: '#f8fafc',
              fontSize: '14px', fontWeight: 600, outline: 'none', fontFamily: 'inherit',
              marginBottom: '10px',
            }}
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Description"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '9px 12px', color: '#f8fafc',
              fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              marginBottom: '10px', lineHeight: 1.6,
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#3b82f6', border: 'none', borderRadius: '8px',
                padding: '8px 16px', color: 'white', fontSize: '13px',
                fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}
            >
              {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
              Save changes
            </button>
            <button
              onClick={() => { setEditing(false); setTitle(initialTitle); setDescription(initialDescription); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.5)',
                fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}