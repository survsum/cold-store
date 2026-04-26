'use client';

import { useEffect, useRef, useState } from 'react';

function CursorInner() {
  const cursorRef  = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<HTMLDivElement>(null);
  const pos        = useRef({ x: -200, y: -200 });
  const ringPos    = useRef({ x: -200, y: -200 });
  const frameRef   = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Triple-check: no cursor on touch/mobile devices
    const isTouch = (
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
    if (isTouch) return;

    document.documentElement.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onDown = () => setIsClicking(true);
    const onUp   = () => setIsClicking(false);
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a,button,[role="button"],input,textarea,select')) setIsHovering(true);
    };
    const onOut = () => setIsHovering(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    const animate = () => {
      const dot  = cursorRef.current;
      const ring = ringRef.current;
      
      // Update dot instantly
      if (dot) dot.style.transform = `translate3d(${pos.current.x - 5}px, ${pos.current.y - 5}px, 0) scale(${isClicking ? 0.6 : 1})`;
      
      // Smoothly interpolate ring
      if (ring) {
        ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
        ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;
        const s = isHovering ? 1.8 : isClicking ? 0.8 : 1;
        ring.style.transform = `translate3d(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px, 0) scale(${s})`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(frameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      <div ref={cursorRef} className="absolute rounded-full" style={{
        width: 10, height: 10, top: 0, left: 0, willChange: 'transform',
        background: isHovering ? 'var(--accent)' : 'var(--text-primary)',
        transition: 'background 0.2s',
      }} />
      <div ref={ringRef} className="absolute rounded-full border-[1.5px] border-solid" style={{
        width: 40, height: 40, top: 0, left: 0, willChange: 'transform',
        borderColor: isHovering ? 'var(--accent)' : 'var(--text-primary)',
        opacity: isHovering ? 0.5 : 0.3,
        transition: 'border-color 0.3s, opacity 0.3s',
      }} />
    </div>
  );
}

export default function CustomCursor() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Only mount cursor component on true pointer devices
    const isPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isPointer) setShow(true);
  }, []);
  if (!show) return null;
  return <CursorInner />;
}
