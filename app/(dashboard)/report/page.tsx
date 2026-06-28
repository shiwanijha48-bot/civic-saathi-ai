'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Upload, Zap, AlertTriangle, Loader2, X, CheckCircle, Play, Camera, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { LocationPicker, type LocationData } from '@/components/reports/LocationPicker';
import type { AIAnalysis } from '@/types';

const schema = z.object({
  description: z.string().min(20, 'Describe the issue in at least 20 characters'),
  is_anonymous: z.boolean().default(false),
});

type FormData = z.input<typeof schema>;

export default function ReportPage() {
  // Image (mandatory)
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Video (optional)
  const [videoFile, setVideoFile]       = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [aiAnalysis, setAiAnalysis]     = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [duplicates, setDuplicates]     = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_anonymous: false },
  });

  const description = watch('description') ?? '';

  /* ── Image pick ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiAnalysis(null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAiAnalysis(null);
    if (imageRef.current) imageRef.current.value = '';
  };

  /* ── Video pick ── */
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please upload a video file'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('Video must be under 50 MB'); return; }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (videoRef.current) videoRef.current.value = '';
  };

  /* ── Duplicate check ── */
  const checkDuplicates = async (lat: number, lng: number, category: string) => {
    try {
      const res  = await fetch('/api/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, latitude: lat, longitude: lng, category }),
      });
      const data = await res.json();
      if (data.duplicate && data.matches?.length > 0) {
        setDuplicates(data.matches);
        setShowDuplicates(true);
      }
    } catch {}
  };

  /* ── AI ── */
  const runAI = async () => {
    if (!imageFile) { toast.error('Upload an image first — it helps AI classify better'); return; }
    if (description.trim().length < 20) { toast.error('Write at least 20 characters first'); return; }

    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('description', description);
      fd.append('image', imageFile); // always send image to AI
      const res  = await fetch('/api/ai/classify', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'AI failed');
      setAiAnalysis(data as AIAnalysis);
      toast.success('AI analysis complete!');
      if (locationData?.lat && locationData?.lng) {
        checkDuplicates(locationData.lat, locationData.lng, (data as AIAnalysis).category);
      }
    } catch (err: any) {
      toast.error(err.message ?? 'AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── Location change ── */
  const handleLocationChange = (loc: LocationData) => {
    setLocationData(loc);
    if (aiAnalysis && loc?.lat && loc?.lng) {
      checkDuplicates(loc.lat, loc.lng, aiAnalysis.category);
    }
  };

  /* ── Submit ── */
  const onSubmit = async (data: FormData) => {
    if (!imageFile)   { toast.error('Please upload an image of the issue'); return; }
    if (!aiAnalysis)  { toast.error('Run AI analysis first'); return; }
    if (!locationData?.lat && !locationData?.city) {
      toast.error('Please select your location');
      return;
    }
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      /* Upload image (mandatory) */
      const imgExt  = imageFile.name.split('.').pop() ?? 'jpg';
      const imgPath = `${uuidv4()}.${imgExt}`;
      const { error: imgErr } = await supabase.storage
        .from('report-images')
        .upload(imgPath, imageFile, { contentType: imageFile.type });
      if (imgErr) throw new Error(`Image upload failed: ${imgErr.message}`);
      const imageUrl = supabase.storage.from('report-images').getPublicUrl(imgPath).data.publicUrl;

      /* Upload video (optional) */
      let videoUrl: string | undefined;
      if (videoFile) {
        const vidExt  = videoFile.name.split('.').pop() ?? 'mp4';
        const vidPath = `${uuidv4()}.${vidExt}`;
        const { error: vidErr } = await supabase.storage
          .from('report-images') // same bucket
          .upload(vidPath, videoFile, { contentType: videoFile.type });
        if (vidErr) throw new Error(`Video upload failed: ${vidErr.message}`);
        videoUrl = supabase.storage.from('report-images').getPublicUrl(vidPath).data.publicUrl;
      }

      /* Resolve department */
      const { data: dept } = await supabase
        .from('departments')
        .select('id')
        .ilike('name', aiAnalysis.department)
        .maybeSingle();

      /* Insert report */
      const { data: report, error } = await supabase
        .from('reports')
        .insert({
          user_id:       data.is_anonymous ? null : user.id,
          title:         aiAnalysis.title,
          description:   data.description,
          ai_summary:    aiAnalysis.summary,
          category:      aiAnalysis.category,
          severity:      aiAnalysis.severity,
          department_id: dept?.id ?? null,
          image_url:     imageUrl,
          video_url:     videoUrl ?? null,
          latitude:      locationData?.lat ?? null,
          longitude:     locationData?.lng ?? null,
          address:       locationData?.fullAddress ?? null,
          is_anonymous:  data.is_anonymous,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Report submitted! +10 points 🎉');
      router.push(`/reports/${report.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !submitting && !!imageFile && !!aiAnalysis && !!(locationData?.lat || locationData?.city);

  return (
    <div style={{ padding: '32px', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Report a civic issue
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontSize: '14px' }}>
          AI will classify and route your report automatically.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── 1. Image (mandatory) ── */}
        <Section title="Photo *" subtitle="Required — helps AI classify the issue accurately">
          <input
            ref={imageRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />

          {imagePreview ? (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                onClick={clearImage}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
              <div style={{
                position: 'absolute', bottom: '10px', left: '10px',
                background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
                padding: '3px 8px', fontSize: '11px', color: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <Camera size={11} />
                {imageFile?.name}
              </div>
              {/* Success indicator */}
              <div style={{
                position: 'absolute', top: '10px', left: '10px',
                background: 'rgba(34,197,94,0.9)', borderRadius: '6px',
                padding: '3px 8px', fontSize: '11px', color: 'white', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <CheckCircle size={11} /> Image added
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              style={{
                width: '100%', border: '2px dashed rgba(59,130,246,0.3)',
                borderRadius: '12px', padding: '44px 20px', background: 'rgba(59,130,246,0.04)',
                cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)';
                e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                e.currentTarget.style.color = '#60a5fa';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                e.currentTarget.style.background = 'rgba(59,130,246,0.04)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
              }}
            >
              <Camera size={32} style={{ color: '#3b82f6' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', color: '#60a5fa' }}>
                  Upload photo of the issue
                </p>
                <p style={{ fontSize: '12px', margin: 0, color: 'rgba(255,255,255,0.35)' }}>
                  JPG, PNG, WebP — max 10 MB
                </p>
              </div>
            </button>
          )}
        </Section>

        {/* ── 2. Video (optional) ── */}
        <Section title="Video (optional)" subtitle="Add video evidence for stronger reports">
          <input
            ref={videoRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
            style={{ display: 'none' }}
            onChange={handleVideoChange}
          />

          {videoPreview ? (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              <video
                src={videoPreview}
                controls
                playsInline
                style={{ width: '100%', maxHeight: '220px', display: 'block' }}
              />
              <button
                type="button"
                onClick={clearVideo}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
              <div style={{
                position: 'absolute', bottom: '10px', left: '10px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{
                  background: 'rgba(59,130,246,0.9)', borderRadius: '5px',
                  padding: '2px 7px', fontSize: '10px', color: 'white', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                }}>
                  <Play size={9} /> VIDEO
                </span>
                <span style={{
                  background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
                  padding: '3px 8px', fontSize: '11px', color: 'rgba(255,255,255,0.8)',
                  maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {videoFile?.name}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              style={{
                width: '100%', border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '32px 20px', background: 'transparent',
                cursor: 'pointer', color: 'rgba(255,255,255,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                e.currentTarget.style.background = 'rgba(168,85,247,0.05)';
                e.currentTarget.style.color = '#c084fc';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
              }}
            >
              <Video size={28} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 3px' }}>
                  Add a video (optional)
                </p>
                <p style={{ fontSize: '12px', margin: 0, color: 'rgba(255,255,255,0.25)' }}>
                  MP4, MOV, WebM — max 50 MB
                </p>
              </div>
            </button>
          )}

          {videoFile && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '6px' }}>
            </p>
          )}
        </Section>

        {/* ── 3. Description + AI ── */}
        <Section title="Describe the issue *">
          <textarea
            {...register('description')}
            rows={5}
            placeholder="E.g. Large pothole on MG Road near bus stop. It's been there 3 weeks and caused two accidents…"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
              padding: '12px 14px', color: '#f8fafc', fontSize: '14px',
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit', lineHeight: 1.7, transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
          {errors.description && (
            <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>
              {errors.description.message}
            </p>
          )}
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginTop: '4px', textAlign: 'right' }}>
            {description.trim().length} / 20 min characters
          </p>

          <button
            type="button"
            onClick={runAI}
            disabled={analyzing || !imageFile || description.trim().length < 20}
            style={{
              marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '9px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
              border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.12)',
              color: (analyzing || !imageFile || description.trim().length < 20) ? 'rgba(168,85,247,0.35)' : '#c084fc',
              cursor: (analyzing || !imageFile || description.trim().length < 20) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {analyzing
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analysing…</>
              : <><Zap size={15} /> Analyse with AI</>
            }
          </button>
          {!imageFile && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '6px' }}>
              Upload a photo first to enable AI analysis
            </p>
          )}
        </Section>

        {/* ── 4. AI Results ── */}
        {aiAnalysis && (
          <div style={{
            background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '16px', padding: '20px', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle size={17} style={{ color: '#a855f7' }} />
              <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px' }}>AI Analysis</span>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#a855f7' }}>
                {Math.round((aiAnalysis.confidence ?? 0.9) * 100)}% confidence
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <AIField label="Title"     value={aiAnalysis.title} />
              <AIField label="Category"  value={aiAnalysis.category} />
              <div>
                <p style={metaLabel}>Severity</p>
                <span style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: '99px',
                  fontSize: '12px', fontWeight: 600, ...severityStyle(aiAnalysis.severity),
                }}>
                  {aiAnalysis.severity?.toUpperCase()}
                </span>
              </div>
              <AIField label="Routed to" value={aiAnalysis.department} />
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={metaLabel}>AI Summary</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.65, margin: 0 }}>
                  {aiAnalysis.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. Location ── */}
        <Section title="Location *">
          <LocationPicker onChange={handleLocationChange} />
        </Section>

        {/* ── 6. Duplicate warning ── */}
        {showDuplicates && duplicates.length > 0 && (
          <div style={{
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)',
            borderRadius: '16px', padding: '20px', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <p style={{ color: '#facc15', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                  Similar reports found nearby
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicates(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '20px' }}
              >×</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 12px' }}>
              These reports were filed within 500m. Consider upvoting instead.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {duplicates.map(d => (
                <a key={d.id} href={`/reports/${d.id}`} target="_blank" rel="noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '10px', textDecoration: 'none',
                  background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)',
                }}>
                  <div>
                    <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 500, margin: '0 0 2px' }}>{d.title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                      {d.similarity}% similar · {new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {d.status}
                    </p>
                  </div>
                  <span style={{ color: '#facc15', fontSize: '12px' }}>View →</span>
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/community" style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: 'rgba(234,179,8,0.15)', color: '#facc15', textDecoration: 'none',
              }}>
                View existing reports
              </a>
              <button type="button" onClick={() => setShowDuplicates(false)} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Submit anyway
              </button>
            </div>
          </div>
        )}

        {/* ── 7. Options ── */}
        <Section title="Options">
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              {...register('is_anonymous')}
              style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#3b82f6', cursor: 'pointer', flexShrink: 0 }}
            />
            <div>
              <p style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500, margin: 0 }}>Submit anonymously</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '3px 0 0' }}>
                Your name won't appear on this report
              </p>
            </div>
          </label>
        </Section>

        {/* ── Warnings ── */}
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!imageFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '13px' }}>
              <AlertTriangle size={14} /> Photo is required to submit a report
            </div>
          )}
          {imageFile && !aiAnalysis && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '13px' }}>
              <AlertTriangle size={14} /> Run AI analysis before submitting
            </div>
          )}
          {aiAnalysis && !locationData?.lat && !locationData?.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '13px' }}>
              <AlertTriangle size={14} /> Select your location before submitting
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: '100%', padding: '14px',
            background: canSubmit ? '#3b82f6' : 'rgba(59,130,246,0.25)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '15px', fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = '#2563eb'; }}
          onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = '#3b82f6'; }}
        >
          {submitting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>

      </form>
    </div>
  );
}

/* ── Sub-components ── */
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '24px', marginBottom: '16px',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ color: '#f8fafc', fontWeight: 600, fontSize: '15px', margin: 0 }}>{title}</h2>
        {subtitle && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: '3px 0 0' }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function AIField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={metaLabel}>{label}</p>
      <p style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 500, margin: 0 }}>{value}</p>
    </div>
  );
}

const metaLabel: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)', fontSize: '11px',
  textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px',
};

function severityStyle(severity: string): React.CSSProperties {
  const map: Record<string, React.CSSProperties> = {
    low:      { background: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
    medium:   { background: 'rgba(234,179,8,0.15)',  color: '#facc15' },
    high:     { background: 'rgba(249,115,22,0.15)', color: '#fb923c' },
    critical: { background: 'rgba(239,68,68,0.15)',  color: '#f87171' },
  };
  return map[severity] ?? map.medium;
}