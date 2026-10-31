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
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [stats, setStats] = useState(null);

  // Фильтры банов
  const [bannedSearch, setBannedSearch] = useState('');
  const [bannedFilter, setBannedFilter] = useState('all');

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
      loadData(); loadStats();
      fetch('/api/announcement').then(res => res.json()).then(data => {
        if (data.announcement) { setAnnouncement(data.announcement); setAnnouncementText(data.announcement); }
      }).catch(() => {});
    };
    fetchAll();
    const id = setInterval(fetchAll, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

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

  const handleUnban = async (id = userId) => {
    if (!id.trim()) return;
    const res = await fetch('/api/admin/unban', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id }) });
    const data = await res.json();
    setStatus(data.message || data.error);
    loadData(); setUserId('');
  };

  const toggleForms = async () => {
    const res = await fetch('/api/admin/toggle-forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: !formsActive }) });
    const data = await res.json(); setFormsActive(data.formsActive); loadData();
  };

  const toggleFormType = async (type) => {
    const current = formTypes[type] !== false;
    const res = await fetch('/api/admin/toggle-form-type', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, status: !current }) });
    const data = await res.json();
    if (data.type) setFormTypes(prev => ({ ...prev, [data.type]: data.status }));
    loadData();
  };

  const saveAnnouncement = async () => {
    const res = await fetch('/api/announcement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: announcementText }) });
    const data = await res.json(); setAnnouncementMsg(data.message || data.error); setAnnouncement(announcementText.trim());
  };

  const clearAnnouncement = async () => {
    const res = await fetch('/api/announcement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: '' }) });
    const data = await res.json(); setAnnouncementMsg(data.message || data.error); setAnnouncementText(''); setAnnouncement('');
  };

  return (
    <Layout>
      <div className="admin">
        <header className="page-head">
          <div className="ph-stamp">ADMINISTRATIVE ACCESS · LEVEL 5</div>
          <h1 className="ph-title">ПАНЕЛЬ УПРАВЛЕНИЯ<span className="ph-dot">.</span></h1>
          <div className="ph-rule" />
        </header>

        {/* 01. Объявление */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">ГЛОБАЛЬНОЕ УВЕДОМЛЕНИЕ</h2>
            <span className={`p-tag ${announcement ? 'p-tag-on' : ''}`}>{announcement ? 'АКТИВНО' : 'ПУСТО'}</span>
          </div>
          <div className="panel-body">
            <textarea className="field" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} rows="2" placeholder="Текст..." />
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" onClick={saveAnnouncement}>💾 СОХРАНИТЬ</button>
              {announcement && <button className="btn btn-danger" onClick={clearAnnouncement}>✕ УДАЛИТЬ</button>}
            </div>
          </div>
        </section>

        {/* 02. Статистика и Экспорт */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">02</span>
            <h2 className="p-title">СТАТИСТИКА И ЭКСПОРТ</h2>
          </div>
          <div className="panel-body">
            {stats && (
              <div className="stats-grid">
                {[['ВСЕГО', stats.total], ['СЕГОДНЯ', stats.today], ['НЕДЕЛЯ', stats.thisWeek], ['МЕСЯЦ', stats.thisMonth]].map(([l, v]) => (
                  <div key={l} className="stat"><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
                ))}
              </div>
            )}
            <div className="export-grid" style={{ marginTop: 16 }}>
              <a href="/api/admin/export?type=banned" className="btn">⬇ СКАЧАТЬ БАНЫ (CSV)</a>
              <a href="/api/admin/export?type=users" className="btn">⬇ РЕЕСТР ЮЗЕРОВ (CSV)</a>
              <a href="/api/admin/export?type=stats" className="btn">⬇ СТАТИСТИКА (CSV)</a>
              <a href="/api/admin/export?type=audit" className="btn">⬇ АУДИТ (CSV)</a>
            </div>
          </div>
        </section>

        {/* 03. Формы */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">03</span>
            <h2 className="p-title">УПРАВЛЕНИЕ ЗАЯВКАМИ</h2>
            <span className={`p-tag ${formsActive ? 'p-tag-on' : 'p-tag-off'}`}>{formsActive ? 'OPEN' : 'CLOSED'}</span>
          </div>
          <div className="panel-body">
            <button className={`btn btn-wide ${formsActive ? 'btn-danger' : 'btn-success'}`} onClick={toggleForms}>
              {formsActive ? '✕ ОСТАНОВИТЬ ВСЕ ЗАЯВКИ' : '✓ ВОЗОБНОВИТЬ ВСЕ ЗАЯВКИ'}
            </button>
            <div className="sub-block">
              <div className="sub-head"><span className="sub-tag">//</span><span className="sub-title">ОТДЕЛЬНЫЕ ФОРМЫ</span></div>
              {FORM_TOGGLES.map(item => {
                const active = formTypes[item.key] !== false;
                return (
                  <div key={item.key} className="toggle-row">
                    <span className="tr-icon">{item.icon}</span><span className="tr-label">{item.label}</span>
                    <span className={`tr-status ${active ? 'tr-on' : 'tr-off'}`}>{active ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}</span>
                    <button className={`tr-btn ${active ? 'tr-btn-off' : 'tr-btn-on'}`} onClick={() => toggleFormType(item.key)}>{active ? 'ОТКЛЮЧИТЬ' : 'ВКЛЮЧИТЬ'}</button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 04. Реестр банов с фильтрами */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">04</span>
            <h2 className="p-title">РЕЕСТР ЗАБЛОКИРОВАННЫХ</h2>
            <span className="p-tag">{visibleBanned.length} / {bannedUsers.length}</span>
          </div>
          <div className="panel-body">
            <div className="ban-filters">
              <input className="field" type="text" placeholder="Поиск по ID, нику или причине..." value={bannedSearch} onChange={(e) => setBannedSearch(e.target.value)} style={{ marginBottom: 0 }} />
              <select className="field" value={bannedFilter} onChange={(e) => setBannedFilter(e.target.value)} style={{ marginBottom: 0, maxWidth: 200 }}>
                <option value="all">ВСЕ</option><option value="permanent">🔒 НАВСЕГДА</option>
                <option value="temp">⏱ ВРЕМЕННЫЕ</option><option value="admin">👤 РУЧНЫЕ</option>
                <option value="autospam">🤖 AUTOSPAM</option><option value="banword">🤬 BANWORD</option>
              </select>
            </div>

            <div className="banned-list">
              {visibleBanned.length === 0 ? <p className="muted">НИЧЕГО НЕ НАЙДЕНО</p> : visibleBanned.map(user => (
                <div key={user.userId} className="banned-item">
                  <div className="bi-id">
                    <span className="bi-value">{user.userId}</span>
                    {user.username && <span className="bi-user">// {user.username}</span>}
                  </div>
                  <div className="bi-right">
                    {user.permanent && <span className="bi-badge">🔒 НАВСЕГДА</span>}
                    {user.source && user.source !== 'admin' && <span className="bi-source">[{user.source}]</span>}
                    <span className="bi-reason">{user.reason || '—'}</span>
                    <button className="bi-unban" onClick={() => handleUnban(user.userId)} title="Разбанить">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 05. Ручной бан/разбан */}
        <section className="panel panel-danger">
          <div className="panel-head"><span className="p-num">05</span><h2 className="p-title">РУЧНОЕ УПРАВЛЕНИЕ</h2></div>
          <div className="panel-body">
            <label className="lbl">DISCORD ID (ДЛЯ БАНА / РАЗБАНА)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="field" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="123456789012345678" style={{ marginBottom: 0 }} />
              <button className="btn btn-danger" onClick={() => handleUnban()}>РАЗБАНИТЬ</button>
            </div>
            {status && <p className="msg">{status}</p>}
          </div>
        </section>

        <div className="admin-links">
          <a href="/admin/audit" className="btn">📋 ЖУРНАЛ АУДИТА</a>
          <a href="/admin/health" className="btn">🩺 ДИАГНОСТИКА</a>
          <a href="/admin/support" className="btn">✉ ТИКЕТЫ</a>
          <a href="/admin/duplicates" className="btn">👥 МУЛЬТИАККАУНТЫ</a>
        </div>

      </div>
      <style jsx>{`
        .admin { max-width: 980px; margin: 0 auto; color: #eaeaea; padding-bottom: 20px; }
        .page-head { margin-bottom: 24px; }
        .ph-stamp { display: inline-block; padding: 3px 10px; border: 1px solid #333; color: #888; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px; }
        .ph-title { font-size: 42px; font-weight: 900; letter-spacing: 3px; margin: 0; color: #fff; line-height: 1; text-transform: uppercase; }
        .ph-dot { animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0.15; } }
        .ph-rule { height: 1px; background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%); margin: 20px 0 0; }
        .panel { background: #0c0c0c; border: 1px solid #1f1f1f; margin-bottom: 16px; }
        .panel-danger { border-color: #3a1f1f; }
        .panel-head { display: flex; align-items: center; gap: 14px; padding: 12px 18px; border-bottom: 1px solid #1f1f1f; background: #0a0a0a; }
        .p-num { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2px; color: #666; font-weight: 700; }
        .p-title { font-size: 13px; font-weight: 800; letter-spacing: 2.4px; color: #fff; margin: 0; text-transform: uppercase; flex: 1; }
        .p-tag { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 2px; color: #666; border: 1px solid #2a2a2a; padding: 2px 8px; text-transform: uppercase; }
        .p-tag-on { color: #000; background: #fff; border-color: #fff; }
        .p-tag-off { color: #ff8080; border-color: #553030; }
        .panel-body { padding: 18px; }
        .lbl { display: block; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 2px; color: #666; text-transform: uppercase; margin-bottom: 7px; }
        .field { width: 100%; padding: 11px 14px; background: #060606; border: 1px solid #262626; color: #fff; border-radius: 0; font-size: 13.5px; margin-bottom: 16px; font-family: ui-monospace, monospace; box-sizing: border-box; outline: none; }
        .field:focus { border-color: #fff; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; background: transparent; border: 1px solid #333; color: #eaeaea; cursor: pointer; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; transition: all 0.2s ease; text-decoration: none; white-space: nowrap; }
        .btn:hover { background: #fff; border-color: #fff; color: #000; }
        .btn-danger { border-color: #553030; color: #ff8080; }
        .btn-danger:hover { background: #ff4444; color: #fff; border-color: #ff4444; }
        .btn-success { border-color: #2a5a2a; color: #8ee08e; }
        .btn-success:hover { background: #4caf50; color: #fff; border-color: #4caf50; }
        .btn-wide { width: 100%; }
        .row { display: flex; gap: 10px; flex-wrap: wrap; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .stat { background: #060606; border: 1px solid #1f1f1f; padding: 16px 12px; text-align: center; }
        .stat-val { font-size: 24px; font-weight: 900; color: #fff; font-family: ui-monospace, monospace; }
        .stat-lbl { color: #666; font-size: 9px; letter-spacing: 2px; margin-top: 4px; text-transform: uppercase; }
        .export-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .sub-block { margin-top: 20px; padding-top: 16px; border-top: 1px dashed #1f1f1f; }
        .sub-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .sub-tag { font-family: ui-monospace, monospace; font-size: 11px; color: #555; }
        .sub-title { font-family: ui-monospace, monospace; font-size: 10.5px; letter-spacing: 2.4px; color: #ccc; text-transform: uppercase; }
        .toggle-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #060606; border: 1px solid #1a1a1a; margin-bottom: 8px; }
        .tr-icon { font-size: 16px; }
        .tr-label { flex: 1; color: #eaeaea; font-size: 13px; font-weight: 600; }
        .tr-status { font-size: 10px; padding: 3px 9px; border: 1px solid #2a2a2a; text-transform: uppercase; }
        .tr-on { color: #8ee08e; border-color: #2a5a2a; }
        .tr-off { color: #ff8080; border-color: #553030; }
        .tr-btn { padding: 8px 14px; background: transparent; border: 1px solid #333; color: #eaeaea; cursor: pointer; font-family: ui-monospace, monospace; font-size: 10px; text-transform: uppercase; }
        .tr-btn:hover { background: #fff; color: #000; }
        .ban-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .ban-filters .field { flex: 1 1 220px; }
        .banned-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
        .banned-item { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 12px 14px; background: #060606; border: 1px solid #1a1a1a; flex-wrap: wrap; }
        .bi-id { display: flex; align-items: center; gap: 10px; font-family: ui-monospace, monospace; font-size: 12px; }
        .bi-value { color: #fff; font-weight: 700; }
        .bi-user { color: #666; font-size: 11px; }
        .bi-right { display: flex; align-items: center; gap: 10px; justify-content: flex-end; flex: 1; min-width: 180px; }
        .bi-badge { font-family: ui-monospace, monospace; font-size: 9px; color: #ff8080; border: 1px solid #553030; padding: 3px 8px; }
        .bi-source { font-family: ui-monospace, monospace; font-size: 9px; color: #888; border: 1px solid #2a2a2a; padding: 2px 6px; text-transform: uppercase; }
        .bi-reason { color: #b0b0b0; font-size: 12.5px; text-align: right; max-width: 320px; overflow: hidden; text-overflow: ellipsis; }
        .bi-unban { width: 26px; height: 26px; background: transparent; border: 1px solid #553030; color: #ff8080; cursor: pointer; font-size: 12px; transition: all 0.18s; }
        .bi-unban:hover { background: #ff4444; color: #fff; border-color: #ff4444; }
        .msg { margin-top: 12px; color: #4caf50; font-family: ui-monospace, monospace; font-size: 11px; }
        .admin-links { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
        .muted { color: #666; font-family: ui-monospace, monospace; font-size: 11px; text-align: center; letter-spacing: 2px; margin: 20px 0; }
        @media (max-width: 640px) {
          .ph-title { font-size: 26px; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .export-grid { grid-template-columns: 1fr; }
          .toggle-row { flex-wrap: wrap; }
          .tr-label { width: 100%; }
          .tr-btn { width: 100%; }
          .banned-item { flex-direction: column; align-items: flex-start; }
          .bi-right { justify-content: flex-start; flex-wrap: wrap; }
        }
      `}</style>
    </Layout>
  );
}
