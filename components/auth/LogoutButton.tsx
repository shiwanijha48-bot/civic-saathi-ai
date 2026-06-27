'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '10px',
        fontSize: '14px', fontWeight: 500, cursor: 'pointer',
      }}
    >
      Sign out
    </button>
  );
}