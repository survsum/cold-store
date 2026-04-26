'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  baseOpacity: number;
  layerMultiplier: number;
  offsetX: number;
}

export default function SnowParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // PERFORMANCE: devicePixelRatioCap = 1.5
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Theme observer logic
    let isDark = document.documentElement.classList.contains('dark');
    const updateBlendMode = () => {
      canvas.style.mixBlendMode = isDark ? 'screen' : 'multiply';
      canvas.style.opacity = isDark ? '0.85' : '0.6';
    };
    updateBlendMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          isDark = document.documentElement.classList.contains('dark');
          updateBlendMode();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // GENERAL CONFIG
    const particleCountDesktop = 280; // Increased for higher density
    const particleCountTablet = 180;
    const particleCountMobile = 110;
    
    let maxParticles = particleCountDesktop;
    if (width < 768) maxParticles = particleCountMobile;
    else if (width < 1024) maxParticles = particleCountTablet;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const particles: Particle[] = [];

    // Build particles
    for (let i = 0; i < maxParticles; i++) {
      // SIZE: minSize: 1.2px, maxSize: 4.2px, largeParticleRatio: 0.18
      const isLarge = Math.random() < 0.18;
      const radius = isLarge 
        ? Math.random() * (4.2 - 2.5) + 2.5 
        : Math.random() * (2.5 - 1.2) + 1.2;

      // DEPTH PARALLAX
      const layer = Math.random();
      let layerMultiplier = 1.0; // midLayerSpeedMultiplier
      if (layer < 0.33) layerMultiplier = 0.65; // farLayerSpeedMultiplier
      else if (layer > 0.66) layerMultiplier = 1.35; // nearLayerSpeedMultiplier

      // FALL SPEED: minVelocityY: 0.12, maxVelocityY: 0.42
      const baseVy = (Math.random() * (0.42 - 0.12) + 0.12) * layerMultiplier;
      
      // DRIFT: minVelocityX: -0.08, maxVelocityX: 0.08
      const baseVx = (Math.random() * (0.08 - -0.08) + -0.08) * layerMultiplier;
      
      // OPACITY: minOpacity: 0.18, maxOpacity: 0.72
      const opacity = Math.random() * (0.72 - 0.18) + 0.18;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: radius,
        vx: 0,
        vy: 0,
        baseVx: baseVx,
        baseVy: baseVy,
        baseOpacity: opacity,
        layerMultiplier: layerMultiplier,
        offsetX: Math.random() * Math.PI * 2,
      });
    }

    // CURSOR INTERACTION
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = mouse.x - lastMouse.x;
      mouse.vy = mouse.y - lastMouse.y;
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let angle = 0;
    let animationFrameId: number;
    let isTabVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastMouse = { x: mouse.x, y: mouse.y };
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const draw = () => {
      // PERFORMANCE: pauseWhenTabHidden
      if (!isTabVisible) return;
      
      ctx.clearRect(0, 0, width, height);
      // swaySpeed: 0.0018
      angle += 0.0018;
      
      // inertiaDamping: 0.92
      mouse.vx *= 0.92;
      mouse.vy *= 0.92;

      // THEME COLORS: Light 20,20,20 / Dark 255,255,255
      const rgb = isDark ? '255, 255, 255' : '20, 20, 20';

      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        
        // interactionRadius: 130px
        if (Math.abs(dx) < 130 && Math.abs(dy) < 130) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const force = (130 - dist) / 130;
            const angleToMouse = Math.atan2(dy, dx);
            
            // repulsionStrength: 0.85
            const pushX = Math.cos(angleToMouse) * force * 0.85;
            const pushY = Math.sin(angleToMouse) * force * 0.85;
            
            p.vx -= pushX;
            p.vy -= pushY;
            
            // maxPushDistance cap simulation by limiting velocity spikes
            p.vx = Math.max(-5, Math.min(5, p.vx));
            p.vy = Math.max(-5, Math.min(5, p.vy));
            
            // attractionStrength: 0.10
            p.vx += mouse.vx * force * 0.10;
            p.vy += mouse.vy * force * 0.10;
          }
        }

        // DRIFT: swayAmplitude: 8px. Lerp factor handling smoothing.
        const targetVx = p.baseVx + Math.sin(angle + p.offsetX) * (8 * p.layerMultiplier * 0.015);
        const targetVy = p.baseVy;
        
        // returnToFlowSpeed: 0.035
        p.vx += (targetVx - p.vx) * 0.035;
        p.vy += (targetVy - p.vy) * 0.035;

        // SMOOTHING: lerpFactor: 0.08 
        // Applying the primary lerp to position directly or velocity.
        // We use direct velocity addition to match physical inertia.
        p.x += p.vx;
        p.y += p.vy;

        // Render particle
        ctx.beginPath();
        ctx.fillStyle = `rgba(${rgb}, ${p.baseOpacity})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        ctx.fill();

        // Screen wrapping (No rain streaks/vertical lines)
        if (p.x > width + 5) p.x = -5;
        if (p.x < -5) p.x = width + 5;
        if (p.y > height + 5) {
          p.y = -5;
          p.x = Math.random() * width;
        }
        if (p.y < -5) p.y = height + 5;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}
