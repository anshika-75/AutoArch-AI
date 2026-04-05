'use client';
import { HistoryEntry, deleteHistory } from '@/lib/api';
import { Trash2, X, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onRefresh: () => void;
}

export default function HistoryPanel({ entries, onClose, onSelect, onRefresh }: HistoryPanelProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await deleteHistory(id);
      toast.success('Entry deleted');
      onRefresh();
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: 420, height: '100vh', background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease',
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16 }}>History</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entries.length} saved generations</p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}><X size={16} /></button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>No history yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Generate an architecture to see it here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => { onSelect(entry); onClose(); }}
                  className="glass-hover"
                  style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: '1px solid var(--border)',
                    cursor: 'pointer', background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.projectName}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="badge badge-indigo" style={{ fontSize: 9 }}>{entry.projectType}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 11, color: 'var(--text-muted)', marginTop: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{entry.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={e => handleDelete(entry.id, e)}
                      disabled={deleting === entry.id}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
