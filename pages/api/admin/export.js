import redis, { scanKeys } from '../../../lib/redis';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';
import { getAllBannedUsers } from '../../../lib/blacklist';

function toCsv(rows, columns) {
  const escape = (v) => {
    const s = String(v ?? '');
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(',')).join('\r\n');
  return '\uFEFF' + header + '\r\n' + body; // BOM — для Excel с кириллицей
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.cookies.token);
  if (!user || !ADMIN_IDS.includes(user.id)) return res.status(403).json({ error: 'Нет доступа' });

  const type = String(req.query.type || 'banned');
  const dateTag = new Date().toISOString().slice(0, 10);

  try {
    let data, columns, filename;

    if (type === 'banned') {
      const users = await getAllBannedUsers();
      data = users.map((u) => ({
        userId: u.userId,
        username: u.username || '',
        reason: u.reason || '',
        permanent: u.permanent ? 'yes' : 'no',
        source: u.source || '',
        date: u.timestamp ? new Date(u.timestamp).toISOString() : '',
      }));
      columns = ['userId', 'username', 'reason', 'permanent', 'source', 'date'];
      filename = `fib-banned-${dateTag}.csv`;

    } else if (type === 'users') {
      const keys = await scanKeys('nickname:*');
      if (!keys.length) {
        data = [];
        columns = ['userId', 'username', 'nickname', 'department', 'rank', 'banned'];
      } else {
        const ids = keys.map((k) => k.replace('nickname:', ''));
        const pipeline = redis.pipeline();
        for (const id of ids) {
          pipeline.get(`nickname:${id}`);
          pipeline.get(`username:${id}`);
          pipeline.get(`department:${id}`);
          pipeline.get(`rank:${id}`);
          pipeline.exists(`blacklist:${id}`);
        }
        const results = await pipeline.exec();
        data = ids.map((id, i) => {
          const b = i * 5;
          return {
            userId: id,
            username: results[b + 1]?.[1] || '',
            nickname: results[b + 0]?.[1] || '',
            department: results[b + 2]?.[1] || '',
            rank: results[b + 3]?.[1] || '',
            banned: results[b + 4]?.[1] ? 'yes' : 'no',
          };
        });
        columns = ['userId', 'username', 'nickname', 'department', 'rank', 'banned'];
      }
      filename = `fib-users-${dateTag}.csv`;

    } else if (type === 'audit') {
      const raw = await redis.zrevrange('admin:audit', 0, 999);
      data = raw.map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
      columns = ['at', 'adminUsername', 'adminId', 'action', 'targetId', 'targetUsername', 'reason'];
      filename = `fib-audit-${dateTag}.csv`;

    } else if (type === 'stats') {
      const total = parseInt(await redis.get('stats:total') || '0', 10);
      const typeKeys = await scanKeys('stats:type:*');
      data = [];
      for (const key of typeKeys) {
        const t = key.replace('stats:type:', '');
        const count = parseInt(await redis.get(key) || '0', 10);
        data.push({ type: t, count });
      }
      data.push({ type: 'TOTAL', count: total });
      columns = ['type', 'count'];
      filename = `fib-stats-${dateTag}.csv`;

    } else {
      return res.status(400).json({ error: 'Неизвестный тип: banned | users | audit | stats' });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(toCsv(data, columns));
  } catch (e) {
    console.error('[export] error:', e.message);
    return res.status(500).json({ error: 'Ошибка экспорта' });
  }
}
