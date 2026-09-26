'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 14,
  md: 18,
  lg: 24,
};

export default function RatingStars({
  value,
  onChange,
  size = 'md',
  className,
}: RatingStarsProps) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const displayValue = hover || value;
  const starSize = SIZES[size];

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            disabled={!interactive}
            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            className={cn(
              'transition-transform',
              interactive && 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              size={starSize}
              className={cn(
                filled ? 'fill-ic-or text-ic-or' : 'text-gris-ligne'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
