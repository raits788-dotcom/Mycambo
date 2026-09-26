import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gris-ligne rounded-lg overflow-hidden',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-cb-lg',
        className
      )}
    >
      {children}
    </div>
  );
}