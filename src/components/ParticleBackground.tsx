'use client';
import { useRef, useEffect } from 'react';

export default function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let anim: number;
    const parts: Array<{x:number;y:number;vx:number;vy:number;r:number}> = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) parts.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4, r: Math.random()*2+1 });

    let glowTick = 0;
    const glowSet: number[] = [];

    const pickGlow = () => {
      glowSet.length = 0;
      const s = new Set<number>();
      while (s.size < 6) s.add(Math.floor(Math.random() * parts.length));
      glowSet.push(...s);
    };
    pickGlow();

    const animate = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const c = isLight ? '0,0,0' : '255,255,255';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      glowTick++;
      if (glowTick > 60) { glowTick = 0; pickGlow(); }

      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
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
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="w-full h-full" />;
}