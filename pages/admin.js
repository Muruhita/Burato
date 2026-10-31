import Layout from '../components/Layout';
import { useState, useEffect, useMemo } from 'react';

const FORM_TOGGLES = [
  { key: 'db', label: 'Запрос на ДБ', icon: '📅' },
  { key: 'ukmb', label: 'Запрос на УКМБ', icon: '🎓' },
];

export default function AdminPanel() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [formsActive, setFormsActive] = useState(true);
  const [formTypes, setFormTypes] = useState({});
  const [status, setStatus] = useState('');
  
  // Announcement
  const [announcement, setAnnouncement] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Banned Filters
  const [bannedSearch, setBannedSearch] = useState('');
  const [bannedFilter, setBannedFilter] = useState('all');

  // Ban Form
  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banPermanent, setBanPermanent] = useState(false);
  const [banMsg, setBanMsg] = useState('');

  // Unban Form
  const [unbanUserId, setUnbanUserId] = useState('');

  const loadData = async () => {
    const res = await fetch('/api/admin/list');
    const data = await res.json();
    setBannedUsers(data.bannedUsers || []);
    setFormsActive(data.formsActive);
    setFormTypes(data.formTypes || {});
  };

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.total !== undefined) setStats(data);
  };

  useEffect(() => {
    const fetchAll = () => {
      loadData();
      loadStats();
      fetch('/api/announcement')
        .then(res => res.json())
        .then(data => {
          if (data.announcement) {
            setAnnouncement(data.announcement);
            setAnnouncementText(data.announcement);
          }
        })
        .catch(() => {});
    };
    fetchAll();
    const id = setInterval(fetchAll, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Фильтрация банов ───
  const visibleBanned = useMemo(() => {
    return bannedUsers.filter(u => {
      if (bannedFilter === 'permanent' && !u.permanent) return false;
      if (bannedFilter === 'temp' && u.permanent) return false;
      if (['admin','autospam','banword'].includes(bannedFilter) && u.source !== bannedFilter) return false;
      const q = bannedSearch.toLowerCase().trim();
      if (!q) return true;
      const hay = `${u.userId} ${u.username || ''} ${u.reason || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [bannedUsers, bannedFilter, bannedSearch]);

  const handleBan = async () => {
    if (!banUserId.trim()) { setBanMsg('⚠️ Введите Discord ID'); return; }
    const res = await fetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: banUserId,
        reason: banReason,
        username: 'Админ',
        permanent: banPermanent
      })
    });
    const data = await res.json();
    setBanMsg(data.message || data.error);
    loadData();
    setBanUserId('');
    setBanReason('');
    setBanPermanent(false);
  };

  const handleUnban = async (id = unbanUserId) => {
    if (!id.trim()) return;
    const res = await fetch('/api/admin/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
    loadData();
    setUnbanUserId('');
  };

  const toggleForms = async () => {
    const res = await fetch('/api/admin/toggle-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: !formsActive })
    });
    const data = await res.json();
    setFormsActive(data.formsActive);
    loadData();
  };

  const toggleFormType = async (type) => {
    const current = formTypes[type] !== false;
    const res = await fetch('/api/admin/toggle-form-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, status: !current })
    });
    const data = await res.json();
    if (data.type) {
      setFormTypes(prev => ({ ...prev, [data.type]: data.status }));
    }
    loadData();
  };

  const saveAnnouncement = async () => {
    const res = await fetch('/api/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: announcementText })
    });
    const data = await res.json();
    setAnnouncementMsg(data.message || data.error);
    setAnnouncement(announcementText.trim());
  };

  const clearAnnouncement = async () => {
    const res = await fetch('/api/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });
    const data = await res.json();
    setAnnouncementMsg(data.message || data.error);
    setAnnouncementText('');
    setAnnouncement('');
  };

  return (
    <Layout>
      <div className="admin">
        <header className="page-head">
          <div className="ph-stamp">ADMINISTRATIVE ACCESS · LEVEL 5</div>
          <h1 className="ph-title">ПАНЕЛЬ УПРАВЛЕНИЯ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Служебный интерфейс администратора · Все действия фиксируются в логах</p>
          <div className="ph-rule" />
        </header>

        {/* 01. ОБЪЯВЛЕНИЕ */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">ГЛОБАЛЬНОЕ УВЕДОМЛЕНИЕ</h2>
            <span className={`p-tag ${announcement ? 'p-tag-on' : ''}`}>
              {announcement ? 'АКТИВНО' : 'ПУСТО'}
            </span>
          </div>
          <div className="panel-body">
            <label className="lbl">ТЕКСТ ОБЪЯВЛЕНИЯ</label>
            <textarea
              className="field"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              rows="3"
              placeholder="Например: Завтра формы закрыты с 12:00 до 14:00"
            />
            <div className="row">
              <button className="btn" onClick={saveAnnouncement}>💾 СОХРАНИТЬ</button>
              {announcement && (
                <button className="btn btn-danger" onClick={clearAnnouncement}>✕ УДАЛИТЬ</button>
              )}
            </div>
            {announcementMsg && <p className="msg">{announcementMsg}</p>}
          </div>
        </section>

        {/* 02. СТАТИСТИКА И ЭКСПОРТ */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">02</span>
            <h2 className="p-title">СТАТИСТИКА ЗАЯВОК</h2>
            <span className="p-tag">LIVE & EXPORT</span>
          </div>
          <div className="panel-body">
            {stats ? (
              <>
                <div className="stats-grid">
                  {[
                    ['ВСЕГО', stats.total],
                    ['СЕГОДНЯ', stats.today],
                    ['ЗА НЕДЕЛЮ', stats.thisWeek],
                    ['ЗА МЕСЯЦ', stats.thisMonth],
                    ['ЮЗЕРОВ', stats.activeUsers],
                  ].map(([label, value]) => (
                    <div key={label} className="stat">
                      <div className="stat-val">{value}</div>
                      <div className="stat-lbl">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="export-grid" style={{ marginTop: 20 }}>
                  <a href="/api/admin/export?type=banned" className="btn">⬇ СКАЧАТЬ БАНЫ (CSV)</a>
                  <a href="/api/admin/export?type=users" className="btn">⬇ РЕЕСТР ЮЗЕРОВ (CSV)</a>
                  <a href="/api/admin/export?type=stats" className="btn">⬇ СТАТИСТИКА (CSV)</a>
                  <a href="/api/admin/export?type=audit" className="btn">⬇ АУДИТ (CSV)</a>
                </div>
              </>
            ) : (
              <p className="muted">ЗАГРУЗКА ДАННЫХ...</p>
            )}
          </div>
        </section>

        {/* 03. УПРАВЛЕНИЕ ЗАЯВКАМИ */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">03</span>
            <h2 className="p-title">УПРАВЛЕНИЕ ЗАЯВКАМИ</h2>
            <span className={`p-tag ${formsActive ? 'p-tag-on' : 'p-tag-off'}`}>
              {formsActive ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="panel-body">
            <div className="state-row">
              <span className="state-label">ГЛОБАЛЬНЫЙ СТАТУС:</span>
              <span className={`state-value ${formsActive ? 'sv-on' : 'sv-off'}`}>
                {formsActive ? '🟢 ВСЕ ЗАЯВКИ ОТКРЫТЫ' : '🔴 ВСЕ ЗАЯВКИ ОСТАНОВЛЕНЫ'}
              </span>
            </div>
            <button
              className={`btn btn-wide ${formsActive ? 'btn-danger' : 'btn-success'}`}
              onClick={toggleForms}
            >
              {formsActive ? '✕ ОСТАНОВИТЬ ВСЕ ЗАЯВКИ' : '✓ ВОЗОБНОВИТЬ ВСЕ ЗАЯВКИ'}
            </button>

            <div className="sub-block">
              <div className="sub-head">
                <span className="sub-tag">//</span>
                <span className="sub-title">ОТДЕЛЬНЫЕ ФОРМЫ</span>
              </div>

              {FORM_TOGGLES.map(item => {
                const active = formTypes[item.key] !== false;
                return (
                  <div key={item.key} className="toggle-row">
                    <span className="tr-icon">{item.icon}</span>
                    <span className="tr-label">{item.label}</span>
                    <span className={`tr-status ${active ? 'tr-on' : 'tr-off'}`}>
                      {active ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}
                    </span>
                    <button
                      className={`tr-btn ${active ? 'tr-btn-off' : 'tr-btn-on'}`}
                      onClick={() => toggleFormType(item.key)}
                    >
                      {active ? 'ОТКЛЮЧИТЬ' : 'ВКЛЮЧИТЬ'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 04. ЗАБЛОКИРОВАТЬ ПОЛЬЗОВАТЕЛЯ */}
        <section className="panel panel-danger">
          <div className="panel-head">
            <span className="p-num">04</span>
            <h2 className="p-title">ЗАБЛОКИРОВАТЬ ПОЛЬЗОВАТЕЛЯ</h2>
            <span className="p-tag p-tag-danger">RESTRICT</span>
          </div>
          <div className="panel-body">
            <label className="lbl">DISCORD ID</label>
            <input className="field" type="text" value={banUserId}
              onChange={(e) => setBanUserId(e.target.value)} placeholder="Например: 123456789012345678" />

            <label className="lbl">ПРИЧИНА (НЕОБЯЗАТЕЛЬНО)</label>
            <input className="field" type="text" value={banReason}
              onChange={(e) => setBanReason(e.target.value)} placeholder="Например: нарушение правил" />

            <label className="check">
              <input type="checkbox" checked={banPermanent}
                onChange={(e) => setBanPermanent(e.target.checked)} />
              <span className="check-box" />
              <span className="check-text">🔒 ЗАБАНИТЬ НАВСЕГДА (БЕЗ СРОКА)</span>
            </label>

            <button className="btn btn-danger btn-wide" onClick={handleBan}>
              {banPermanent ? '🔒 ЗАБАНИТЬ НАВСЕГДА' : '⏱ ЗАБЛОКИРОВАТЬ · 7 ДНЕЙ'}
            </button>
            {banMsg && <p className="msg">{banMsg}</p>}
          </div>
        </section>

        {/* 05. РАЗБЛОКИРОВАТЬ ПОЛЬЗОВАТЕЛЯ */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">05</span>
            <h2 className="p-title">РАЗБЛОКИРОВАТЬ ПОЛЬЗОВАТЕЛЯ</h2>
            <span className="p-tag">UNLOCK</span>
          </div>
          <div className="panel-body">
            <label className="lbl">DISCORD ID</label>
            <input className="field" type="text" value={unbanUserId}
              onChange={(e) => setUnbanUserId(e.target.value)} placeholder="ID ранее заблокированного пользователя" />
            <button className="btn btn-solid btn-wide" onClick={() => handleUnban()}>
              ✓ СНЯТЬ БЛОКИРОВКУ
            </button>
            {status && <p className="msg">{status}</p>}
          </div>
        </section>

        {/* 06. РЕЕСТР ЗАБЛОКИРОВАННЫХ */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">06</span>
            <h2 className="p-title">РЕЕСТР ЗАБЛОКИРОВАННЫХ</h2>
            <span className="p-tag">{visibleBanned.length} / {bannedUsers.length}</span>
          </div>
          <div className="panel-body">
            {bannedUsers.length > 0 && (
              <div className="ban-filters">
                <input
                  className="field"
                  type="text"
                  placeholder="Поиск по ID, нику или причине..."
                  value={bannedSearch}
                  onChange={(e) => setBannedSearch(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
                <select
                  className="field"
                  value={bannedFilter}
                  onChange={(e) => setBannedFilter(e.target.value)}
                  style={{ marginBottom: 0, maxWidth: 220 }}
                >
                  <option value="all">ВСЕ</option>
                  <option value="permanent">🔒 НАВСЕГДА</option>
                  <option value="temp">⏱ ВРЕМЕННЫЕ</option>
                  <option value="admin">👤 РУЧНЫЕ</option>
                  <option value="autospam">🤖 AUTOSPAM</option>
                  <option value="banword">🤬 BANWORD</option>
                </select>
                <a href="/api/admin/export?type=banned" className="btn">⬇ CSV</a>
              </div>
            )}

            {bannedUsers.length === 0 ? (
              <p className="muted">РЕЕСТР ПУСТ</p>
            ) : visibleBanned.length === 0 ? (
              <p className="muted">НИЧЕГО НЕ НАЙДЕНО</p>
            ) : (
              <div className="banned-list">
                {visibleBanned.map(user => (
                  <div key={user.userId} className="banned-item">
                    <div className="bi-id">
                      <span className="bi-label">ID</span>
                      <span className="bi-value">{user.userId}</span>
                      {user.username && <span className="bi-user">// {user.username}</span>}
                    </div>
                    <div className="bi-right">
                      {user.permanent && <span className="bi-badge">🔒 НАВСЕГДА</span>}
                      {user.source && user.source !== 'admin' && (
                        <span className="bi-source">[{user.source}]</span>
                      )}
                      <span className="bi-reason">{user.reason || '—'}</span>
                      <button
                        className="bi-unban"
                        onClick={() => {
                          if(confirm(`Разбанить ${user.userId}?`)) handleUnban(user.userId);
                        }}
                        title="Разбанить"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 07. ССЫЛКИ НА ДРУГИЕ РАЗДЕЛЫ */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">07</span>
            <h2 className="p-title">СЛУЖЕБНЫЕ ИНСТРУМЕНТЫ</h2>
          </div>
          <div className="panel-body">
            <div className="admin-links">
              <a href="/admin/audit" className="btn">📋 ЖУРНАЛ АУДИТА</a>
              <a href="/admin/health" className="btn">🩺 ДИАГНОСТИКА</a>
              <a href="/admin/support" className="btn">✉ ТИКЕТЫ (Поддержка)</a>
              <a href="/admin/duplicates" className="btn">👥 МУЛЬТИАККАУНТЫ</a>
            </div>
          </div>
        </section>

      </div>

      <style jsx>{`
        .admin { max-width: 980px; margin: 0 auto; color: #eaeaea; padding-bottom: 20px; }
        .page-head { margin-bottom: 30px; }
        .ph-stamp { display: inline-block; padding: 3px 10px; border: 1px solid #333; color: #888; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px; background: rgba(255,255,255,0.02); }
        .ph-title { font-size: 42px; font-weight: 900; letter-spacing: 3px; margin: 0; color: #fff; line-height: 1; text-transform: uppercase; }
        .ph-dot { color: #fff; animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0.15; } }
        .ph-sub { color: #888; font-size: 13px; margin: 12px 0 0; }
        .ph-rule { height: 1px; background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%); margin: 20px 0 0; }
        
        .panel { background: #0c0c0c; border: 1px solid #1f1f1f; margin-bottom: 16px; }
        .panel-danger { border-color: #3a1f1f; }
        .panel-head { display: flex; align-items: center; gap: 14px; padding: 12px 18px; border-bottom: 1px solid #1f1f1f; background: #0a0a0a; }
        .panel-danger .panel-head { border-bottom-color: #3a1f1f; }
        .p-num { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2px; color: #666; font-weight: 700; }
        .p-title { font-size: 13px; font-weight: 800; letter-spacing: 2.4px; color: #fff; margin: 0; text-transform: uppercase; flex: 1; }
        .p-tag { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 2px; color: #666; border: 1px solid #2a2a2a; padding: 2px 8px; text-transform: uppercase; }
        .p-tag-on { color: #000; background: #fff; border-color: #fff; }
        .p-tag-off, .p-tag-danger { color: #ff8080; border-color: #553030; }
        
        .panel-body { padding: 18px; }
        .lbl { display: block; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 2px; color: #666; text-transform: uppercase; margin-bottom: 7px; }
        .field { width: 100%; padding: 11px 14px; background: #060606; border: 1px solid #262626; color: #fff; border-radius: 0; font-size: 13.5px; margin-bottom: 16px; font-family: ui-monospace, monospace; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
        .field:focus { border-color: #fff; }
        textarea.field { resize: vertical; min-height: 70px; font-family: inherit; }
        
        .check { display: flex; align-items: center; gap: 10px; margin: 4px 0 16px; cursor: pointer; user-select: none; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 1.4px; color: #ccc; }
        .check input { display: none; }
        .check-box { width: 16px; height: 16px; border: 1px solid #444; background: #060606; display: inline-flex; align-items: center; justify-content: center; transition: all 0.18s; flex-shrink: 0; position: relative; }
        .check-box::after { content: ''; width: 8px; height: 8px; background: #fff; transform: scale(0); transition: transform 0.15s; }
        .check input:checked + .check-box { border-color: #fff; }
        .check input:checked + .check-box::after { transform: scale(1); }
        .check-text { color: #eaeaea; }
        
        .row { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; background: transparent; border: 1px solid #333; color: #eaeaea; cursor: pointer; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; transition: all 0.2s ease; white-space: nowrap; text-decoration: none; }
        .btn:hover { background: #fff; border-color: #fff; color: #000; }
        .btn-solid { background: #fff; border-color: #fff; color: #000; font-weight: 700; }
        .btn-solid:hover { background: #ccc; border-color: #ccc; }
        .btn-danger { border-color: #553030; color: #ff8080; }
        .btn-danger:hover { background: #ff4444; border-color: #ff4444; color: #fff; }
        .btn-success { border-color: #2a5a2a; color: #8ee08e; }
        .btn-success:hover { background: #4caf50; border-color: #4caf50; color: #fff; }
        .btn-wide { width: 100%; }
        .msg { margin-top: 12px; color: #4caf50; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 1px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .stat { background: #060606; border: 1px solid #1f1f1f; padding: 16px 12px; text-align: center; }
        .stat-val { font-size: 28px; font-weight: 900; color: #fff; font-family: ui-monospace, monospace; line-height: 1; }
        .stat-lbl { color: #666; font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 2px; margin-top: 8px; text-transform: uppercase; }
        
        .export-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media (max-width: 500px) { .export-grid { grid-template-columns: 1fr; } }

        .state-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 1.6px; }
        .state-label { color: #666; }
        .state-value { padding: 5px 12px; border: 1px solid #2a2a2a; }
        .sv-on { color: #8ee08e; border-color: #2a5a2a; }
        .sv-off { color: #ff8080; border-color: #553030; }
        
        .sub-block { margin-top: 24px; padding-top: 20px; border-top: 1px dashed #1f1f1f; }
        .sub-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .sub-tag { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2px; color: #555; }
        .sub-title { font-family: ui-monospace, monospace; font-size: 10.5px; letter-spacing: 2.4px; color: #ccc; text-transform: uppercase; }
        
        .toggle-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #060606; border: 1px solid #1a1a1a; margin-bottom: 8px; font-family: ui-monospace, monospace; font-size: 12px; transition: border-color 0.18s; }
        .toggle-row:hover { border-color: #333; }
        .tr-icon { font-size: 16px; line-height: 1; }
        .tr-label { flex: 1; color: #eaeaea; font-size: 13px; font-family: -apple-system, sans-serif; font-weight: 600; letter-spacing: 0.3px; }
        .tr-status { font-size: 10px; letter-spacing: 1.8px; padding: 3px 9px; border: 1px solid #2a2a2a; text-transform: uppercase; }
        .tr-on { color: #8ee08e; border-color: #2a5a2a; }
        .tr-off { color: #ff8080; border-color: #553030; }
        .tr-btn { padding: 8px 14px; background: transparent; border: 1px solid #333; color: #eaeaea; cursor: pointer; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 1.8px; text-transform: uppercase; transition: all 0.18s; flex-shrink: 0; }
        .tr-btn:hover { background: #fff; color: #000; border-color: #fff; }
        .tr-btn-off:hover { background: #ff4444; color: #fff; border-color: #ff4444; }
        .tr-btn-on:hover { background: #4caf50; color: #fff; border-color: #4caf50; }
        
        .ban-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .ban-filters .field { flex: 1 1 220px; }
        .banned-list { display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; padding-right: 4px; }
        .banned-item { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 12px 14px; background: #060606; border: 1px solid #1a1a1a; flex-wrap: wrap; }
        .bi-id { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-family: ui-monospace, monospace; font-size: 12px; }
        .bi-label { font-size: 9px; letter-spacing: 2px; color: #555; }
        .bi-value { color: #fff; font-weight: 700; letter-spacing: 0.5px; }
        .bi-user { color: #666; font-size: 11px; }
        .bi-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; flex: 1; min-width: 180px; }
        .bi-badge { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 1.6px; color: #ff8080; border: 1px solid #553030; padding: 3px 8px; text-transform: uppercase; }
        .bi-source { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 1.4px; color: #888; border: 1px solid #2a2a2a; padding: 2px 6px; text-transform: uppercase; }
        .bi-reason { color: #b0b0b0; font-size: 12.5px; text-align: right; max-width: 320px; overflow: hidden; text-overflow: ellipsis; }
        .bi-unban { width: 26px; height: 26px; background: transparent; border: 1px solid #553030; color: #ff8080; cursor: pointer; font-size: 12px; transition: all 0.18s; flex-shrink: 0; }
        .bi-unban:hover { background: #ff4444; border-color: #ff4444; color: #fff; }

        .admin-links { display: flex; gap: 10px; flex-wrap: wrap; }
        
        @media (max-width: 640px) {
          .ph-title { font-size: 26px; letter-spacing: 2px; }
          .panel-head { flex-wrap: wrap; gap: 8px; padding: 10px 14px; }
          .panel-body { padding: 14px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .banned-item { flex-direction: column; align-items: flex-start; }
          .bi-right { justify-content: flex-start; }
          .bi-reason { text-align: left; }
          .toggle-row { flex-wrap: wrap; gap: 8px; padding: 10px 12px; }
          .tr-label { width: 100%; flex: none; }
          .tr-btn { width: 100%; }
        }
      `}</style>
    </Layout>
  );
}
