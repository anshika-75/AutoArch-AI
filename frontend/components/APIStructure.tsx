'use client';
import { AnalysisResult } from '@/lib/api';
import CopyButton from './CopyButton';
import { Globe, ArrowRight } from 'lucide-react';

interface APIStructureProps { data: AnalysisResult['apiStructure'] }

const METHOD_STYLE: Record<string, { bg: string; color: string }> = {
  GET:    { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  POST:   { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  PUT:    { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  PATCH:  { bg: 'rgba(6,182,212,0.15)',  color: '#22d3ee' },
  DELETE: { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
};

export default function APIStructure({ data }: APIStructureProps) {
  if (!data?.endpoints?.length) return null;

  const curlExamples = data.endpoints.map(ep => {
    const base = data.baseUrl || 'https://api.example.com';
    return `curl -X ${ep.method} ${base}${ep.path}${ep.requestBody ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${ep.requestBody}'` : ''}`;
  }).join('\n\n');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={15} style={{ color: 'var(--accent-primary)' }} />
          <code style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {data.baseUrl || 'https://api.example.com'}
          </code>
        </div>
        <CopyButton text={curlExamples} label="Copy cURL" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.endpoints.map((ep, i) => {
          const style = METHOD_STYLE[ep.method] || { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' };
          return (
            <div key={i} className="section-card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <span style={{
                  background: style.bg, color: style.color,
                  padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace', flexShrink: 0, letterSpacing: '0.5px',
                }}>{ep.method}</span>
                <code style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                  {ep.path}
                </code>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-secondary)' }}>{ep.description}</span>
              </div>
              {(ep.requestBody || ep.responseBody) && (
                <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                  {ep.requestBody && (
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Request</div>
                      <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ep.requestBody}</code>
                    </div>
                  )}
                  {ep.responseBody && (
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>Response</div>
                      <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ep.responseBody}</code>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
