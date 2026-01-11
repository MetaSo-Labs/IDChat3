import { useRef } from 'react';

type Timer = ReturnType<typeof setInterval>;

export function usePollingController() {
  const timerRef = useRef<Timer | null>(null);

  const start = (fn: () => void | Promise<void>, interval = 5000) => {
    if (timerRef.current) return; // 防止重复启动

    fn(); // 立即执行一次
    timerRef.current = setInterval(() => {
      fn();
    }, interval);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    start,
    stop,
    isRunning: () => timerRef.current !== null,
  };
}
