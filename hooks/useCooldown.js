import { useState, useEffect } from 'react';

export function useCooldown(key = 'form_submit') {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const check = () => {
      const until = localStorage.getItem(`fib_cd_${key}`);
      if (until) {
        const left = Math.max(0, Math.ceil((parseInt(until) - Date.now()) / 1000));
        setCooldown(left);
        if (left <= 0) localStorage.removeItem(`fib_cd_${key}`);
      } else {
        setCooldown(0);
      }
    };

    check(); // Проверка при загрузке
    const interval = setInterval(check, 1000); // Тикаем каждую секунду
    return () => clearInterval(interval);
  }, [key]);

  const trigger = (seconds = 20) => {
    const until = Date.now() + seconds * 1000;
    localStorage.setItem(`fib_cd_${key}`, until.toString());
    setCooldown(seconds);
  };

  return { cooldown, trigger };
}
