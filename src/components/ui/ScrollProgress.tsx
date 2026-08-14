import { useEffect, useRef } from 'react';

/** The thin purple bar that tracks how far down the page you are. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      ref.current?.style.setProperty('--progress', String(ratio));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
