'use client';
import { useRef, useEffect } from 'react';

type Particle = { x:number; y:number; vx:number; vy:number; r:number; phase:number; glowStart:number; glowDuration:number };

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

    const scheduleGlow = (p: Particle, from: number, initial = false) => {
      const wait = initial ? Math.random() * 18 : Math.random() * 12 + 8;
      p.glowStart = from + wait;
      p.glowDuration = Math.random() * 3 + 3.4;
    };

    const getParticleMode = () => window.innerWidth < 640 ? 'mobile' : 'desktop';
    const getTargetCount = () => getParticleMode() === 'mobile' ? 26 : 40;
    const fillParticles = (targetCount = getTargetCount()) => {
      const width = Math.max(1, canvas.offsetWidth);
      const height = Math.max(1, canvas.offsetHeight);
      parts.length = 0;
      const now = Date.now() / 1000;
      for (let i = 0; i < targetCount; i++) {
        const p = { x: Math.random()*width, y: Math.random()*height, vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4, r: Math.random()*2+1, phase: Math.random() * Math.PI * 2, glowStart: 0, glowDuration: 0 };
        scheduleGlow(p, now, true);
        parts.push(p);
      }
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
      fillParticles(nextMode === 'mobile' ? 26 : 40);
    };
    syncCanvas();
    const resizeObserver = new ResizeObserver(syncCanvas);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', syncCanvas);

    const animate = () => {
      syncCanvas();
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const c = isLight ? '0,0,0' : '255,255,255';
      const glowRgb = '255,255,255';
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const time = Date.now() / 1000;

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
        if (time > p.glowStart + p.glowDuration) scheduleGlow(p, time);
        const progress = (time - p.glowStart) / p.glowDuration;
        const isGlowing = progress >= 0 && progress <= 1;

        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(' + c + ',.5)';
        ctx.fill();

        if (!isGlowing) continue;

        const smoothPulse = Math.sin(Math.PI * progress);
        const flicker = 0.94 + Math.sin(time * 0.9 + p.phase) * 0.06;
        const glow = Math.pow(Math.max(0, smoothPulse), 2.15) * flicker;
        if (glow < 0.06) continue;

        const radius = Math.max(2.4, p.r * (1.05 + glow * 0.5));
        const haloRadius = radius * (3.8 + glow * 3.2);

        const halo = ctx.createRadialGradient(p.x, p.y, radius * 0.6, p.x, p.y, haloRadius);
        halo.addColorStop(0, 'rgba(' + glowRgb + ',' + (0.08 + glow * 0.25) + ')');
        halo.addColorStop(0.42, 'rgba(' + glowRgb + ',' + (0.04 + glow * 0.11) + ')');
        halo.addColorStop(1, 'rgba(' + glowRgb + ',0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        const body = ctx.createRadialGradient(p.x - radius * 0.36, p.y - radius * 0.42, radius * 0.12, p.x, p.y, radius * 1.5);
        body.addColorStop(0, 'rgba(255,255,255,' + (0.62 + glow * 0.38) + ')');
        body.addColorStop(0.34, 'rgba(255,255,255,' + (0.5 + glow * 0.36) + ')');
        body.addColorStop(0.74, 'rgba(255,255,255,' + (0.24 + glow * 0.32) + ')');
        body.addColorStop(1, 'rgba(255,255,255,' + (0.04 + glow * 0.05) + ')');
        ctx.beginPath(); ctx.arc(p.x, p.y, radius * 1.45, 0, Math.PI * 2);
        ctx.shadowBlur = 6 + glow * 14;
        ctx.shadowColor = 'rgba(' + glowRgb + ',' + (0.2 + glow * 0.35) + ')';
        ctx.fillStyle = body;
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
