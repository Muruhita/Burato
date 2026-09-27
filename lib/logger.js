// lib/logger.js
import redis from './redis';

const WEBHOOKS = {
  logs: process.env.WEBHOOK_LOGS,
  banwords: process.env.WEBHOOK_BANWORDS,
  autobans: process.env.AUTOBANS_LOGS,
  admins: process.env.ADMINS_LOGS,
  errors: process.env.BOT_ERRORS
};

const COLORS = {
  logs: 0x5865F2,      // синий
  banwords: 0xFFA500,  // оранжевый
  autobans: 0xFF4444,  // красный
  admins: 0x9B59B6,    // фиолетовый
  errors: 0x8B0000     // тёмно-красный
};

const TIMEOUT_MS = 5000;

/**
 * Отправка сообщения в Discord через webhook.
 * @param {'logs'|'banwords'|'autobans'|'admins'|'errors'} channel
 * @param {object} embed
 * @param {string} [fallbackText]
 */
export async function sendLog(channel, embed, fallbackText) {
  const url = WEBHOOKS[channel];
  if (!url) {
    console.warn(`[logger] Webhook "${channel}" не настроен`);
    return { success: false, reason: 'no webhook' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        username: 'FIB Logs',
        avatar_url: 'https://i.imgur.com/AfFp7pu.png',
        content: fallbackText || undefined,
        embeds: embed ? [embed] : undefined
      })
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[logger] ${channel}: HTTP ${res.status}`);
      return { success: false, status: res.status };
    }
    return { success: true };
  } catch (e) {
    clearTimeout(timer);
    console.error(`[logger] ${channel}:`, e.message);
    return { success: false, reason: e.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 1. WEBHOOK_LOGS — все отправленные заявки
// ─────────────────────────────────────────────────────────────
export async function logSubmission({ type, username, userId, avatar, formData, department, targetDepartment }) {
  const formTitle = getFormTitle(type);
  const color = COLORS.logs;

  const fields = [
    { name: '👤 Отправитель', value: `<@${userId}>`, inline: true },
    { name: '🆔 Discord ID', value: userId, inline: true },
    { name: '📋 Тип заявки', value: formTitle, inline: true }
  ];

  if (department) {
    fields.push({ name: '🏢 Отдел', value: String(department).toUpperCase(), inline: true });
  }
  if (targetDepartment) {
    fields.push({ name: '🎯 Целевой отдел', value: String(targetDepartment).toUpperCase(), inline: true });
  }

  // Текстовые поля из формы (без URL, чтобы не раздувать)
  const textFields = Object.entries(formData || {})
    .filter(([k, v]) => typeof v === 'string' && v.length > 0 && v.length < 200 && !v.startsWith('http'))
    .slice(0, 8);

  for (const [key, value] of textFields) {
    fields.push({
      name: `📌 ${key}`,
      value: value.length > 900 ? value.slice(0, 900) + '…' : value,
      inline: false
    });
  }

  const embed = {
    title: `📬 Заявка: ${formTitle}`,
    color,
    author: {
      name: username || 'Unknown',
      icon_url: avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : undefined
    },
    fields,
    footer: { text: 'Majestic FIB Forms • Submission Log' },
    timestamp: new Date().toISOString()
  };

  return sendLog('logs', embed);
}

// ─────────────────────────────────────────────────────────────
// 2. WEBHOOK_BANWORDS — кто и какое банворд-слово прислал
// ─────────────────────────────────────────────────────────────
export async function logBanword({ userId, username, avatar, type, formData, badWord, allFoundWords, action }) {
  const formTitle = getFormTitle(type);

  const allText = Object.values(formData || {})
    .filter(v => typeof v === 'string')
    .join(' ');

  const embed = {
    title: '🤬 Обнаружен банворд',
    color: COLORS.banwords,
    author: {
      name: username || 'Unknown',
      icon_url: avatar ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : undefined
    },
    fields: [
      { name: '👤 Нарушитель', value: `<@${userId}>`, inline: true },
      { name: '🆔 Discord ID', value: userId, inline: true },
      { name: '📋 Тип заявки', value: formTitle, inline: true },
      { name: '🔞 Найденное слово', value: `\`${badWord}\``, inline: false },
      { name: '📚 Все найденные', value: allFoundWords?.length > 1 ? allFoundWords.map(w => `\`${w}\``).join(', ') : '—', inline: false },
      { name: '💬 Текст заявки', value: allText.slice(0, 900) + (allText.length > 900 ? '…' : ''), inline: false },
      { name: '⚡ Действие', value: action || 'Автобан на 7 дней', inline: false }
    ],
    footer: { text: 'Majestic FIB Forms • Banword Detection' },
    timestamp: new Date().toISOString()
  };

  return sendLog('banwords', embed, `⚠️ <@${userId}> отправил банворд: \`${badWord}\``);
}

