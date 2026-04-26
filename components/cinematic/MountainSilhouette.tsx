'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function MountainSilhouette() {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springConfig = { damping: 60, stiffness: 40, mass: 2.5 }; // Slower, heavier motion
  const mouseX = useSpring(mousePosition.x, springConfig);
  const mouseY = useSpring(mousePosition.y, springConfig);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const yMid1 = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const yMid2 = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const yFg = useTransform(scrollYProgress, [0, 1], ['0%', '0%']);

  const pxBg = useTransform(mouseX, [-1, 1], [-5, 5]);
  const pxMid1 = useTransform(mouseX, [-1, 1], [-10, 10]);
  const pxMid2 = useTransform(mouseX, [-1, 1], [-18, 18]);
  const pxFg = useTransform(mouseX, [-1, 1], [-30, 30]);

  const pyBg = useTransform(mouseY, [-1, 1], [-2, 2]);
  const pyMid1 = useTransform(mouseY, [-1, 1], [-4, 4]);
  const pyMid2 = useTransform(mouseY, [-1, 1], [-8, 8]);
  const pyFg = useTransform(mouseY, [-1, 1], [-12, 12]);

  const combinedYBg = useTransform(() => `calc(${yBg.get()} + ${pyBg.get()}px)`);
  const combinedYMid1 = useTransform(() => `calc(${yMid1.get()} + ${pyMid1.get()}px)`);
  const combinedYMid2 = useTransform(() => `calc(${yMid2.get()} + ${pyMid2.get()}px)`);
  const combinedYFg = useTransform(() => `calc(${yFg.get()} + ${pyFg.get()}px)`);

  return (
    <div ref={ref} className="absolute inset-x-0 bottom-0 z-0 h-[100vh] pointer-events-none overflow-hidden select-none">
      
      {/* 
        Single unified SVG container
        preserveAspectRatio="xMidYMax slice" ensures the bottom of the SVG perfectly aligns with the bottom of the screen,
        preventing ANY horizontal cut lines or boxed banding.
      */}
      <svg viewBox="0 0 1440 800" className="absolute bottom-0 w-full h-[110%]" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Pale mist blue-gray for distant mountains */}
          <linearGradient id="ice-1" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--text-muted)" stopOpacity="0.25" />
            <stop offset="80%" stopColor="var(--bg-primary)" stopOpacity="1" />
          </linearGradient>
          
          {/* Soft icy blue for mid mountains */}
          <linearGradient id="ice-2" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--text-secondary)" stopOpacity="0.4" />
            <stop offset="70%" stopColor="var(--bg-primary)" stopOpacity="1" />
          </linearGradient>

          {/* Darker charcoal-blue for foreground mountains */}
          <linearGradient id="ice-3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--text-muted)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--bg-primary)" stopOpacity="1" />
          </linearGradient>

          {/* Deep foreground snow drift */}
          <linearGradient id="ice-4" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.8" />
            <stop offset="40%" stopColor="var(--text-secondary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--bg-primary)" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Layer 1: Far Mountains (Pale mist - STATIC for performance) */}
        <g>
          {/* Path extended to y=1400 so bottom is NEVER visible */}
          <path fill="url(#ice-1)" d="M-200,1400 L-200,280 C-50,220 50,120 200,120 C350,120 450,260 650,260 C850,260 950,120 1100,120 C1250,120 1350,260 1500,260 C1600,260 1700,200 1800,220 L1800,1400 Z"></path>
          <path fill="rgba(255,255,255,0.08)" d="M120,180 C160,130 185,120 200,120 C215,120 240,130 280,180 C240,175 215,185 200,195 C180,210 150,175 120,180 Z"></path>
        </g>

        {/* Layer 2: Mid Mountains (Soft icy blue) */}
        <motion.g style={{ y: combinedYMid1, x: pxMid1 }}>
          <path fill="url(#ice-2)" d="M-200,1400 L-200,420 C0,380 80,240 220,240 C360,240 450,420 600,420 C750,420 850,260 1000,260 C1150,260 1250,440 1450,440 C1550,440 1650,360 1800,380 L1800,1400 Z"></path>
          <path fill="rgba(255,255,255,0.15)" d="M140,320 C170,260 200,240 220,240 C240,240 270,260 300,320 C260,310 240,325 220,340 C190,360 160,315 140,320 Z"></path>
        </motion.g>

        {/* Layer 3: Front Mountains (Charcoal-blue) */}
        <motion.g style={{ y: combinedYMid2, x: pxMid2 }}>
          <path fill="url(#ice-3)" d="M-200,1400 L-200,550 C-50,550 50,360 250,360 C450,360 550,550 750,550 C950,550 1050,380 1250,380 C1450,380 1550,550 1800,550 L1800,1400 Z"></path>
          <path fill="rgba(255,255,255,0.25)" d="M150,450 C200,390 230,360 250,360 C270,360 300,390 350,450 C300,440 270,455 250,470 C220,490 180,445 150,450 Z"></path>
          
          {/* Subtle Lone Wolf Silhouette directly drawn onto the SVG path at the peak (250, 360) */}
          <path fill="var(--text-primary)" className="opacity-80 mix-blend-multiply dark:mix-blend-normal dark:opacity-90" d="M 246 355 L 246 352 L 245 353 L 244 352 L 247 350 L 251 350 L 252 348 L 252.5 346 L 253.5 347.5 L 255 347.5 L 256 348.5 L 255 349.5 L 253 351 L 253 355 L 252 355 L 252 352 L 249 352 L 249 355 L 248 355 L 248 352 Z" />
        </motion.g>

        {/* Layer 4: Foreground Snow Drift */}
        <motion.g style={{ y: combinedYFg, x: pxFg }}>
          <path fill="url(#ice-4)" d="M-200,1400 L-200,680 C-50,650 150,560 350,560 C550,560 650,680 900,680 C1150,680 1250,580 1450,580 C1600,580 1700,620 1800,650 L1800,1400 Z"></path>
        </motion.g>
      </svg>

      {/* Deep, Seamless Volumetric Fog (Optimized: No heavy backdrop-filter) */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-bg-primary via-bg-primary/90 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
    </div>
  );
}
