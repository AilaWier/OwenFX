'use client';

import { useEffect } from 'react';

export default function ScrollActivity() {
  useEffect(() => {
    let timer: number | null = null;

    const showScrollbar = () => {
      document.documentElement.classList.add('is-scrolling');
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 900);
    };

    window.addEventListener('scroll', showScrollbar, { passive: true });
    window.addEventListener('wheel', showScrollbar, { passive: true });
    window.addEventListener('touchmove', showScrollbar, { passive: true });
    window.addEventListener('keydown', showScrollbar);

    return () => {
      if (timer) window.clearTimeout(timer);
      document.documentElement.classList.remove('is-scrolling');
      window.removeEventListener('scroll', showScrollbar);
      window.removeEventListener('wheel', showScrollbar);
      window.removeEventListener('touchmove', showScrollbar);
      window.removeEventListener('keydown', showScrollbar);
    };
  }, []);

  return null;
}
