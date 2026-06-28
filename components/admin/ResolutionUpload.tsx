'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  reportId: string;
  currentStatus: string;
  existingResolutionImage?: string;
  existingResolutionNote?: string;
}

export function ResolutionUpload({ reportId, currentStatus, existingResolutionImage, existingResolutionNote }: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(existingResolutionImage ?? null);
  const [note, setNote] = useState(existingResolutionNote ?? '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (currentStatus !== 'resolved' && currentStatus !== 'closed') return null;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    setSaving(true);
    const supabase = createClient();

    let imageUrl = existingResolutionImage;

    if (image) {
      const ext = image.name.split('.').pop() ?? 'jpg';
      const path = `resolution/${uuidv4()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('report-images')
        .upload(path, image, { contentType: image.type });
      if (upErr) { toast.error('Upload failed'); setSaving(false); return; }
      imageUrl = supabase.storage.from('report-images').getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase
      .from('reports')
      .update({
        resolution_image_url: imageUrl,
        resolution_note: note,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Resolution proof saved!');
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div style={{
      background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
      borderRadius: '16px', padding: '20px', marginTop: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CheckCircle size={16} style={{ color: '#4ade80' }} />
        <h3 style={{ color: '#4ade80', fontWeight: 600, fontSize: '14px', margin: 0 }}>
          Resolution Proof
        </h3>
        <span style={{
          fontSize: '10px', padding: '2px 7px', borderRadius: '99px',
          background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontWeight: 600,
        }}>ADMIN</span>
      </div>

      {/* Image upload */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />

      {preview ? (
        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
          <img src={preview} alt="Resolution" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
          {!existingResolutionImage && (
            <button
              onClick={() => { setImage(null); setPreview(null); }}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                width: '28px', height: '28px', cursor: 'pointer', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: '100%', border: '2px dashed rgba(34,197,94,0.3)',
            borderRadius: '10px', padding: '28px', background: 'transparent',
            cursor: 'pointer', color: 'rgba(34,197,94,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            marginBottom: '12px',
          }}
        >
          <Upload size={24} />
          <p style={{ fontSize: '13px', margin: 0, fontWeight: 500 }}>Upload proof of fix</p>
          <p style={{ fontSize: '11px', margin: 0 }}>JPG, PNG — max 10 MB</p>
        </button>
      )}

      {/* Note */}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Describe what was done to fix this issue..."
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '10px 12px', color: '#f8fafc',
          fontSize: '13px', outline: 'none', fontFamily: 'inherit',
          resize: 'vertical', lineHeight: 1.6, marginBottom: '12px',
        }}
      />

      {!existingResolutionImage && (
        <button
          onClick={save}
          disabled={saving || (!image && !note)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: saving || (!image && !note) ? 'rgba(34,197,94,0.2)' : '#22c55e',
            border: 'none', borderRadius: '8px', padding: '9px 18px',
            color: 'white', fontSize: '13px', fontWeight: 600,
            cursor: saving || (!image && !note) ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {saving && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          Save resolution proof
        </button>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}