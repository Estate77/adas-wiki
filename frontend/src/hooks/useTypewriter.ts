import { useEffect, useState } from 'react';

/**
 * 打字机效果 Hook
 * @param text  要播放的文本
 * @param speed 打字速度(ms)
 * @param start 是否开始播放
 */
export function useTypewriter(text: string, speed = 60, start = true) {
  const [out, setOut] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;
    setOut('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, start]);

  return { text: out, done };
}
