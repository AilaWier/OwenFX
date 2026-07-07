'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

export default function PageScrollIndicator() {
  const [top, setTop] = useState(92);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(documentHeight - viewportHeight, 0);

      if (maxScroll <= 8) {
        setVisible(false);
        return;
      }

      const indicatorHeight = Math.max(72, viewportHeight / 6);
      const travel = Math.max(viewportHeight - indicatorHeight - 24, 0);
      const progress = window.scrollY / maxScroll;
      setTop(12 + travel * progress);
      setVisible(true);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="page-scroll-indicator"
      style={{
        '--scroll-indicator-top': `${top}px`,
        '--scroll-indicator-opacity': visible ? 1 : 0,
      } as CSSProperties & Record<string, string | number>}
    />
  );
}
