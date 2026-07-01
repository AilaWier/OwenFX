'use client';
import { useEffect } from 'react';

/** Scrolls to top on page refresh / first mount */
export default function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
