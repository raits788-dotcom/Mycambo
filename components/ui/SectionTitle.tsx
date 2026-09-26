import { cn } from '@/lib/utils';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionTitleProps) {
  return (
    <div className={cn('mb-8', align === 'center' && 'text-center')}>
      {eyebrow && (
        <div
          className={cn(
            'flex items-center gap-3 mb-3',
            align === 'center' && 'justify-center'
          )}
        >
          <span className="h-px w-8 bg-marine" />
          <span className="text-xs uppercase tracking-[0.25em] text-marine font-bold">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-extrabold text-marine tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-gris-texte mt-2 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}