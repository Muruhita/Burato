import { useState, useEffect } from 'react';

export function useCooldown(key = 'form_submit') {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    const check = () => {
      const until = localStorage.getItem(`fib_cd_${key}`);
      if (until) {
        const left = Math.max(0, Math.ceil((parseInt(until) - Date.now()) / 1000));
        setCooldown(left);
        if (left > 0) timer = setTimeout(check, 1000);
      } else {
        setCooldown(0);
      }
    };
    check();
    return () => clearTimeout(timer);
  }, [key]);

  const trigger = (seconds = 20) => {
    const until = Date.now() + seconds * 1000;
    localStorage.setItem(`fib_cd_${key}`, until.toString());
    setCooldown(seconds);
    
    // Запуск локального таймера для мгновенного UI
    const tick = () => {
      const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldown(left);
      if (left > 0) setTimeout(tick, 1000);
    };
    tick();
  };

  return { cooldown, trigger };
}
