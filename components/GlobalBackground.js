import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function GlobalBackground() {
  const router = useRouter();
  const containerRef = useRef(null);
  const p5Ref = useRef(null);
  const modeRef = useRef('grid');

  const targetMode = router.pathname === '/' ? 'radar' : 'grid';
  modeRef.current = targetMode;

  useEffect(() => {
    const boot = () => {
      if (p5Ref.current) return;

      const sketch = (p) => {
        let mode = 'grid';
        let ready = false;

        // grid
        let gridOffX = 0, gridOffY = 0, scanY = -200;
        let gridTargets = [];

        // radar
        let sweep = 0;
        let radarTargets = [];

        const initGrid = () => {
          gridOffX = 0; gridOffY = 0; scanY = -200;
          gridTargets = [];
          for (let i = 0; i < 40; i++) {
            gridTargets.push({
              x: p.random(p.width),
              y: p.random(p.height),
              r: p.random(1, 2.2),
              speed: p.random(0.08, 0.25),
              dir: p.random(p.TWO_PI),
              pulse: p.random(p.TWO_PI),
              pulseSpeed: p.random(0.01, 0.03)
            });
          }
        };

        const initRadar = () => {
          sweep = 0;
          radarTargets = [];
          const maxR = Math.min(p.width, p.height) * 0.44;
          for (let i = 0; i < 60; i++) {
            radarTargets.push({
              r: p.random(30, maxR),
              baseA: p.random(p.TWO_PI),
              pulse: p.random(p.TWO_PI),
              pulseSpeed: p.random(0.02, 0.05),
              drift: p.random(-0.0004, 0.0004),
              blink: 0
            });
          }
        };

        const applyMode = (m) => {
          mode = m;
          if (m === 'grid') initGrid();
          else initRadar();
        };

        p.setup = () => {
          const cnv = p.createCanvas(window.innerWidth, window.innerHeight);
          cnv.style('position', 'fixed');
          cnv.style('top', '0');
          cnv.style('left', '0');
          cnv.style('z-index', '0');
          cnv.style('pointer-events', 'none');
          p.pixelDensity(1);
          applyMode(modeRef.current);
          ready = true;
        };

        p.draw = () => {
          if (!ready) return;
          if (mode !== modeRef.current) applyMode(modeRef.current);
          if (mode === 'grid') drawGrid();
          else drawRadar();
        };

        // ─── РЕЖИМ «СЕТКА НАБЛЮДЕНИЯ» ───
        const drawGrid = () => {
          p.background(10);

          gridOffX += 0.12;
          gridOffY += 0.06;

          const spacing = 90;
          const sx = -(gridOffX % spacing);
          const sy = -(gridOffY % spacing);

          // линии сетки
          p.stroke(255, 255, 255, 8);
          p.strokeWeight(1);
          for (let x = sx; x < p.width + spacing; x += spacing) p.line(x, 0, x, p.height);
          for (let y = sy; y < p.height + spacing; y += spacing) p.line(0, y, p.width, y);

          // узлы на пересечениях
          p.noStroke();
          p.fill(255, 255, 255, 20);
          for (let x = sx; x < p.width + spacing; x += spacing) {
            for (let y = sy; y < p.height + spacing; y += spacing) {
              p.rect(x - 1, y - 1, 2, 2);
            }
          }

          // цели-точки
          for (const t of gridTargets) {
            t.x += Math.cos(t.dir) * t.speed;
            t.y += Math.sin(t.dir) * t.speed;
            t.dir += (Math.random() - 0.5) * 0.02;
            if (t.x < 0 || t.x > p.width)  t.dir = Math.PI - t.dir;
            if (t.y < 0 || t.y > p.height) t.dir = -t.dir;
            t.pulse += t.pulseSpeed;
            const pv = 0.5 + 0.5 * Math.sin(t.pulse);

            p.noStroke();
            p.fill(255, 255, 255, 30 + pv * 40);
            p.circle(t.x, t.y, t.r * 2);
            p.fill(255, 255, 255, 5 + pv * 6);
            p.circle(t.x, t.y, t.r * 8);
          }

          // скан-линия
          scanY += 2.2;
          if (scanY > p.height + 200) scanY = -200;

          const ctx = p.drawingContext;
          const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(1, 'rgba(255,255,255,0.05)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, scanY - 60, p.width, 60);

          p.stroke(255, 255, 255, 30);
          p.strokeWeight(1);
          p.line(0, scanY, p.width, scanY);

          // усиленные сегменты по краям
          p.stroke(255, 255, 255, 70);
          p.line(0, scanY, 40, scanY);
          p.line(p.width - 40, scanY, p.width, scanY);
        };

        // ─── РЕЖИМ «РАДАР» ───
        const drawRadar = () => {
          p.background(10);

          const cx = p.width / 2;
          const cy = p.height / 2;
          const maxR = Math.min(p.width, p.height) * 0.44;

          p.push();
          p.translate(cx, cy);

          // кольца
          p.noFill();
          p.stroke(255, 255, 255, 12);
          p.strokeWeight(1);
          for (let r = maxR * 0.25; r <= maxR + 0.5; r += maxR * 0.25) {
            p.circle(0, 0, r * 2);
          }
          // перекрестье
          p.stroke(255, 255, 255, 20);
          p.line(-maxR, 0, maxR, 0);
          p.line(0, -maxR, 0, maxR);

          // центр
          p.stroke(255, 255, 255, 60);
          p.circle(0, 0, 6);

          // луч
          sweep += 0.012;
          if (sweep > p.TWO_PI) sweep -= p.TWO_PI;

          // шлейф
          for (let i = 0; i < 40; i++) {
            const a = sweep - i * 0.02;
            const alpha = (40 - i) * 0.008;
            p.stroke(255, 255, 255, alpha);
            p.strokeWeight(1);
            p.line(0, 0, Math.cos(a) * maxR, Math.sin(a) * maxR);
          }

          // яркая линия
          p.stroke(255, 255, 255, 120);
          p.strokeWeight(1.5);
          p.line(0, 0, Math.cos(sweep) * maxR, Math.sin(sweep) * maxR);

          // цели
          for (const t of radarTargets) {
            t.baseA += t.drift;
            t.pulse += t.pulseSpeed;

            const x = Math.cos(t.baseA) * t.r;
            const y = Math.sin(t.baseA) * t.r;

            let d = sweep - t.baseA;
            while (d < -Math.PI) d += p.TWO_PI;
            while (d >  Math.PI) d -= p.TWO_PI;

            if (Math.abs(d) < 0.05) t.blink = 1;
            t.blink *= 0.95;

            const base = 30 + 40 * (0.5 + 0.5 * Math.sin(t.pulse));
            const alpha = base + t.blink * 180;

            p.noStroke();
            p.fill(255, 255, 255, alpha);
            p.circle(x, y, 2 + t.blink * 3);

            if (t.blink > 0.1) {
              p.fill(255, 255, 255, t.blink * 30);
              p.circle(x, y, 20 + t.blink * 20);
            }
          }

          p.pop();
        };

        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
          applyMode(mode);
        };
      };

      p5Ref.current = new window.p5(sketch, containerRef.current);
    };

    if (!window.p5) {
      const existing = document.querySelector('script[data-p5]');
      if (existing) {
        existing.addEventListener('load', boot);
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
        script.dataset.p5 = '1';
        script.onload = boot;
        document.body.appendChild(script);
      }
    } else {
      boot();
    }

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}
