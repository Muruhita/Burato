import { verifyToken } from '../../lib/discord';
import { addToBlacklist } from '../../lib/blacklist';
import { getBanInfo } from '../../lib/ban-utils';
import { containsBadWords, findBadWord, findAllBadWords } from '../../lib/badwords';
import { checkSpam, isFormSubmissionActive } from '../../lib/antispam';
import { sanitizeObject } from '../../lib/sanitize';
import redis from '../../lib/redis';
import {
  findUnsafeUrls,
  isHostInWhitelist,
  extractUrls,
  TRUSTED_IMAGE_HOSTS,
  TRUSTED_LINK_HOSTS
} from '../../lib/urlValidator';
import { checkUrlsSafeBrowsing, threatName } from '../../lib/safeBrowsing';
import { logSubmission, logBanword, logError } from '../../lib/logger';

const DEPARTMENTS = {
  'ib': { name: 'IB (Intelligence Branch)', webhook: process.env.WEBHOOK_REPORT_IB, emoji: '🕵️', roleId: '1398200840900055071', roleId2: '1520504887497064639' },
  'cid': { name: 'CID (Criminal Investigation)', webhook: process.env.WEBHOOK_REPORT_CID, emoji: '🔍', roleId: '1398200760843374652', roleId2: '1520680049655676948' },
  'fa': { name: 'FA (Free Agent)', webhook: process.env.WEBHOOK_REPORT_FA, emoji: '🆓', roleId: '1398200891353468928', roleId2: '1520680052176715876' },
  'hrt': { name: 'HRT (Hostage Rescue)', webhook: process.env.WEBHOOK_REPORT_HRT, emoji: '🛡️', roleId: '1398201557635567636', roleId2: '1520680047038435358' },
  'atf': { name: 'ATF (Anti Terrorism)', webhook: process.env.WEBHOOK_REPORT_ATF, emoji: '💥', roleId: '1520680054731051159', roleId2: '1398201048598057041' },
  'af': { name: 'AF (Air Force)', webhook: process.env.WEBHOOK_REPORT_AF, emoji: '✈️', roleId: '1398200952602755103', roleId2: '1532529633088635041' },
  'ocu': { name: 'OCU (Organized Crime)', webhook: process.env.WEBHOOK_REPORT_OCU, emoji: '⚖️', roleId: '1520680060808331294', roleId2: '1418771091291115631' },
  'dea': { name: 'DEA (Drug Enforcement)', webhook: process.env.WEBHOOK_REPORT_DEA, emoji: '💊', roleId: '1398201115379761283', roleId2: '1520680063614586963' },
  'fna': { name: 'FNA (Academy)', webhook: process.env.WEBHOOK_REPORT_FNA, emoji: '📚', roleId: '1520680066445742232', roleId2: '1385530645186613311' },
  'nsb': { name: 'NSB (National Security)', webhook: process.env.WEBHOOK_REPORT_NSB, emoji: '🏛️', roleId: '1520680069415174275', roleId2: '1398201167154122752' },
  'trainee': { name: 'Trainee (Стажёр)', webhook: process.env.WEBHOOK_REPORT_TRAINEE, emoji: '📖', roleId: '1385530645186613311', roleId2: '1520680066445742232' }
};

const TRANSFER_WEBHOOKS = {
  'cid': process.env.WEBHOOK_TRANSFER_CID,
  'fa': process.env.WEBHOOK_TRANSFER_FA,
  'hrt': process.env.WEBHOOK_TRANSFER_HRT,
  'atf': process.env.WEBHOOK_TRANSFER_ATF,
  'af': process.env.WEBHOOK_TRANSFER_AF,
  'ocu': process.env.WEBHOOK_TRANSFER_OCU,
  'dea': process.env.WEBHOOK_TRANSFER_DEA,
  'fna': process.env.WEBHOOK_TRANSFER_FNA,
  'nsb': process.env.WEBHOOK_TRANSFER_NSB
};

