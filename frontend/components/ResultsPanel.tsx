'use client';
import { useState } from 'react';
import { AnalysisResult, generateDiagram, generatePlan } from '@/lib/api';
import MermaidDiagram from './MermaidDiagram';
import TechStackSection from './TechStackSection';
import ImplementationPlan from './ImplementationPlan';
import DBSchema from './DBSchema';
import APIStructure from './APIStructure';
import ScalingStrategy from './ScalingStrategy';
import CopyButton from './CopyButton';
import {
  Layout, GitBranch, Layers, Database, Globe, TrendingUp, Map,
  Users, ArrowRight, Download, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ResultsPanelProps {
  id?: string;
  data: AnalysisResult;
}

const TABS = [
  { id: 'hld',      label: 'HLD Overview',   icon: <Layout size={14} /> },
  { id: 'diagram',  label: 'Diagram',         icon: <GitBranch size={14} /> },
  { id: 'plan',     label: 'Implementation',  icon: <Map size={14} /> },
  { id: 'techstack',label: 'Tech Stack',      icon: <Layers size={14} /> },
  { id: 'database', label: 'DB Schema',       icon: <Database size={14} /> },
  { id: 'api',      label: 'API Structure',   icon: <Globe size={14} /> },
  { id: 'scaling',  label: 'Scaling',         icon: <TrendingUp size={14} /> },
];

export default function ResultsPanel({ id, data }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState('hld');
  const [diagram, setDiagram] = useState('');
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const loadDiagram = async () => {
    if (diagram) return;
    setDiagramLoading(true);
    try {
      const res = await generateDiagram(data);
      setDiagram(res.diagram);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate diagram');
    } finally {
      setDiagramLoading(false);
    }
  };

  const loadPlan = async () => {
    if (plan) return;
    setPlanLoading(true);
    try {
      const res = await generatePlan(data);
      setPlan(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'diagram' && !diagram) loadDiagram();
    if (tab === 'plan' && !plan) loadPlan();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.projectName.replace(/\s+/g, '-').toLowerCase()}-architecture.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Architecture JSON downloaded!');
  };

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Project header */}
      <div className="section-card" style={{
        marginBottom: 24, padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>{data.projectName}</h2>
              <span className="badge badge-purple">{data.projectType}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.summary}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CopyButton text={JSON.stringify(data, null, 2)} label="Copy JSON" />
            <button onClick={downloadJSON} className="btn-ghost">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-scroll" style={{
        display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4,
        marginBottom: 24, WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="fade-in-up">
        {/* HLD */}
        {activeTab === 'hld' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Overview */}
            <div className="section-card">
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>System Overview</h3>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {data.hld.overview}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Actors */}
              <div className="section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Users size={16} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontWeight: 700, fontSize: 14 }}>Actors</h3>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.hld.actors.map((actor, i) => (
                    <li key={i} style={{
                      padding: '8px 12px', background: 'var(--bg-elevated)',
                      borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)',
                      display: 'flex', gap: 8, alignItems: 'center',
                    }}>
                      <span style={{ color: 'var(--accent-primary)', fontSize: 16 }}>👤</span> {actor}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Flow */}
              <div className="section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <ArrowRight size={16} style={{ color: 'var(--accent-tertiary)' }} />
                  <h3 style={{ fontWeight: 700, fontSize: 14 }}>Data Flow</h3>
                </div>
                <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.hld.dataFlow.map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(6,182,212,0.2)', color: '#22d3ee',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Components */}
            <div className="section-card">
              <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>System Components</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {data.hld.components.map((comp, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', background: 'var(--bg-elevated)',
                    borderRadius: 10, border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{comp.name}</span>
                      <span className="badge badge-indigo" style={{ fontSize: 9 }}>{comp.type}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Decisions */}
            {data.hld.keyDecisions?.length > 0 && (
              <div className="section-card">
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Architectural Decisions</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.hld.keyDecisions.map((d, i) => (
                    <li key={i} style={{
                      padding: '10px 14px', background: 'var(--bg-elevated)',
                      borderRadius: 8, border: '1px solid var(--border)',
                      fontSize: 13, color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent-primary)',
                    }}>
                      💡 {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'diagram' && (
          <div className="section-card">
            {diagramLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Generating diagram...</p>
              </div>
            ) : diagram ? (
              <MermaidDiagram code={diagram} onRegenerate={() => { setDiagram(''); loadDiagram(); }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <GitBranch size={40} style={{ color: 'var(--accent-primary)', marginBottom: 12 }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Click below to generate the architecture diagram</p>
                <button className="btn-primary" onClick={loadDiagram}>
                  <GitBranch size={16} /> Generate Diagram
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div>
            {planLoading ? (
              <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--accent-primary)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Generating implementation plan...</p>
              </div>
            ) : plan ? (
              <ImplementationPlan data={plan} />
            ) : (
              <div className="section-card" style={{ textAlign: 'center', padding: 40 }}>
                <Map size={40} style={{ color: 'var(--accent-primary)', marginBottom: 12 }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Click below to generate your implementation roadmap</p>
                <button className="btn-primary" onClick={loadPlan}>
                  <Map size={16} /> Generate Plan
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'techstack' && <TechStackSection data={data.techStack} />}
        {activeTab === 'database' && <DBSchema data={data.databaseSchema} />}
        {activeTab === 'api' && <APIStructure data={data.apiStructure} />}
        {activeTab === 'scaling' && <ScalingStrategy data={data.scalingStrategy} />}
      </div>
    </section>
  );
}
