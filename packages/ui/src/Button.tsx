import { cn } from '@my-cambo/utils';
import Link from 'next/link';

type Variant = 'primary' | 'ghost' | 'gold';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-marine text-white hover:bg-marine-dark',
  ghost: 'bg-transparent text-marine border-[1.5px] border-gris-ligne hover:border-marine',
  gold: 'bg-ic-or text-marine-dark hover:brightness-95',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-7 py-3.5 text-sm',
};

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  onClick,
  disabled,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200',
    'hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
