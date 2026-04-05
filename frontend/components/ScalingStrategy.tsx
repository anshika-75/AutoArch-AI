'use client';
import { AnalysisResult } from '@/lib/api';
import { TrendingUp, ArrowUp, ArrowDown, Zap, Shield } from 'lucide-react';

interface ScalingProps { data: AnalysisResult['scalingStrategy'] }

const SECTIONS = [
  { key: 'horizontal', label: 'Horizontal Scaling', icon: <ArrowUp size={14} />, color: '#6366f1' },
  { key: 'vertical',   label: 'Vertical Scaling',   icon: <ArrowDown size={14} />, color: '#8b5cf6' },
  { key: 'caching',    label: 'Caching Strategy',   icon: <Zap size={14} />,       color: '#06b6d4' },
  { key: 'optimization', label: 'Optimizations',    icon: <Shield size={14} />,    color: '#10b981' },
] as const;

export default function ScalingStrategy({ data }: ScalingProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      {SECTIONS.map(({ key, label, icon, color }) => {
        const items = data?.[key] as string[] || [];
        return (
          <div key={key} className="section-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
              }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 14 }}>{label}</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, i) => (
                <li key={i} style={{
                  fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                  padding: '8px 10px', background: 'var(--bg-elevated)',
                  borderRadius: 8, borderLeft: `3px solid ${color}88`,
                  display: 'flex', gap: 8,
                }}>
                  <span style={{ color, marginTop: 2, flexShrink: 0 }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