// ─────────────────────────────────────────────────────────────
// 3. AUTOBANS_LOGS — автобаны за спам/превышения
// ─────────────────────────────────────────────────────────────
export async function logAutoban({ userId, username, reason, duration, source }) {
  const embed = {
    title: '🔨 Автобан',
    color: COLORS.autobans,
    fields: [
      { name: '👤 Пользователь', value: `<@${userId}>`, inline: true },
      { name: '🆔 Discord ID', value: userId, inline: true },
      { name: '👥 Ник', value: username || 'Unknown', inline: true },
      { name: '📝 Причина', value: reason || 'Не указана', inline: false },
      { name: '⏱ Длительность', value: duration || '7 дней', inline: true },
      { name: '🔍 Источник', value: source || 'auto', inline: true }
    ],
    footer: { text: 'Majestic FIB Forms • Auto-Ban' },
    timestamp: new Date().toISOString()
  };

  return sendLog('autobans', embed, `🔨 Автобан: <@${userId}> — ${reason}`);
}

// ─────────────────────────────────────────────────────────────
// 4. ADMINS_LOGS — действия админов (бан/разбан/остановки)
// ─────────────────────────────────────────────────────────────
export async function logAdminAction({ adminId, adminUsername, action, targetId, targetUsername, reason, extra }) {
  const actionTitles = {
    ban: '🚫 Бан пользователя',
    unban: '🔓 Разбан пользователя',
    permanent_ban: '🔒 Перманентный бан',
    toggle_forms_off: '⏸ Заявки остановлены',
    toggle_forms_on: '▶️ Заявки возобновлены',
    clear_announcement: '🗑 Объявление удалено',
    save_announcement: '📢 Объявление обновлено',
    delete_ticket: '🗑 Тикет удалён',
    close_ticket: '✅ Тикет закрыт'
  };

  const fields = [
    { name: '👤 Админ', value: `<@${adminId}>`, inline: true },
    { name: '🆔 ID', value: adminId, inline: true },
    { name: '⚡ Действие', value: actionTitles[action] || action, inline: true }
  ];

  if (targetId) {
    fields.push({ name: '🎯 Цель', value: `<@${targetId}>`, inline: true });
    fields.push({ name: '🆔 Target ID', value: targetId, inline: true });
    if (targetUsername) {
      fields.push({ name: '👥 Ник цели', value: targetUsername, inline: true });
    }
  }

  if (reason) {
    fields.push({ name: '📝 Причина', value: reason.slice(0, 900), inline: false });
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      fields.push({ name: String(key), value: String(value).slice(0, 900), inline: false });
    }
  }

  const embed = {
    title: actionTitles[action] || 'Админ действие',
    color: COLORS.admins,
    fields,
    footer: { text: 'Majestic FIB Forms • Admin Log' },
    timestamp: new Date().toISOString()
  };

  return sendLog('admins', embed);
}

// ─────────────────────────────────────────────────────────────
// 5. BOT_ERRORS — ошибки бота
// ─────────────────────────────────────────────────────────────
export async function logError({ scope, message, stack, userId, extra }) {
  const embed = {
    title: '❌ Ошибка бота',
    color: COLORS.errors,
    fields: [
      { name: '📍 Где', value: scope || 'unknown', inline: true },
      ...(userId ? [{ name: '👤 Пользователь', value: `<@${userId}>`, inline: true }] : []),
      { name: '💬 Сообщение', value: (message || 'unknown').slice(0, 900), inline: false }
    ],
    footer: { text: 'Majestic FIB Forms • Error' },
    timestamp: new Date().toISOString()
  };

  if (stack) {
    embed.fields.push({
      name: '📚 Stack',
      value: '```\n' + String(stack).slice(0, 900) + '\n```',
      inline: false
    });
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      embed.fields.push({ name: String(key), value: String(value).slice(0, 500), inline: false });
    }
  }

  return sendLog('errors', embed);
}

// ─────────────────────────────────────────────────────────────
// Хелпер для названий форм
// ─────────────────────────────────────────────────────────────
function getFormTitle(type) {
  const map = {
    testlik: '🧪 TestLik',
    claim: '⁉️ Жалоба',
    hiring: '💼 Трудоустройство',
    withdrawal: '🔑 Снятие ЧС',
    reinstatement: '🔄 Восстановление',
    transferToFib: '🏛️ Перевод в FIB',
    weaponRequest: '🔫 Спец Вооружение',
    leave: '🌴 Отпуск',
    report: '📋 Отчёт на повышение',
    transfer: '🔀 Перевод в отдел',
    highrank: '⚜️ Хай ранг отчёт',
    resignation: '📛 Увольнение',
    promotion: '⬆️ Запрос на повышение'
  };
  return map[type] || type;
}
