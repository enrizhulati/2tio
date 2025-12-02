'use client';

import { useEffect, useRef } from 'react';

interface ConfettiProps {
  duration?: number;
}

function Confetti({ duration = 3000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Brand colors + festive colors
    const colors = [
      '#FF6F61', // coral
      '#20C997', // teal
      '#FFD700', // gold
      '#FF69B4', // pink
      '#87CEEB', // sky blue
      '#98FB98', // pale green
      '#DDA0DD', // plum
    ];

    // Confetti particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      shape: 'rect' | 'circle';
    }

    const particles: Particle[] = [];
    const particleCount = 150;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }

    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fade out near the end
      const opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
      ctx.globalAlpha = opacity;

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.vx *= 0.99; // air resistance
        p.rotation += p.rotationSpeed;

        // Wrap horizontally
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}

export { Confetti };
