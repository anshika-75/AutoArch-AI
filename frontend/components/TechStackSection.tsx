'use client';
import { AnalysisResult } from '@/lib/api';
import { Server, Database, Globe, Cloud, GitBranch } from 'lucide-react';

interface TechStackProps { data: AnalysisResult['techStack'] }

const COLOR_MAP: Record<string, string> = {
  frontend: 'badge-cyan',
  backend: 'badge-purple',
  database: 'badge-orange',
  infrastructure: 'badge-green',
  devops: 'badge-pink',
};

const ICON_MAP: Record<string, React.ReactNode> = {
  frontend: <Globe size={14} />,
  backend: <Server size={14} />,
  database: <Database size={14} />,
  infrastructure: <Cloud size={14} />,
  devops: <GitBranch size={14} />,
};

export default function TechStackSection({ data }: TechStackProps) {
  const sections = [
    { key: 'frontend', label: 'Frontend', items: data.frontend },
    { key: 'backend', label: 'Backend', items: data.backend },
    { key: 'database', label: 'Database', items: data.database },
    { key: 'infrastructure', label: 'Infrastructure', items: data.infrastructure },
    { key: 'devops', label: 'DevOps', items: data.devops },
  ] as const;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      {sections.map(({ key, label, items }) => (
        items?.length > 0 && (
          <div key={key} className="section-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ color: 'var(--accent-primary)' }}>{ICON_MAP[key]}</div>
              <h3 style={{ fontWeight: 700, fontSize: 14 }}>{label}</h3>
              <span className={`badge ${COLOR_MAP[key]}`} style={{ marginLeft: 'auto', fontSize: 10 }}>
                {items.length} {items.length === 1 ? 'tech' : 'techs'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item: any, i: number) => (
                <div key={i} style={{
                  padding: '10px 12px', background: 'var(--bg-elevated)',
                  borderRadius: 8, border: '1px solid var(--border)',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {item.name}
                    {item.category && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
