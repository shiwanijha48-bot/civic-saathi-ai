'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Props {
  reportId: string;
  currentStatus: string;
}

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export function AdminStatusUpdate({ reportId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const update = async (newStatus: string) => {
    if (newStatus === status) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to update status');
      setSaving(false);
    } else {
      setStatus(newStatus);
      toast.success('Status updated');
      setSaving(false);
      // Force full page reload so all KPI numbers update
      window.location.reload();
    }
  };

  return (
    <select
      value={status}
      onChange={e => update(e.target.value)}
      disabled={saving}
      style={{
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '7px', padding: '5px 8px',
        color: '#f8fafc', fontSize: '12px',
        cursor: saving ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', outline: 'none',
      }}
    >
      {STATUSES.map(s => (
        <option key={s} value={s} style={{ background: '#1e293b' }}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}