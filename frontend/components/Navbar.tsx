'use client';
import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onHistoryClick: () => void;
}

export default function Navbar({ theme, onThemeToggle, onHistoryClick }: NavbarProps) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: theme === 'dark' ? 'rgba(10,10,15,0.85)' : 'rgba(248,248,255,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: 'white',
          }}>A</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>ArchGen <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Architecture Generator</div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="#generate" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s' }}>Generate</a>
          <button onClick={onHistoryClick} className="btn-ghost" style={{ fontSize: 13 }}>History</button>
          <button onClick={onThemeToggle} className="btn-ghost" style={{ padding: '8px 10px' }} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
