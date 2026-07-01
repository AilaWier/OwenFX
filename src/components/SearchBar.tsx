'use client';

import { useState, useRef, useEffect } from 'react';

export default function SearchBar() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);

  useEffect(() => {
    const upd = () => {
      if (barRef.current) setW(Math.min(barRef.current.offsetWidth, 576));
    };
    upd();
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);

  const [dark, setDark] = useState(true);
  useEffect(() => {
    const check = () => setDark(document.documentElement.getAttribute('data-theme') !== 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const rot = (base: number) => {
    if (focused) return base + 360;
    if (hovered) return base - 180;
    return base;
  };

  const T = focused ? 'all 4s' : 'all 2s';
  const w = Math.max(W, 300);
  const h = 56;
  const cx = w / 2;
  const cy = h / 2;

  const bg = dark ? '#0d1117' : '#f3f0f8';
  const tx = dark ? 'white' : '#1a1a2e';
  const ph = dark ? '#c0b9c0' : '#8880a0';

  const g1 = dark
    ? 'conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%)'
    : 'conic-gradient(#f3f0f8, #b8a5e0 5%, #f3f0f8 38%, #f3f0f8 50%, #e0a0c8 60%, #f3f0f8 87%)';
  const g2 = dark
    ? 'conic-gradient(rgba(0,0,0,0), #18116a, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, #6e1b60, rgba(0,0,0,0) 60%)'
    : 'conic-gradient(rgba(0,0,0,0), #c0a8e8, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, #d8a0c0, rgba(0,0,0,0) 60%)';
  const g3 = dark
    ? 'conic-gradient(rgba(0,0,0,0), #a099d8, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #dfa2da, rgba(0,0,0,0) 58%)'
    : 'conic-gradient(rgba(0,0,0,0), #c8b8e0, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #e0b8d0, rgba(0,0,0,0) 58%)';
  const g4 = dark
    ? 'conic-gradient(#1c191c, #402fb5 5%, #1c191c 14%, #1c191c 50%, #cf30aa 60%, #1c191c 64%)'
    : 'conic-gradient(#e8e4f0, #b8a5e0 5%, #e8e4f0 14%, #e8e4f0 50%, #e0a0c8 60%, #e8e4f0 64%)';

  const gb = dark
    ? 'linear-gradient(180deg, #161329, black, #1d1b4b)'
    : 'linear-gradient(180deg, #e8e4f0, #f8f6fc, #e8e4f0)';
  const bc = dark ? 'rgba(64,47,181,0.3)' : 'rgba(180,160,220,0.4)';
  const ic = dark ? '#c0b9c0' : '#6a5a8a';

  return (
    <div className="relative w-full max-w-xs md:max-w-xl mx-auto mb-6" style={{ zIndex: 10 }} ref={barRef}>
      <div className="relative w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <div className="pointer-events-none" style={{
          position: 'absolute', left: -27, top: -37, width: w + 54, height: h + 74,
          overflow: 'hidden', filter: 'blur(30px)', opacity: 0.4, zIndex: -1, borderRadius: 999,
        }}>
          <div style={{
            position: 'absolute', left: cx - 499, top: cy - 499, width: 999, height: 999,
            transform: 'rotate(' + rot(60) + 'deg)',
            backgroundImage: g1, transition: T,
          }} />
        </div>
        <div className="pointer-events-none" style={{
          position: 'absolute', left: -6, top: -5, width: w + 12, height: h + 9,
          overflow: 'hidden', zIndex: -1, borderRadius: 999,
        }}>
          <div style={{
            position: 'absolute', left: cx - 300, top: cy - 300, width: 600, height: 600,
            transform: 'rotate(' + rot(82) + 'deg)',
            backgroundImage: g2, transition: T,
          }} />
        </div>
        <div className="pointer-events-none" style={{
          position: 'absolute', left: -4, top: -4, width: w + 7, height: h + 7,
          overflow: 'hidden', zIndex: -1, filter: 'blur(2px)', borderRadius: 999,
        }}>
          <div style={{
            position: 'absolute', left: cx - 300, top: cy - 300, width: 600, height: 600,
            transform: 'rotate(' + rot(83) + 'deg)',
            backgroundImage: g3, transition: T,
          }} />
        </div>
        <div className="pointer-events-none" style={{
          position: 'absolute', left: -2, top: -2, width: w + 3, height: h + 3,
          overflow: 'hidden', zIndex: -1, filter: 'blur(0.5px)', borderRadius: 999,
        }}>
          <div style={{
            position: 'absolute', left: cx - 300, top: cy - 300, width: 600, height: 600,
            transform: 'rotate(' + rot(70) + 'deg)',
            backgroundImage: g4, transition: T,
          }} />
        </div>
        <input
          type="text"
          placeholder="搜索软件、文章..."
          className="w-full h-14 rounded-full text-base outline-none px-14"
          style={{ backgroundColor: bg, border: 'none', color: tx, caretColor: dark ? '#cf30aa' : '#a080c0' }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <svg className="absolute left-5 top-4 pointer-events-none" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <style dangerouslySetInnerHTML={{__html:'@keyframes sbRotate{to{transform:translate(-50%,-50%) rotate(450deg)}}'}} />
        <div style={{position:'absolute',right:7,top:7,width:42,height:42,zIndex:2,borderRadius:999,overflow:'hidden'}}>
          <div style={{position:'absolute',top:'50%',left:'50%',width:600,height:600,transform:'translate(-50%,-50%) rotate(90deg)',backgroundImage:'conic-gradient(transparent,#3d3a4f,transparent 50%,transparent 50%,#3d3a4f,transparent 100%)',animation:'sbRotate 4s linear infinite'}} />
        </div>
        <button style={{position:'absolute',right:8,top:8,display:'flex',alignItems:'center',justifyContent:'center',zIndex:3,height:40,width:38,borderRadius:999,cursor:'pointer',background:gb,border:'none'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 12 3 L 3 18 Q 12 14 21 18 Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}