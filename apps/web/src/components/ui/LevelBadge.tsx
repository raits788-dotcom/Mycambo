'use client';

import { Award, ShieldCheck, Crown, Star, Gem } from 'lucide-react';
import { getLevel, type Level } from '@/lib/levels';

const ICONS: Record<Level, any> = {
  inscrit: Award,
  verifie: ShieldCheck,
  premium: Star,
  exception: Crown,
  legende: Gem,
};

export function LevelBadge({
  level,
  size = 'md',
  showLabel = true,
}: {
  level: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}) {
  const cfg = getLevel(level);
  const Icon = ICONS[(level as Level) || 'inscrit'] || Award;

  const sizes = {
    sm: { padding: 'px-2 py-0.5', icon: 10, text: 'text-[10px]' },
    md: { padding: 'px-2.5 py-1', icon: 12, text: 'text-[11px]' },
    lg: { padding: 'px-3 py-1.5', icon: 14, text: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${cfg.bg} ${cfg.text} ${s.padding} ${s.text}`}
    >
      <Icon size={s.icon} />
      {showLabel && cfg.badge}
    </span>
  );
}

export function SubLabels({
  labels,
  size = 'md',
}: {
  labels: any[];
  size?: 'sm' | 'md';
}) {
  if (!labels || labels.length === 0) return null;

  const s = size === 'sm'
    ? { padding: 'px-2 py-0.5', text: 'text-[10px]' }
    : { padding: 'px-2.5 py-1', text: 'text-[11px]' };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {labels.map((l, i) => (
        <span
          key={l.id || i}
          className={`inline-flex items-center gap-1 rounded-full font-bold text-white ${s.padding} ${s.text}`}
          style={{ backgroundColor: l.color || '#1B3A6B' }}
        >
          {l.icon && <span>{l.icon}</span>}
          {l.name}
        </span>
      ))}
    </div>
  );
}