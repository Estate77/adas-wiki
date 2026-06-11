import { useEffect, useState } from 'react';

/**
 * 视差 Hook：监听滚动，返回一个 0~1 的进度值（受 speed 控制速度）
 * @param speed 速度倍率，越大越快，0 表示不动
 */
export function useScrollProgress(speed = 1) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = window.innerHeight * 1.2; // 视差作用范围
        setProgress(Math.min(1, (y * speed) / max));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return progress;
}

/**
 * 鼠标视差：返回鼠标在元素内的归一化偏移 (-1 ~ 1)
 */
export function useMouseParallax() {
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setOffset({
        x: (e.clientX - cx) / cx,
        y: (e.clientY - cy) / cy,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return offset;
}
