// lib/urlValidator.js
// Безопасная валидация пользовательских ссылок

const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const DEFAULT_MAX_LENGTH = 2000;

// Control chars + CRLF
const CONTROL_CHARS = /[\x00-\x1F\x7F]/;

// Запрещённые протоколы
const DANGEROUS_PROTOCOLS = /^\s*(javascript|data|vbscript|file|blob|about|chrome|chrome-extension|ms-its|mhtml):/i;

// Явно запрещённые хосты
const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  'metadata.google.internal',
  'metadata',
  '169.254.169.254'
]);

// 🖼️ Белый список хостеров картинок
// 🖼️ Белый список хостеров картинок
export const TRUSTED_IMAGE_HOSTS = [
  // ImgBB
  'ibb.co', 'i.ibb.co', 'imgbb.com',
  // Imgur
  'imgur.com', 'i.imgur.com',
  // Discord CDN
  'cdn.discordapp.com', 'media.discordapp.net',
  // Pinterest
  'i.pinimg.com', 'pinimg.com',
  // Google
  'googleusercontent.com', 'www.youtube.com', 'youtube.com',
  'drive.google.com', 'youtu.be',       // ← Google Drive для картинок
  // GitHub
  'githubusercontent.com',
  // Cloudinary
  'cloudinary.com',
  // Unsplash
  'unsplash.com', 'images.unsplash.com',
  // GIF / Stickers
  'tenor.com', 'media.tenor.com',
  'giphy.com', 'media.giphy.com',
  // YouTube превью
  'img.youtube.com', 'i.ytimg.com',
  // Pixfy / pixsafe / pixhost
  'pixfy.com', 'www.pixfy.com',
  'pixsafe.online', 'www.pixsafe.online',
  'pixhost.to', 'www.pixhost.to',
  'i.pixhost.to', 't.pixhost.to',
  // Разные хостеры
  'dropmefiles.com',
  'yapx.ru',
  'fotora.ru'
];

// 📄 Белый список хостов для doc-ссылок (отчёты, доказательства)
export const TRUSTED_LINK_HOSTS = [
  ...TRUSTED_IMAGE_HOSTS,

  // Google Docs / Sheets / Drive
  'docs.google.com',
  'drive.google.com',
  'sheets.google.com',
  'slides.google.com',
  'forms.gle',

  // YouTube
  'youtube.com', 'youtu.be', 'm.youtube.com',

  // Discord
  'discord.com', 'discordapp.com', 'discord.gg',

  // Разработка
  'github.com', 'gitlab.com', 'bitbucket.org',

  // Хранилища
  'disk.yandex.ru', 'disk.yandex.com', 'yadi.sk',
  'dropbox.com', 'www.dropbox.com',
  'mega.nz', 'onedrive.live.com', '1drv.ms',

  // Форум Majestic
  'forum.majestic-rp.ru',
  'majestic-rp.ru',

  // Файлообменники
  'transfiles.ru',
  'kurl.ru'
];

function isPrivateIPv4(host) {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b, c, d] = m.slice(1).map(Number);
  if ([a, b, c, d].some(n => n < 0 || n > 255)) return true;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIPv6(host) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === '::1') return true;
  if (h === '::') return true;
  if (h.startsWith('fc') || h.startsWith('fd')) return true;
  if (h.startsWith('fe80')) return true;
  return false;
}

/**
 * Проверяет URL на безопасность.
 */
export function isSafeUrl(input, opts = {}) {
  if (typeof input !== 'string') return false;

  const trimmed = input.trim();
  if (!trimmed) return false;

  const maxLength = opts.maxLength ?? DEFAULT_MAX_LENGTH;
  if (trimmed.length > maxLength) return false;

  if (CONTROL_CHARS.test(trimmed)) return false;
  if (DANGEROUS_PROTOCOLS.test(trimmed)) return false;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return false;

  const host = url.hostname.toLowerCase();

  if (BLOCKED_HOSTS.has(host)) return false;
  if (isPrivateIPv4(host)) return false;
  if (isPrivateIPv6(host)) return false;

  if (!/^[a-z0-9.-]+$/i.test(host) && !/^\[[a-f0-9:]+\]$/i.test(host)) {
    return false;
  }

  if (Array.isArray(opts.allowedHosts) && opts.allowedHosts.length > 0) {
    const allowed = opts.allowedHosts.some(base => {
      const b = base.toLowerCase();
      return host === b || host.endsWith('.' + b);
    });
    if (!allowed) return false;
  }

  return true;
}

/**
 * Извлекает все http(s)-ссылки из текста.
 */
export function extractUrls(text) {
  if (typeof text !== 'string') return [];
  return text.match(/https?:\/\/[^\s<>"']+/gi) || [];
}

/**
 * Находит все небезопасные ссылки в тексте.
 */
export function findUnsafeUrls(text, opts = {}) {
  const urls = extractUrls(text);
  return urls.filter(u => !isSafeUrl(u, opts));
}

/**
 * Экранирует URL для использования внутри CSS `url(...)`.
 */
export function escapeCssUrl(url) {
  if (typeof url !== 'string') return '';
  return url.replace(/[\\"'\n\r()\s;{}]/g, '');
}

/**
 * Возвращает безопасную CSS-функцию для background-image.
 */
export function safeCssBackgroundImage(url) {
  if (!isSafeUrl(url)) return 'none';
  return `url("${url.replace(/"/g, '%22')}")`;
}

/**
 * Проверяет, входит ли хост URL в whitelist.
 */
export function isHostInWhitelist(url, hosts) {
  if (typeof url !== 'string') return false;
  if (!Array.isArray(hosts)) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return hosts.some(base => {
      const b = base.toLowerCase();
      return host === b || host.endsWith('.' + b);
    });
  } catch {
    return false;
  }
}
