/**
 * Убирает HTML-теги, control-символы, экранирует Discord-упоминания.
 * Ограничивает длину.
 */
export function sanitizeText(input, maxLength = 1000) {
  if (typeof input !== 'string') return input;

  let s = input;

  // 1. Убираем HTML/XML теги
  s = s.replace(/<[^>]*>/g, '');

  // 2. Убираем control-символы (кроме \n \t \r)
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

  // 3. Экранируем Discord-упоминания @everyone / @here (zero-width space)
  s = s.replace(/@everyone/gi, '@\u200beveryone');
  s = s.replace(/@here/gi, '@\u200bhere');

  // 3.5. Убираем Discord-markdown, который ломает embed в логах
  // (``` блоки, `inline`, ||спойлеры||, > цитаты)
  s = s.replace(/```/g, '');
  s = s.replace(/`([^`]+)`/g, '$1');
  s = s.replace(/\|\|/g, '');
  s = s.replace(/^>\s?/gm, '');

  // 4. Убираем реальные упоминания <@123> и роли <@&123>
  s = s.replace(/<@[!&]?\d+>/g, '');

  // 5. Триммим и ограничиваем длину
  s = s.trim().slice(0, maxLength);

  return s;
}

/**
 * Рекурсивно прогоняет объект через sanitizeText.
 */
export function sanitizeObject(obj, maxLength = 1000) {
  if (typeof obj === 'string') return sanitizeText(obj, maxLength);

  if (Array.isArray(obj)) {
    return obj.map(v => sanitizeObject(v, maxLength));
  }

  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeObject(v, maxLength);
    }
    return out;
  }

  return obj;
}