const webhooks = {
  promotion: process.env.WEBHOOK_PROMOTION,
  highrank: process.env.WEBHOOK_HIGH_RANK_REPORT,
  resignation: process.env.WEBHOOK_RESIGNATION,
  reinstatement: process.env.WEBHOOK_REINSTATEMENT,
  transferToFib: process.env.WEBHOOK_TRANSFER_TO_FIB,
  weaponRequest: process.env.WEBHOOK_WEAPON_REQUEST,
  leave: process.env.WEBHOOK_LEAVE,
  withdrawal: process.env.WEBHOOK_WITHDRAWAL,
  hiring: process.env.WEBHOOK_HIRING,
  claim: process.env.WEBHOOK_CLAIMFIB,
  testlik: process.env.TESTLIK_WEBHOOK
};

const EMBED_IMAGE_HOSTS = [
  'https://i.ibb.co/',
  'https://i.imgur.com/',
  'https://media.discordapp.net/',
  'https://cdn.discordapp.com/'
];

async function sendToDiscord(webhookUrl, data, retries = 3) {
  const safeWebhook = webhookUrl.replace('discord.com', 'discordapp.com');
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(safeWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) return { success: true, status: response.status };
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 5;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      const errorText = await response.text();
      return { success: false, status: response.status, error: errorText };
    } catch (error) {
      lastError = error;
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return { success: false, error: lastError ? lastError.message : 'Неизвестная ошибка' };
}

// ─────────────────────────────────────────────────────────────
// 🔒 Классификация URL-полей
// ─────────────────────────────────────────────────────────────
const IMAGE_FIELDS = [
  'screenshot', 'screenshots', 'singleImage', 'multiImages',
  'proof', 'proofLink', 'rankProof',
  'passportScreenshot', 'militaryId', 'medicalCertificates'
];

const DOC_FIELDS = [
  'approvalLink', 'approval',
  'reportLink', 'workLink', 'workLinks'
];

const URL_FIELDS = [...IMAGE_FIELDS, ...DOC_FIELDS];

