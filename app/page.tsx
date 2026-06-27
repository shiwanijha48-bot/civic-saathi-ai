import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { MapPin, Zap, Users, BarChart3, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)', backgroundColor: 'rgba(2,8,23,0.8)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>Civic Saathi AI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <Link href="/dashboard" style={{
                  color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500,
                }}>
                  Dashboard
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" style={{
                  color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 500,
                }}>
                  Log in
                </Link>
                <Link href="/signup" style={{
                  background: '#3b82f6', color: 'white', padding: '9px 20px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                }}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 24px 64px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '99px', padding: '6px 16px', fontSize: '13px', color: '#93c5fd', marginBottom: '32px',
        }}>
          <Zap size={14} /> Powered by Google Gemini AI
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 24px' }}>
          Report. Resolve.{' '}
          <span style={{ background: 'linear-gradient(135deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rise.
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          Your neighbourhood deserves better. Report civic issues with AI-powered classification,
          track resolution in real time, and earn points for making your city better.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {user ? (
            <>
              <Link href="/report" style={{
                background: '#3b82f6', color: 'white', padding: '14px 32px',
                borderRadius: '12px', fontWeight: 700, fontSize: '16px',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
                Report an issue <ArrowRight size={18} />
              </Link>
              <Link href="/map" style={{
                border: '1px solid rgba(255,255,255,0.15)', color: 'white',
                padding: '14px 32px', borderRadius: '12px', fontWeight: 600, fontSize: '16px',
              }}>
                View issue map
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup" style={{
                background: '#3b82f6', color: 'white', padding: '14px 32px',
                borderRadius: '12px', fontWeight: 700, fontSize: '16px',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
                Start reporting <ArrowRight size={18} />
              </Link>
              <Link href="/map" style={{
                border: '1px solid rgba(255,255,255,0.15)', color: 'white',
                padding: '14px 32px', borderRadius: '12px', fontWeight: 600, fontSize: '16px',
              }}>
                View issue map
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
          background: 'rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {[
            { value: '⚡ AI', label: 'Auto-classifies every issue' },
            { value: '🗺️ Live', label: 'Real-time map tracking' },
            { value: '🏆 +10pts', label: 'Earned per report filed' },
          ].map(s => (
            <div key={s.label} style={{ padding: '32px', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa', marginBottom: '6px' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 700, marginBottom: '48px' }}>
          Everything you need
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '⚡', title: 'AI Classification', desc: 'Upload a photo and Gemini AI instantly identifies the issue type, severity, and which department should handle it.' },
            { icon: '🗺️', title: 'Live Map View', desc: 'See all reported issues on an interactive Google Maps view. Filter by category, severity, or status.' },
            { icon: '👥', title: 'Community Power', desc: 'Upvote issues, leave comments, and build collective pressure on local authorities.' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'Track resolution rates, see which areas have the most issues, and monitor your impact.' },
            { icon: '🏛️', title: 'Department Routing', desc: 'Reports are automatically routed to the right government department based on AI analysis.' },
            { icon: '🏆', title: 'Points & Badges', desc: 'Earn Community Hero points for every report. Rise through ranks from Newcomer to Champion.' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '24px',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '16px', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(52,211,153,0.1))',
            border: '1px solid rgba(59,130,246,0.2)', borderRadius: '24px', padding: '64px 32px', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 12px' }}>Be the change your city needs</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', margin: '0 0 32px' }}>
              Join citizens already making their neighbourhoods better.
            </p>
            <Link href="/signup" style={{
              background: '#3b82f6', color: 'white', padding: '14px 36px',
              borderRadius: '12px', fontWeight: 700, fontSize: '16px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}>
              Create free account <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '32px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>
        © 2025 Civic Saathi AI — Built for Vibe2Ship Hackathon
      </footer>
    </div>
  );
}