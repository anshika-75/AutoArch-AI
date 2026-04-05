'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import InputSection from '@/components/InputSection';
import ResultsPanel from '@/components/ResultsPanel';
import HistoryPanel from '@/components/HistoryPanel';
import { analyzeProject, getHistory, AnalysisResult, HistoryEntry } from '@/lib/api';
import { useTheme } from '@/lib/hooks';
import toast from 'react-hot-toast';
import { Sparkles, ArrowDown } from 'lucide-react';

export default function HomePage() {
  const { theme, toggle } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resultId, setResultId] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const refreshHistory = async () => {
    try {
      const res = await getHistory();
      setHistory(res.data);
    } catch {}
  };

  useEffect(() => { refreshHistory(); }, []);

  const handleGenerate = async (description: string, file?: File) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeProject(description, file);
      setResult(res.data);
      setResultId(res.id);
      toast.success(`Architecture generated for "${res.data.projectName}"!`);
      refreshHistory();
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (e: any) {
      const msg = e.message || 'Failed to generate architecture';
      if (msg.includes('OPENAI_API_KEY')) {
        toast.error('⚠️ OpenAI API key not configured. Please add it to backend/.env', { duration: 6000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setResult(entry.result);
    setResultId(entry.id);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="bg-grid" style={{ minHeight: '100vh', position: 'relative' }}>
      <Navbar theme={theme} onThemeToggle={toggle} onHistoryClick={() => setShowHistory(true)} />

      <main>
        <InputSection onSubmit={handleGenerate} loading={loading} />

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              padding: '32px 48px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 20,
            }} className="pulse-glow">
              <Sparkles size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 3s linear infinite' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Analyzing your project...</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Llama 3.3 is designing your architecture. This takes 10-20 seconds.
                </p>
              </div>
              {/* Skeleton rows */}
              <div style={{ width: 400, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '80%' }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
                <div className="skeleton" style={{ height: 14, width: '70%' }} />
              </div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div id="results-section">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="badge badge-green" style={{ marginBottom: 8 }}>
                ✓ Architecture Generated
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ArrowDown size={12} /> Explore your architecture below
              </p>
            </div>
            <ResultsPanel id={resultId} data={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      {!result && !loading && (
        <footer style={{
          textAlign: 'center', padding: '40px 24px',
          borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12,
        }}>
          <p>ArchGen AI — Built to help developers design better systems faster.</p>
          <p style={{ marginTop: 4 }}>Powered by Groq + Llama 3.3 • React + Next.js • Node.js + Express</p>
        </footer>
      )}

      {showHistory && (
        <HistoryPanel
          entries={history}
          onClose={() => setShowHistory(false)}
          onSelect={handleSelectHistory}
          onRefresh={refreshHistory}
        />
      )}
    </div>
  );
}
