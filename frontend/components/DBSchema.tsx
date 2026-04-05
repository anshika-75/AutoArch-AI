'use client';
import { AnalysisResult } from '@/lib/api';
import CopyButton from './CopyButton';
import { Database, GitMerge } from 'lucide-react';

interface DBSchemaProps { data: AnalysisResult['databaseSchema'] }

const TYPE_COLOR: Record<string, string> = {
  'INT': '#fbbf24', 'INTEGER': '#fbbf24', 'BIGINT': '#fbbf24',
  'VARCHAR': '#34d399', 'TEXT': '#34d399', 'STRING': '#34d399',
  'BOOLEAN': '#f472b6', 'BOOL': '#f472b6',
  'TIMESTAMP': '#22d3ee', 'DATETIME': '#22d3ee', 'DATE': '#22d3ee',
  'UUID': '#a78bfa', 'JSON': '#a78bfa', 'JSONB': '#a78bfa',
  'FLOAT': '#fb923c', 'DECIMAL': '#fb923c', 'NUMERIC': '#fb923c',
};

function getTypeColor(type: string) {
  return TYPE_COLOR[type.toUpperCase().split('(')[0]] || '#818cf8';
}

export default function DBSchema({ data }: DBSchemaProps) {
  if (!data?.applicable || !data.tables?.length) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
        <Database size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
        <p>No database schema applicable for this project type.</p>
      </div>
    );
  }

  const schemaText = data.tables.map(t => {
    const cols = t.fields.map(f => `  ${f.name} ${f.type}${f.constraints ? ' -- ' + f.constraints : ''}`).join('\n');
    return `TABLE ${t.name}\n${cols}`;
  }).join('\n\n');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <CopyButton text={schemaText} label="Copy Schema" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
        {data.tables.map((table, i) => (
          <div key={i} className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Database size={14} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'JetBrains Mono, monospace' }}>{table.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{table.description}</span>
            </div>

            {/* Fields */}
            <div style={{ padding: 4 }}>
              {table.fields.map((field, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', borderBottom: j < table.fields.length - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                    color: 'var(--text-primary)', fontWeight: 500, minWidth: 100,
                  }}>{field.name}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                    color: getTypeColor(field.type), fontWeight: 600,
                  }}>{field.type}</span>
                  {field.constraints && (
                    <span style={{
                      fontSize: 10, color: 'var(--text-muted)',
                      marginLeft: 'auto', fontStyle: 'italic',
                    }}>{field.constraints}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Relationships */}
      {data.relationships?.length > 0 && (
        <div className="section-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <GitMerge size={16} style={{ color: 'var(--accent-tertiary)' }} />
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Relationships</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.relationships.map((rel, i) => (
              <li key={i} style={{
                padding: '8px 12px', background: 'var(--bg-elevated)',
                borderRadius: 8, border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ color: 'var(--accent-tertiary)', fontSize: 16 }}>↔</span> {rel}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
