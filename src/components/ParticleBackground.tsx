'use client';
import { useRef, useEffect } from 'react';

type Particle = { x:number; y:number; vx:number; vy:number; r:number };

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let anim: number;
    let activeMode: 'mobile' | 'desktop' | null = null;
    let activeWidth = 0;
    let activeHeight = 0;
    const parts: Particle[] = [];
    let glowTick = 0;
    const glowSet: number[] = [];

    const pickGlow = () => {
      glowSet.length = 0;
      const target = Math.min(6, parts.length);
      const s = new Set<number>();
      while (s.size < target) s.add(Math.floor(Math.random() * parts.length));
      glowSet.push(...s);
    };

    const getParticleMode = () => window.innerWidth < 640 ? 'mobile' : 'desktop';
    const getTargetCount = () => getParticleMode() === 'mobile' ? 30 : 40;
    const fillParticles = (targetCount = getTargetCount()) => {
      const width = Math.max(1, canvas.offsetWidth);
      const height = Math.max(1, canvas.offsetHeight);
      parts.length = 0;
      for (let i = 0; i < targetCount; i++) parts.push({ x: Math.random()*width, y: Math.random()*height, vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4, r: Math.random()*2+1 });
      glowTick = 0;
      pickGlow();
    };
    const syncCanvas = () => {
      const displayWidth = Math.max(1, Math.round(canvas.offsetWidth));
      const displayHeight = Math.max(1, Math.round(canvas.offsetHeight));
      const pixelRatio = window.devicePixelRatio || 1;
      const nextMode = getParticleMode();
      const nextWidth = Math.round(displayWidth * pixelRatio);
      const nextHeight = Math.round(displayHeight * pixelRatio);
      const shouldRebuild = parts.length === 0 || activeMode !== nextMode || activeWidth !== nextWidth || activeHeight !== nextHeight;

      if (!shouldRebuild) return;

      activeMode = nextMode;
      activeWidth = nextWidth;
      activeHeight = nextHeight;
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      fillParticles(nextMode === 'mobile' ? 30 : 40);
    };
    syncCanvas();
    const resizeObserver = new ResizeObserver(syncCanvas);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', syncCanvas);

    const animate = () => {
      syncCanvas();
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const c = isLight ? '0,0,0' : '255,255,255';
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      glowTick++;
      if (glowTick > 60) { glowTick = 0; pickGlow(); }

      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
      }

      for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) { ctx.beginPath(); ctx.moveTo(parts[i].x, parts[i].y); ctx.lineTo(parts[j].x, parts[j].y); ctx.strokeStyle = 'rgba(' + c + ',' + ((1 - d / 100) * 0.2) + ')'; ctx.stroke(); }
      }

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (glowSet.includes(i)) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(' + c + ',0.5)';
          ctx.fillStyle = 'rgba(' + c + ',0.85)';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(' + c + ',.5)';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      anim = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(anim); resizeObserver.disconnect(); window.removeEventListener('resize', syncCanvas); };
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
