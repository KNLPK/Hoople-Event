import { useEffect, useRef } from 'react';
import { observeReveal } from '@/lib/motion';

interface RevealProps {
  /** Stagger, in ms, applied once the element enters the viewport. */
  delay?: number;
  as?: 'div' | 'section' | 'aside';
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Wraps a block so it rises and sharpens into view on first scroll-in. */
export function Reveal({
  delay = 0,
  as: Tag = 'div',
  className = '',
  id,
  style,
  children,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return observeReveal(ref.current, delay);
  }, [delay]);

  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
