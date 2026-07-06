'use client';
import { useState, useEffect, useRef } from 'react';

const slides = [
  {
    title: '精选软件',
    desc: '发现高效实用的开源免费工具',
    items: ['免费开源', '精选推荐', '每日更新'],
    btn: '浏览软件库',
    darkBg: 'linear-gradient(135deg, #0d1117, #151b23)',
    lightBg: 'linear-gradient(135deg, #f0f2f5, #e1e4e8)',
  },
  {
    title: '技术文章',
    desc: '深入浅出的软件使用指南与评测',
    items: ['技术教程', '工具推荐', '系统优化'],
    btn: '阅读文章',
    darkBg: 'linear-gradient(135deg, #0f141c, #131822)',
    lightBg: 'linear-gradient(135deg, #f2f4f8, #e4e7ed)',
  },
  {
    title: '社区推荐',
    desc: '汇集全网优质免费软件资源',
    items: ['用户推荐', '热门下载', '编辑精选'],
    btn: '发现更多',
    darkBg: 'linear-gradient(135deg, #0d1117, #161b22)',
    lightBg: 'linear-gradient(135deg, #f0f2f5, #e8eaef)',
  },
];

export default function Carousel() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [dark, setDark] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const check = () => setDark(document.documentElement.getAttribute('data-theme') !== 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const update = () => {
      if (!cardRef.current) return;
      setSize({ w: cardRef.current.offsetWidth, h: cardRef.current.offsetHeight });
    };
    update();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (cardRef.current && observer) observer.observe(cardRef.current);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const s = slides[current];
  const bg = dark ? s.darkBg : s.lightBg;
  const rot = (base: number) => hovered ? base - 180 : base;
  const T = 'all 2s';
  const w = Math.max(size.w, 300);
  const h = Math.max(size.h, 208);
  const cx = w / 2;
  const cy = h / 2;
  const edgeGlow = Math.max(w, h) + 600;
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
  const navGlassShadow = dark
    ? '0 12px 34px rgba(0,0,0,0.22)'
    : '0 12px 32px rgba(99,102,241,0.08)';
  const navGlassHighlight = dark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.38), rgba(255,255,255,0))';
  const borderGlowMask = {
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  } as const;

  return (
    <div ref={cardRef} className="relative isolate w-full h-52 md:h-60 rounded-xl mb-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ transition: 'background 0.8s ease' }}>
      <div className="pointer-events-none absolute z-0 transition-opacity duration-500" style={{
        inset: -5,
        padding: 5,
        overflow: 'hidden',
        filter: 'blur(1.5px)',
        borderRadius: 18,
        opacity: hovered ? 0.68 : 0.42,
        ...borderGlowMask,
      }}>
        <div style={{
          position: 'absolute',
          left: cx - edgeGlow / 2,
          top: cy - edgeGlow / 2,
          width: edgeGlow,
          height: edgeGlow,
          transform: 'rotate(' + rot(60) + 'deg)',
          backgroundImage: g1,
          transition: T,
        }} />
      </div>
      <div className="pointer-events-none absolute z-0" style={{
        inset: -3,
        padding: 3,
        overflow: 'hidden',
        borderRadius: 18,
        ...borderGlowMask,
      }}>
        <div style={{
          position: 'absolute',
          left: cx - edgeGlow / 2,
          top: cy - edgeGlow / 2,
          width: edgeGlow,
          height: edgeGlow,
          transform: 'rotate(' + rot(82) + 'deg)',
          backgroundImage: g2,
          transition: T,
        }} />
      </div>
      <div className="pointer-events-none absolute z-0" style={{
        inset: -2,
        padding: 2,
        overflow: 'hidden',
        filter: 'blur(2px)',
        borderRadius: 17,
        opacity: hovered ? 0.74 : 0.5,
        ...borderGlowMask,
      }}>
        <div style={{
          position: 'absolute',
          left: cx - edgeGlow / 2,
          top: cy - edgeGlow / 2,
          width: edgeGlow,
          height: edgeGlow,
          transform: 'rotate(' + rot(83) + 'deg)',
          backgroundImage: g3,
          transition: T,
        }} />
      </div>
      <div className="pointer-events-none absolute z-0" style={{
        inset: -1,
        padding: 1,
        overflow: 'hidden',
        filter: 'blur(0.5px)',
        borderRadius: 16,
        ...borderGlowMask,
      }}>
        <div style={{
          position: 'absolute',
          left: cx - edgeGlow / 2,
          top: cy - edgeGlow / 2,
          width: edgeGlow,
          height: edgeGlow,
          transform: 'rotate(' + rot(70) + 'deg)',
          backgroundImage: g4,
          transition: T,
        }} />
      </div>
      <div className="absolute inset-[2px] z-[1] overflow-hidden rounded-[10px]" style={{
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          opacity: dark ? 0.18 : 0.16,
          transition: 'background 0.8s ease, opacity 0.8s ease',
        }} />
      </div>
      <div className="absolute inset-[2px] z-[2] rounded-[10px]" style={{
        background: 'var(--bg-glass)',
        pointerEvents: 'none',
        WebkitBackdropFilter: 'blur(24px)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--border-color)',
        boxShadow: hovered ? navGlassShadow.replace('12px 34px', '18px 46px').replace('12px 32px', '18px 42px') : navGlassShadow,
        transition: 'background 0.8s ease, border-color 0.8s ease, box-shadow 0.4s ease',
      }} />
      <div className="absolute inset-[3px] z-[3] rounded-[9px]" style={{
        background: navGlassHighlight,
        pointerEvents: 'none',
      }} />
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3 p-5 md:p-7 h-full">
        <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
        <div className="flex flex-wrap gap-2">
          {s.items.map((item, i) => (
            <span key={i} className="px-3 py-1 text-xs rounded-full"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{item}</span>
          ))}
        </div>
        <button className="text-sm font-medium px-5 py-2 rounded-full mt-auto w-fit"
          style={{
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            border: '1px solid var(--border-color)',
          }}>{s.btn}</button>
      </div>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ background: i === current ? 'var(--accent)' : 'var(--border-color)' }} />
        ))}
      </div>
    </div>
  );
}
