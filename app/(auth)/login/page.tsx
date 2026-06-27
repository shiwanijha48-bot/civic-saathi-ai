'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // Handle email not confirmed specifically
      if (error.message.toLowerCase().includes('email not confirmed')) {
        toast('📧 Please confirm your email first. Check your inbox.', {
          duration: 6000,
          style: {
            background: '#1e3a5f',
            color: '#93c5fd',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        });
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    // Ensure user profile exists (in case trigger didn't fire)
    if (authData.user) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('users').upsert({
          id: authData.user.id,
          name: authData.user.user_metadata?.name ?? authData.user.email?.split('@')[0] ?? 'User',
          email: authData.user.email!,
          points: 0,
          badge_level: 'newcomer',
          reports_count: 0,
        }, { onConflict: 'id' });
      }
    }

    toast.success('Welcome back! 👋');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020817 0%, #0f172a 50%, #020817 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={22} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>Civic Saathi AI</span>
          </Link>
          <h1 style={{ color: '#f8fafc', fontSize: '22px', fontWeight: 700, margin: 0 }}>Welcome back</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '6px', fontSize: '14px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '32px',
        }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {errors.email && <p style={errStyle}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', display: 'flex', padding: '4px',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={errStyle}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(59,130,246,0.4)' : '#3b82f6',
                border: 'none', borderRadius: '12px', color: 'white',
                fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s',
              }}
            >
              {loading && <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '20px', margin: '20px 0 0' }}>
            No account?{' '}
            <Link href="/signup" style={{ color: '#60a5fa', fontWeight: 500 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.6)',
  fontSize: '13px', fontWeight: 500, marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', padding: '11px 14px',
  color: '#f8fafc', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.2s', fontFamily: 'inherit',
};

const errStyle: React.CSSProperties = {
  color: '#f87171', fontSize: '12px', marginTop: '4px', marginBottom: 0,
};