'use client';
import { useState, useEffect } from 'react';

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
  const [current, setCurrent] = useState(0);
  const [dark, setDark] = useState(true);

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

  const s = slides[current];
  const bg = dark ? s.darkBg : s.lightBg;

  return (
    <div className="relative w-full h-52 md:h-60 rounded-xl overflow-hidden mb-8"
      style={{ background: bg, transition: 'background 0.8s ease' }}>
      {/* Glass overlay */}
      <div className="absolute inset-0" style={{
        background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        backdropFilter: 'blur(1px)',
        WebkitBackdropFilter: 'blur(1px)',
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