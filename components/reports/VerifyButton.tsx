'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Props {
  reportId: string;
  initialCount: number;
  initialVerified: boolean;
  userId?: string;
}

export function VerifyButton({ reportId, initialCount, initialVerified, userId }: Props) {
  const [verified, setVerified] = useState(initialVerified);
  const [count, setCount]       = useState(initialCount);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const toggle = async () => {
    if (!userId) { toast.error('Sign in to verify'); return; }
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    if (verified) {
      await supabase.from('verifications').delete()
        .eq('report_id', reportId).eq('user_id', userId);
      setCount(c => c - 1);
      setVerified(false);
    } else {
      const { error } = await supabase.from('verifications')
        .insert({ report_id: reportId, user_id: userId });
      if (error) { toast.error('Already verified'); setLoading(false); return; }
      setCount(c => c + 1);
      setVerified(true);
      toast.success('Verified! +2 points earned');
    }
    setLoading(false);
    router.refresh();
  };

  const label = count === 0 ? 'No verifications yet'
    : count === 1 ? '1 citizen verified this'
    : `${count} citizens verified this`;

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '12px',
          border: `1px solid ${verified ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.12)'}`,
          background: verified ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
          color: verified ? '#34d399' : 'rgba(255,255,255,0.5)',
          fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', fontFamily: 'inherit',
        }}
      >
        <ShieldCheck size={16} />
        {verified ? 'Verified by you' : 'Verify this issue'}
      </button>

      {count > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          marginLeft: '12px', fontSize: '13px', color: '#34d399',
        }}>
          <ShieldCheck size={14} />
          {label}
          {count >= 5 && (
            <span style={{
              fontSize: '11px', background: 'rgba(52,211,153,0.15)',
              border: '1px solid rgba(52,211,153,0.3)',
              color: '#34d399', padding: '1px 7px', borderRadius: '99px', fontWeight: 600,
            }}>
              COMMUNITY VERIFIED
            </span>
          )}
        </div>
      )}
    </div>
  );
}