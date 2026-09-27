import { cn } from '@my-cambo/utils';

export interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionTitleProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <div className="flex items-center gap-3 mb-4" style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
          <span className="h-px w-8 bg-marine" />
          <span className="text-xs uppercase tracking-[0.25em] text-marine font-bold">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-extrabold text-marine tracking-tight mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-gris-texte leading-relaxed max-w-2xl" style={{ marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}>
          {description}
        </p>
      )}
    </div>
  );
}
