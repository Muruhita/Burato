// lib/badwords.js
//
// Список банвордов. Проверка идёт по границам слов, поэтому «плохой»,
// «бляха», «рубля», «shitake», «Dickinson» больше НЕ банятся.
//
// ВАЖНО: ложное срабатывание = автобан на 7 дней. Лучше НЕДОловить,
// чем забанить за «плохой». Если нужна конкретная производная
// (хуйня, похуй, ебало и т.п.) — добавь её отдельной строкой.

const BAD_WORDS = [
  // ── Русский мат ────────────────────────────────────────
  'хуй', 'пизда', 'блядь', 'мудак', 'сука', 'пидор', 'гандон',
  'еблан', 'долбоеб', 'пидр', 'хуесос', 'сучка', 'шлюха',
  'курва', 'нахуй', 'ебать', 'ебал', 'пиздец', 'залупа',
  'гнида', 'тварь', 'выблядок', 'ублюдок',

  // ── Английский: базовые формы + частые производные ─────
  'fuck', 'fucks', 'fucked', 'fucking', 'fucker', 'fuckers',
  'shit', 'shits', 'shitted', 'shitting', 'shitty',
  'bitch', 'bitches', 'bitchy',
  'asshole', 'assholes',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'dick', 'dicks',
  'pussy', 'pussies',
  'whore', 'whores',
  'slut', 'sluts',
  'motherfucker', 'motherfuckers',
  'douchebag', 'douchebags',
  'asshat', 'asshats',
  'bullshit',

  // ── Транслит ───────────────────────────────────────────
  'hui', 'pizda', 'blyad', 'blyat', 'pidor', 'pidr', 'huilo',
  'huy', 'nahuy', 'naxuy', 'ebat', 'ebal', 'pizdec',
  'zhopa', 'govno', 'mudak', 'suka', 'sucka', 'dolboeb',
  'gandon',

  // ── Обходы через цифры (0→о, 6→б) ──────────────────────
  'e6aть', 'e6al', 'naxui', 'nahui', 'xui', 'xuy', '6lyad',

  // ── Обходы через точки (буквальные точки в тексте) ─────
  'х.у.й', 'п.з.да', 'с.ука',
];

// Экранируем спецсимволы regex (., +, *, ?, (, ), [, ], {, }, |, \, ^, $)
// чтобы «х.у.й» искался как буквальные точки, а не как «любой символ».
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Word-boundary для Unicode: \p{L} — любая буква, \p{N} — цифра.
// \b в JS работает только с ASCII и для кириллицы не годится.
const PATTERN = `(?<![\\p{L}\\p{N}_])(?:${BAD_WORDS.map(escapeRegex).join('|')})(?![\\p{L}\\p{N}_])`;

export function containsBadWords(text) {
  if (!text) return false;
  return new RegExp(PATTERN, 'iu').test(text);
}

export function findBadWord(text) {
  if (!text) return null;
  const m = new RegExp(PATTERN, 'iu').exec(text);
  return m ? m[0].toLowerCase() : null;
}

export function findAllBadWords(text) {
  if (!text) return [];
  const found = new Set();
  for (const m of text.matchAll(new RegExp(PATTERN, 'giu'))) {
    found.add(m[0].toLowerCase());
  }
  return Array.from(found);
}

export default BAD_WORDS;
