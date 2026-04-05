'use client';
import CopyButton from './CopyButton';
import { CheckCircle, Clock, Package, AlertTriangle, Target } from 'lucide-react';

interface ImplementationPlanProps { data: any }

const PRIORITY_BADGE: Record<string, string> = {
  high: 'badge-red',
  medium: 'badge-orange',
  low: 'badge-green',
};

const PHASE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function ImplementationPlan({ data }: ImplementationPlanProps) {
  if (!data) return null;

  const planText = JSON.stringify(data, null, 2);

  return (
    <div>
      {/* Header stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div className="section-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{data.estimatedDuration}</div>
          </div>
        </div>
        <div className="section-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package size={16} style={{ color: 'var(--accent-secondary)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phases</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{data.phases?.length || 5} Phases</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
          <CopyButton text={planText} label="Copy Plan" />
        </div>
      </div>

      {/* Phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.phases?.map((phase: any, i: number) => (
          <div key={i} className="section-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${PHASE_COLORS[i % PHASE_COLORS.length]}22`,
                border: `2px solid ${PHASE_COLORS[i % PHASE_COLORS.length]}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, color: PHASE_COLORS[i % PHASE_COLORS.length],
              }}>
                {phase.phase}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15 }}>{phase.name}</h3>
                  <span className="badge badge-indigo" style={{ fontSize: 10 }}>
                    <Clock size={9} /> {phase.duration}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{phase.description}</p>
              </div>
            </div>

            {/* Tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 50 }}>
              {phase.tasks?.map((task: any, j: number) => (
                <div key={j} style={{
                  padding: '10px 14px', background: 'var(--bg-elevated)',
                  borderRadius: 8, border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <CheckCircle size={14} style={{ color: PHASE_COLORS[i % PHASE_COLORS.length], flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{task.id} — {task.title}</span>
                      <span className={`badge ${PRIORITY_BADGE[task.priority] || 'badge-indigo'}`} style={{ fontSize: 9 }}>
                        {task.priority}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{task.description}</p>
                    {task.tools?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                        {task.tools.map((tool: string, k: number) => (
                          <code key={k} style={{
                            fontSize: 11, padding: '2px 7px',
                            background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                            borderRadius: 5, fontFamily: 'JetBrains Mono, monospace',
                          }}>{tool}</code>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Deliverables & Milestone */}
            {(phase.deliverables?.length > 0 || phase.milestone) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 14, marginLeft: 50, flexWrap: 'wrap' }}>
                {phase.milestone && (
                  <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize: 11, color: '#34d399', fontWeight: 600, marginBottom: 2 }}>🏁 Milestone</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{phase.milestone}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Risks */}
      {data.risks?.length > 0 && (
        <div className="section-card" style={{ marginTop: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Risks & Mitigations</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.risks.map((r: any, i: number) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.risk}</span>
                  <span className={`badge ${r.severity === 'high' ? 'badge-red' : r.severity === 'medium' ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: 9 }}>
                    {r.severity}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>💡 {r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Metrics */}
      {data.successMetrics?.length > 0 && (
        <div className="section-card" style={{ marginTop: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Target size={16} style={{ color: 'var(--accent-tertiary)' }} />
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Success Metrics</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.successMetrics.map((m: string, i: number) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--accent-tertiary)' }}>✓</span> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
