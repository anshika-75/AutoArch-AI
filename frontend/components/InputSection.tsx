'use client';
import { useRef, useState } from 'react';
import { Upload, Mic, MicOff, X, FileText, Loader2, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const EXAMPLE_PROMPTS = [
  "A real-time collaborative document editing platform like Google Docs with offline support and version history",
  "An e-commerce marketplace with multi-vendor support, payment gateway, and AI-powered product recommendations",
  "A video streaming platform like Netflix with adaptive bitrate, CDN, and recommendation engine",
  "A ride-sharing app like Uber with real-time GPS tracking, surge pricing, and driver matching algorithm",
  "A fintech platform for international money transfers with compliance, FX rates, and fraud detection",
];

interface InputSectionProps {
  onSubmit: (description: string, file?: File) => void;
  loading: boolean;
}

export default function InputSection({ onSubmit, loading }: InputSectionProps) {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|txt|md)$/i)) {
      toast.error('Only PDF, TXT, or MD files allowed');
      return;
    }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }
    setFile(f);
    toast.success(`File attached: ${f.name}`);
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        toast.success('Voice recorded! (Transcription requires Whisper API setup)');
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const handleSubmit = () => {
    if (!description.trim() && !file) {
      toast.error('Please enter a project description or upload a file');
      return;
    }
    onSubmit(description, file || undefined);
  };

  return (
    <section id="generate" style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="badge badge-indigo" style={{ marginBottom: 16 }}>
          <Sparkles size={10} /> Powered by Llama 3.3
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>
          Describe your project,<br />
          <span className="gradient-text">get the architecture.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto' }}>
          Input your project idea and ArchGen AI instantly generates HLD, diagrams, tech stacks, and implementation roadmaps.
        </p>
      </div>

      {/* Main input card */}
      <div className="section-card" style={{ marginBottom: 16 }}>
        {/* Textarea */}
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your project idea in detail...&#10;&#10;E.g. 'A real-time food delivery app with live tracking, multi-restaurant support, and AI-powered ETAs'"
          disabled={loading}
          style={{
            width: '100%', minHeight: 180, resize: 'vertical',
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.7,
            fontFamily: 'inherit',
          }}
        />

        {/* File drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border)'}`,
            borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
            background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--text-muted)', fontSize: 13, marginTop: 12,
            transition: 'all 0.2s',
          }}
        >
          <Upload size={16} />
          {file ? (
            <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>📎 {file.name}</span>
          ) : (
            <span>Drop a PDF or TXT file, or click to upload</span>
          )}
          {file && (
            <button
              onClick={e => { e.stopPropagation(); setFile(null); }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleRecording} className="btn-ghost" style={{ gap: 6 }} title="Record voice">
              {recording ? <><MicOff size={14} /><span style={{ color: '#f87171' }}>Stop</span></> : <><Mic size={14} />Voice</>}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description.length} chars</span>
            <button
              id="generate-btn"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ minWidth: 200 }}
            >
              {loading ? (
                <><Loader2 size={16} className="spin" /> Generating Architecture...</>
              ) : (
                <><Zap size={16} /> Generate Architecture</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Example prompts */}
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Try an example →
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EXAMPLE_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => setDescription(p)}
              disabled={loading}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer',
                color: 'var(--text-secondary)', transition: 'all 0.2s', textAlign: 'left',
                maxWidth: 260,
              }}
              title={p}
            >
              <FileText size={11} style={{ display: 'inline', marginRight: 5 }} />
              {p.slice(0, 45)}...
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