function collectUrlFields(formData) {
  const result = [];

  for (const field of URL_FIELDS) {
    const value = formData[field];
    if (!value) continue;

    const isImage = IMAGE_FIELDS.includes(field);
    const opts = isImage
      ? { maxLength: 1000, allowedHosts: TRUSTED_IMAGE_HOSTS }
      : { maxLength: 2000, allowedHosts: TRUSTED_LINK_HOSTS };

    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === 'string') {
          findUnsafeUrls(v, opts).forEach(url => result.push({ field, index: i, url }));
        }
      });
    } else if (typeof value === 'string') {
      findUnsafeUrls(value, opts).forEach(url => result.push({ field, url }));
    }
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const isActive = await isFormSubmissionActive();
  if (!isActive) return res.status(403).json({ error: '🚫 Подача заявок остановлена администрацией.' });

  const banInfo = await getBanInfo(user.id);
  if (banInfo.banned) {
    return res.status(403).json({
      banned: true,
      reason: banInfo.reason,
      until: banInfo.until
    });
  }

  const spamCheck = await checkSpam(user.id, user.username);
  if (spamCheck.isSpam) return res.status(429).json({ error: spamCheck.message });

  const { type, department, targetDepartment, ...rawFormData } = req.body;
  const formData = sanitizeObject(rawFormData, 1000);
  const userId = user.id;
  const username = user.username;

  // ─────────────────────────────────────────────────
  // 🔒 Слой 1: whitelist + протоколы + приватные IP
  // ─────────────────────────────────────────────────
  const unsafeLinks = collectUrlFields(formData);
  if (unsafeLinks.length > 0) {
    console.warn('[submit] Отклонены небезопасные ссылки:', unsafeLinks.map(u => `${u.field}:${u.url}`).join(', '));

    const hasImageIssue = unsafeLinks.some(u => IMAGE_FIELDS.includes(u.field));

    return res.status(400).json({
      error: hasImageIssue
        ? 'Скриншот/доказательство загружено с недоверенного хостинга. Разрешены: imgbb, imgur, Discord CDN, Google Drive, Yandex Disk, GitHub, Cloudinary, Pinterest и др.'
        : 'Обнаружены небезопасные ссылки. Разрешены только http/https с доверенных хостов.'
    });
  }

  // ─────────────────────────────────────────────────
  // 🔒 Слой 2: Google Safe Browsing — только для URL вне whitelist
  // ─────────────────────────────────────────────────
  const allText = Object.values(formData).filter(v => typeof v === 'string').join(' ');
  const allUrls = extractUrls(allText);

  const urlsToCheck = allUrls.filter(url => {
    const isTrustedImage = isHostInWhitelist(url, TRUSTED_IMAGE_HOSTS);
    const isTrustedLink = isHostInWhitelist(url, TRUSTED_LINK_HOSTS);
    return !isTrustedImage && !isTrustedLink;
  });

  if (urlsToCheck.length > 0) {
    const sbResult = await checkUrlsSafeBrowsing(urlsToCheck);

    if (!sbResult.safe) {
      console.warn('[submit] SafeBrowsing BLOCK:', sbResult.url, sbResult.threat);
      return res.status(400).json({
        error: `Ссылка "${sbResult.url}" помечена как ${threatName(sbResult.threat)}. Заявка отклонена.`
      });
    }
  }

  // 🚫 Банворды
  if (containsBadWords(allText)) {
    const foundWords = findAllBadWords(allText);
    const foundWord = findBadWord(allText);
    const badWord = foundWord || foundWords.join(', ');

    await addToBlacklist(user.id, username, `Банворд: ${badWord}`);

    // 📢 Лог банворда
    await logBanword({
      userId,
      username,
      avatar: user.avatar,
      type,
      formData,
      badWord,
      allFoundWords: foundWords,
      action: 'Автобан на 7 дней + отказ в заявке'
    }).catch(e => console.error('[submit] banword log error:', e.message));

    return res.status(403).json({
      banned: true,
      reason: `Ваша заявка содержит запрещённое слово: "${badWord}".\nДоступ к системе заявок заблокирован на 7 дней.`,
      until: null
    });
  }

  let webhookUrl;
  let roleMentions = '';

  if (type === 'testlik') {
    webhookUrl = webhooks.testlik;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для теста не настроен (TESTLIK_WEBHOOK)' });
    roleMentions = '';
  } else if (type === 'claim') {
    webhookUrl = webhooks.claim;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для жалоб не настроен' });
    roleMentions = '<@&1543898638454099979>';
  } else if (type === 'hiring') {
    webhookUrl = webhooks.hiring;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для трудоустройства не настроен' });
    roleMentions = '<@&1274110499377778755>';
  } else if (type === 'withdrawal') {
    webhookUrl = webhooks.withdrawal;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для снятия ЧС не настроен' });
    roleMentions = '<@&1274110499377778755> <@&1274110499377778756>';
  } else if (type === 'reinstatement') {
    webhookUrl = webhooks.reinstatement;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для восстановления не настроен' });
    roleMentions = '<@&1274110499377778755> <@&1274110499377778756>';
  } else if (type === 'transferToFib') {
    webhookUrl = webhooks.transferToFib;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для перевода в FIB не настроен' });
    roleMentions = '<@&1274110499377778755> <@&1274110499377778756>';
  } else if (type === 'weaponRequest') {
    webhookUrl = webhooks.weaponRequest;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для спец вооружения не настроен' });
    roleMentions = '<@&1385513451077636136>';
  } else if (type === 'leave') {
    webhookUrl = webhooks.leave;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для отпуска не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else if (type === 'promotion') {
    webhookUrl = webhooks.promotion;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для повышения не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else if (type === 'highrank') {
    webhookUrl = webhooks.highrank;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для высоких рангов не настроен' });
    roleMentions = '<@&1289343511354671125>';
  } else if (type === 'resignation') {
    webhookUrl = webhooks.resignation;
    if (!webhookUrl) return res.status(500).json({ error: 'Вебхук для увольнений не настроен' });
    roleMentions = '<@&1274110499356934211>';
  } else if (type === 'report') {
    const dept = DEPARTMENTS[department];
    if (!dept) return res.status(400).json({ error: 'Выберите корректный отдел' });
    webhookUrl = dept.webhook;
    if (!webhookUrl) return res.status(500).json({ error: `Вебхук для "${dept.name}" не настроен` });
    if (dept.roleId) roleMentions += `<@&${dept.roleId}> `;
    if (dept.roleId2) roleMentions += `<@&${dept.roleId2}>`;
  } else if (type === 'transfer') {
    const deptKey = targetDepartment;
    if (!deptKey || !TRANSFER_WEBHOOKS[deptKey]) return res.status(400).json({ error: 'Некорректный отдел' });
    webhookUrl = TRANSFER_WEBHOOKS[deptKey];
    if (!webhookUrl) return res.status(500).json({ error: `Вебхук для перевода в "${deptKey}" не настроен` });
    const deptInfo = DEPARTMENTS[targetDepartment];
    if (deptInfo && deptInfo.roleId) roleMentions += `<@&${deptInfo.roleId}> `;
    if (deptInfo && deptInfo.roleId2) roleMentions += `<@&${deptInfo.roleId2}>`;
  } else {
    webhookUrl = webhooks.promotion;
    roleMentions = '<@&1274110499356934211>';
  }

  const embed = {
    title: getFormTitle(type, department, targetDepartment),
    color: getFormColor(type),
    author: { name: username, icon_url: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` },
    fields: buildFields(type, department, targetDepartment, formData, userId, username),
    footer: { text: 'Majestic FIB Forms • ' + new Date().toLocaleDateString('ru-RU') },
    timestamp: new Date().toISOString()
  };

  if (
    formData.screenshot &&
    EMBED_IMAGE_HOSTS.some(h => formData.screenshot.startsWith(h))
  ) {
    embed.image = { url: formData.screenshot };
  }

  const result = await sendToDiscord(webhookUrl, {
    content: roleMentions.trim() || undefined,
    embeds: [embed],
    username: 'FIB Forms',
    avatar_url: 'https://i.ytimg.com/vi/m5yUwUSBxsg/maxresdefault.jpg'
  });

  // 📢 Лог отправки заявки
  logSubmission({
    type,
    username,
    userId,
    avatar: user.avatar,
    formData,
    department,
    targetDepartment
  }).catch(e => console.error('[submit] submission log error:', e.message));

  if (result.success) {
    try {
      const now = new Date();
      const dayKey = `stats:day:${now.toISOString().slice(0,10)}`;
      const monthKey = `stats:month:${now.toISOString().slice(0,7)}`;
      const weekKey = `stats:week:${getWeekKey(now)}`;

      await redis.incr('stats:total');
      await redis.incr(`stats:type:${type}`);
      await redis.incr(dayKey); await redis.expire(dayKey, 60 * 60 * 24 * 2);
      await redis.incr(monthKey); await redis.expire(monthKey, 60 * 60 * 24 * 60);
      await redis.incr(weekKey); await redis.expire(weekKey, 60 * 60 * 24 * 8);
      await redis.incr(`stats:user:${userId}`);
    } catch (e) {
      console.error('Ошибка статистики:', e);
    }

    res.status(200).json({ success: true });
  } else {
    // 📢 Лог ошибки
    logError({
      scope: 'submit:discord',
      message: result.error || 'Failed to send to Discord',
      userId,
      extra: { type, webhookUrl: webhookUrl ? 'set' : 'missing' }
    }).catch(() => {});

    res.status(500).json({ error: `Не удалось отправить заявку: ${result.error}` });
  }
}

function getWeekKey(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}

function getFormTitle(type, department, targetDepartment) {
  if (type === 'testlik') return 'Test';
  if (type === 'claim') return '⁉️ Жалоба';
  if (type === 'hiring') return '💼 Трудоустройство в FIB';
  if (type === 'withdrawal') return '🔑 Запрос на снятие ЧС';
  if (type === 'reinstatement') return '🔄 Восстановление';
  if (type === 'transferToFib') return '🏛️ Перевод в FIB';
  if (type === 'weaponRequest') return '🔫 Спец Вооружение';
  if (type === 'leave') return '🌴 Отпуск';
  if (type === 'report') return `📋 Отчёт на повышение • ${DEPARTMENTS[department]?.name || ''}`;
  if (type === 'transfer') return `🔀 Перевод в ${DEPARTMENTS[targetDepartment]?.name || targetDepartment || ''}`;
  if (type === 'highrank') return '⚜️ Хай ранг отчет на повышении';
  if (type === 'resignation') return '📛 Заявление на увольнение';
  return '⬆️ Запрос на повышение';
}

function getFormColor(type) {
  const colors = {
    'testlik': 0x5865F2,
    'claim': 0xFF0000,
    'hiring': 0x2ECC95,
    'withdrawal': 0x421278,
    'reinstatement': 0xB8074A,
    'transferToFib': 0xd8e700,
    'weaponRequest': 0xB37F20,
    'leave': 0x00FF00,
    'promotion': 0x4CAF50,
    'transfer': 0x121978,
    'report': 0x0EAB93,
    'highrank': 0x8907B8,
    'resignation': 0xDC3545
  };
  return colors[type] || 0x5865F2;
}

function buildFields(type, department, targetDepartment, data, userId, username) {
  if (type === 'testlik') {
    const fields = [
      { name: '📝 Поле "Имя"', value: data.name || '—', inline: false },
      { name: '💬 Поле "Сообщение"', value: data.message || '—', inline: false },
      { name: '📂 Категория', value: data.category || '—', inline: true },
      { name: '📅 Дата', value: data.date || '—', inline: true },
      { name: '☑️ Согласие', value: data.agree ? '✅ Да' : '❌ Нет', inline: true }
    ];

    if (data.singleImage) {
      fields.push({ name: '🖼️ Одиночная картинка', value: data.singleImage, inline: false });
    }

    if (Array.isArray(data.multiImages) && data.multiImages.length) {
      fields.push({
        name: `📸 Мультикартинки (${data.multiImages.length})`,
        value: data.multiImages.join('\n'),
        inline: false
      });
    }

    fields.push(
      { name: '👤 Отправитель', value: `<@${userId}>`, inline: true },
      { name: '🆔 Discord ID', value: userId, inline: true }
    );

    return fields;
  }

  const baseFields = [
    { name: '👤 Отправитель:', value: `<@${userId}>`, inline: true },
    { name: '🆔 Discord ID', value: userId, inline: true }
  ];

  if (type === 'claim') {
    return [
      { name: '👤 Ваши Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🚨 Имя нарушителя', value: data.offenderName || 'Не указано', inline: false },
      { name: '📎 Приложенные Доказательства:', value: data.proofLink || 'Не указано', inline: false },
      { name: '📝 Обвинения/Причина', value: data.reason || 'Не указана', inline: false },
      ...baseFields
    ];
  }

  if (type === 'hiring') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🎂 Возраст (RP)', value: data.age || 'Не указан', inline: false },
      { name: '💼 Опыт работы', value: data.experience || 'Не указан', inline: false },
      { name: '📚 Знание законов RP', value: data.lawKnowledge || 'Не указано', inline: false },
      { name: '📄 Скриншот паспорта', value: data.passportScreenshot || 'Не указано', inline: false },
      { name: '🎖️ Скриншот Военного билета', value: data.militaryId || 'Не указано', inline: false },
      { name: '🩺 Скриншот Мед. справки', value: data.medicalCertificates || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  if (type === 'report') {
    const dept = DEPARTMENTS[department];
    const instructorText = data.isInstructor === 'yes' ? '✅ Да' : '❌ Нет';
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🏢 Отдел', value: dept ? `${dept.emoji} ${dept.name}` : 'Не указан', inline: false },
      { name: '📌 Текущий ранг', value: data.currentRank || 'Не указан', inline: false },
      { name: '🎯 Ранг на который повышаются', value: data.targetRank || 'Не указан', inline: false },
      { name: '👨‍🏫 Назначен ли на инструктора', value: instructorText, inline: false },
      { name: '🔗 Ссылки на проделанную работу:', value: data.workLinks || 'Не указаны', inline: false },
      ...baseFields
    ];
  }

  if (type === 'transfer') {
    const fields = [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ваш ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🏢 Текущий отдел', value: DEPARTMENTS[data.currentDepartment]?.name || data.currentDepartment || 'Не указано', inline: false },
      { name: '🎯 В какой отдел переводится', value: DEPARTMENTS[targetDepartment]?.name || targetDepartment || 'Не указано', inline: false },
      { name: '📝 Причина перевода:', value: data.reason || 'Не указано', inline: false }
    ];

    if (targetDepartment === 'cid') {
      fields.push(
        { name: '📋 Чем занимается CID/DB?', value: data.cidWhatIs || 'Не указано', inline: false },
        { name: '📋 Опыт работы в CID/DB?', value: data.cidExperience || 'Не указано', inline: false },
        { name: '📋 Примеры работ', value: data.cidExamples || 'Не указано', inline: false },
        { name: '📋 Серверы с CID/DB', value: data.cidServers || 'Не указано', inline: false },
        { name: '📋 Знания по работе CID (1-10)', value: data.cidKnowledge || 'Не указано', inline: false },
        { name: '📋 Знания по законке (1-10)', value: data.cidLawKnowledge || 'Не указано', inline: false }
      );
    }

    if (targetDepartment === 'fa') {
      fields.push(
        { name: '📋 Знание правил ПОИП', value: data.faRules || 'Не указано', inline: false },
        { name: '📋 Был ли в FA раньше', value: data.faPrevious || 'Не указано', inline: false }
      );
    }

    fields.push(...baseFields);
    return fields;
  }

  if (type === 'withdrawal') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '🚨 Причина ЧС', value: data.reason || 'Неизвестна', inline: false },
      { name: '📅 Дата выдачи ЧС', value: data.date || 'Неизвестна', inline: false },
      ...baseFields
    ];
  }

  if (type === 'weaponRequest') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ваш ранг', value: data.rank || 'Не указан', inline: false },
      { name: '🏢 Ваш отдел', value: department || 'Не указан', inline: false },
      { name: '🔫 Желаемое Спец.Вооружение', value: data.item || 'Не указан', inline: false },
      ...baseFields
    ];
  }

  if (type === 'reinstatement') {
    return [
      { name: '👤 Имя Фамилия | Статик ID', value: data.fullName || 'Не указано', inline: false },
      { name: '📌 Ранг на момент увольнения', value: data.rank || 'Не указан', inline: false },
      { name: '📸 Доказательства(Скриншот последнего повышения + скриншот увольнения).', value: data.proof || 'Не указано', inline: false },
      { name: '⚠️ Уволен после Ban/Warn?', value: data.wasBannedWarned || 'Не указано', inline: false },
      ...(data.wasBannedWarned === 'yes' ? [{ name: '🔗 Одобрение', value: data.approvalLink || 'Не указано', inline: false }] : []),
      ...baseFields
    ];
  }

  if (type === 'transferToFib') {
    return [
      { name: '👤 Имя Фамилия | Статик ID', value: data.fullName || 'Не указано', inline: false },
      { name: '✅ Одобрение Начальства', value: data.approval || 'Не указано', inline: false },
      { name: '📸 Доказательство ранга', value: data.rankProof || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  if (type === 'leave') {
    const fields = [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📋 Тип отпуска', value: data.leaveType === 'OOC' ? 'OOC Отпуск' : 'IC Отпуск', inline: false },
      { name: '🏢 Отдел', value: data.department || 'Не указан', inline: false },
      { name: '📝 Причина', value: data.reason || 'Не указана', inline: false },
      { name: '📅 Начало', value: data.startDate || 'Не указано', inline: false },
      { name: '📅 Конец', value: data.endDate || 'Не указано', inline: false }
    ];

    if (data.screenshot && !data.screenshot.startsWith('https://i.ibb.co/')) {
      fields.push({ name: '🖼️ Скриншот', value: data.screenshot, inline: false });
    }

    fields.push(...baseFields);
    return fields;
  }

  if (type === 'promotion') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📊 С какого - на какой ранг', value: data.rankRange || 'Не указано', inline: false },
      { name: '🔗 Ссылка на одобренный отчет:', value: data.reportLink || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  if (type === 'highrank') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📊 С какого - на какой ранг', value: data.rankRange || 'Не указано', inline: false },
      { name: '🔗 Ссылка на проделанную работу:', value: data.workLink || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  if (type === 'resignation') {
    return [
      { name: '👤 Имя Фамилия + Статик', value: data.fullName || 'Не указано', inline: false },
      { name: '📸 Скриншот профиля в планшете', value: data.screenshot || 'Не указано', inline: false },
      ...baseFields
    ];
  }

  return [...baseFields, ...Object.entries(data).map(([key, value]) => ({ name: key, value: String(value) || 'Не указано', inline: false }))];
}
