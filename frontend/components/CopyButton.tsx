'use client';
import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/lib/hooks';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <button
      onClick={() => copy(text)}
      className="btn-ghost"
      style={{ fontSize: 12, padding: '5px 10px' }}
    >
      {copied ? <><Check size={12} style={{ color: 'var(--accent-green)' }} /> Copied!</> : <><Copy size={12} /> {label}</>}
    </button>
  );
}
