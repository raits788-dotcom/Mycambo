import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'terra' | 'rice';
  className?: string;
}

const variants = {
  gold: 'bg-gold/15 text-gold-dark border-gold/30',
  terra: 'bg-terra/15 text-terra border-terra/30',
  rice: 'bg-rice/15 text-rice border-rice/30',
};

export default function Badge({
  children,
  variant = 'gold',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-[11px] uppercase tracking-wider font-medium border rounded-full',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}