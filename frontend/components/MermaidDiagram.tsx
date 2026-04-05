'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MermaidDiagramProps {
  code: string;
  onRegenerate?: () => void;
  loading?: boolean;
}

function clientSanitize(code: string): string {
  let lines = code.split('\n');
  lines = lines.filter(l => !l.trim().startsWith('```'));

  const graphIdx = lines.findIndex(l => l.trim().startsWith('graph '));
  if (graphIdx > 0) lines = lines.slice(graphIdx);
  if (graphIdx < 0) lines.unshift('graph TD');

  lines = lines.map(line => {
    let l = line;
    l = l.replace(/;\s*$/, '');
    if (!/^\s*(subgraph|end|graph|style|classDef|class |click )/.test(l)) {
      l = l.replace(/^(\s*\w+)\(([^)]+)\)\s*$/, '$1[$2]');
      l = l.replace(/^(\s*\w+)\(\[([^\]]+)\]\)\s*$/, '$1[$2]');
      l = l.replace(/^(\s*\w+)\[\[([^\]]+)\]\]\s*$/, '$1[$2]');
      l = l.replace(/^(\s*\w+)\{([^}]+)\}\s*$/, '$1[$2]');
    }
    l = l.replace(/<[^>]+>/g, '');
    l = l.replace(/&/g, 'and');
    l = l.replace(/\["([^"]+)"\]/g, '[$1]');
    return l;
  });

  lines = lines.filter(l => l.trim().length > 0);
  return lines.join('\n');
}

export default function MermaidDiagram({ code, onRegenerate, loading }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState('');
  const [svgHtml, setSvgHtml] = useState('');
  const [sanitizedCode, setSanitizedCode] = useState('');

  const renderDiagram = useCallback(async (mermaidCode: string) => {
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#6366f1',
          primaryTextColor: '#f0f0ff',
          primaryBorderColor: '#8b5cf6',
          lineColor: '#6366f1',
          secondaryColor: '#12121f',
          tertiaryColor: '#1a1a2e',
          background: '#0a0a0f',
          mainBkg: '#1a1a2e',
          nodeBorder: '#6366f1',
          clusterBkg: '#12121f',
          clusterBorder: '#6366f166',
          titleColor: '#f0f0ff',
          edgeLabelBackground: '#1a1a2e',
          fontSize: '14px',
        },
        flowchart: { htmlLabels: true, curve: 'basis', padding: 15 },
        securityLevel: 'loose',
      });

      const id = `mermaid-${Date.now()}`;

      // Render into a detached div to avoid React DOM conflicts
      const tempDiv = document.createElement('div');
      tempDiv.id = id;
      document.body.appendChild(tempDiv);

      try {
        const { svg } = await mermaid.render(id, mermaidCode);
        setSvgHtml(svg);
        setRendered(true);
        setError('');
      } finally {
        // Clean up temp element
        try { document.body.removeChild(tempDiv); } catch {}
        // Also clean up any leftover mermaid temp elements
        const leftover = document.getElementById(id);
        if (leftover) try { leftover.remove(); } catch {}
      }
    } catch (e: any) {
      console.warn('Mermaid render error:', e.message);
      setError(e.message || 'Failed to render diagram');
      setRendered(false);
      setSvgHtml('');
    }
  }, []);

  useEffect(() => {
    if (!code) return;
    const cleanCode = clientSanitize(code);
    setSanitizedCode(cleanCode);
    setRendered(false);
    setError('');
    setSvgHtml('');
    renderDiagram(cleanCode);
  }, [code, renderDiagram]);

  const downloadSVG = () => {
    if (!svgHtml) { toast.error('No diagram to download'); return; }
    const blob = new Blob([svgHtml], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'architecture-diagram.svg'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Diagram downloaded!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Generating architecture diagram...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
        {onRegenerate && (
          <button onClick={onRegenerate} className="btn-ghost">
            <RefreshCw size={14} /> Regenerate
          </button>
        )}
        <button onClick={downloadSVG} className="btn-ghost" disabled={!rendered}>
          <Download size={14} /> Export SVG
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 10, padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertCircle size={16} style={{ color: '#fbbf24' }} />
            <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>
              Diagram rendering issue — click Regenerate for a cleaner version
            </p>
          </div>
          {onRegenerate && (
            <button onClick={onRegenerate} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
              <RefreshCw size={14} /> Regenerate Diagram
            </button>
          )}
        </div>
      )}

      {svgHtml ? (
        <div
          ref={containerRef}
          className="mermaid-container"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12, padding: 24, border: '1px solid var(--border)',
            minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'auto',
          }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : (
        <div
          ref={containerRef}
          className="mermaid-container"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12, padding: 24, border: '1px solid var(--border)',
            minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'auto',
          }}
        >
          {!error && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Rendering diagram...</p>}
        </div>
      )}

      <details style={{ marginTop: 12 }}>
        <summary style={{ color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', userSelect: 'none' }}>
          View Mermaid source code
        </summary>
        <pre className="code-block" style={{ marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}>{sanitizedCode || code}</pre>
      </details>
    </div>
  );
}
