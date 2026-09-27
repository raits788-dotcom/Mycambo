import { cn } from '@my-cambo/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export function Card({ children, className, href }: CardProps) {
  const classes = cn(
    'bg-white border border-gris-ligne rounded-lg overflow-hidden',
    'transition-all duration-200',
    href && 'hover:border-marine hover:shadow-cb-md hover:-translate-y-0.5',
    className
  );

  if (href) {
    return <a href={href} className={classes}>{children}</a>;
  }

  return <div className={classes}>{children}</div>;
}
