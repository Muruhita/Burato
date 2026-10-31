import Layout from '../../components/Layout';
import { useState, useEffect, useMemo } from 'react';

const ACTION_LABELS = {
  ban: { icon: '🚫', label: 'Бан', color: '#ff8080' },
  permanent_ban: { icon: '🔒', label: 'Перманентный бан', color: '#ff4444' },
  unban: { icon: '🔓', label: 'Разбан', color: '#8ee08e' },
  toggle_forms_off: { icon: '⏸', label: 'Заявки остановлены', color: '#ffaa33' },
  toggle_forms_on: { icon: '▶️', label: 'Заявки возобновлены', color: '#8ee08e' },
  save_announcement: { icon: '📢', label: 'Объявление обновлено', color: '#88ddff' },
  clear_announcement: { icon: '🗑', label: 'Объявление удалено', color: '#888' },
};

export default function AdminAudit() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/audit?limit=500')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim();
    return items.filter(it => {
      if (actionFilter !== 'all' && it.action !== actionFilter) return false;
      if (!q) return true;
      const hay = `${it.adminUsername} ${it.adminId} ${it.targetId} ${it.targetUsername} ${it.reason}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, filter, actionFilter]);

  const availableActions = useMemo(() => {
    const set = new Set();
    for (const it of items) set.add(it.action);
    return Array.from(set).sort();
  }, [items]);

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">OPS · AUDIT TRAIL</div>
          <h1 className="ph-title">ЖУРНАЛ ДЕЙСТВИЙ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">История действий администраторов · {items.length} записей</p>
          <div className="ph-rule" />
        </header>

        <div className="filters">
          <input
            className="search-input"
            type="text"
            placeholder="Поиск по нику, ID, причине..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">ВСЕ ДЕЙСТВИЯ</option>
            {availableActions.map(a => (
              <option key={a} value={a}>{ACTION_LABELS[a]?.label || a}</option>
            ))}
          </select>
          <a href="/api/admin/export?type=audit" className="export-btn">⬇ CSV</a>
        </div>

        {loading ? (
          <div className="panel"><div className="panel-body center"><p className="muted">ЗАГРУЗКА...</p></div></div>
        ) : filtered.length === 0 ? (
          <div className="panel"><div className="panel-body center"><p className="muted">ПУСТО</p></div></div>
        ) : (
          <div className="audit-list">
            {filtered.map((it, i) => {
              const label = ACTION_LABELS[it.action] || { icon: '•', label: it.action, color: '#ccc' };
              return (
                <div key={i} className="audit-row">
                  <span className="ar-icon" style={{ color: label.color }}>{label.icon}</span>
                  <div className="ar-main">
                    <div className="ar-title" style={{ color: label.color }}>{label.label}</div>
                    <div className="ar-meta">
                      <strong>{it.adminUsername || it.adminId}</strong>
                      {it.targetId && <> → <strong>{it.targetUsername || it.targetId}</strong></>}
                    </div>
                    {it.reason && <div className="ar-reason">{it.reason}</div>}
                  </div>
                  <span className="ar-time">
                    {new Date(it.at).toLocaleString('ru-RU', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .info { max-width: 900px; margin: 0 auto; }
        .page-head { margin-bottom: 22px; }
        .ph-stamp {
          display: inline-block; padding: 3px 10px; border: 1px solid #333;
          color: #888; font-family: ui-monospace, monospace; font-size: 10px;
          letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px;
        }
        .ph-title {
          font-size: 42px; font-weight: 900; letter-spacing: 3px; margin: 0;
          color: #fff; line-height: 1; text-transform: uppercase;
        }
        .ph-dot { animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0.15; } }
        .ph-sub { color: #888; font-size: 13px; margin: 12px 0 0; }
        .ph-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 0;
        }

        .filters {
          display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;
        }
        .search-input {
          flex: 1 1 220px; padding: 10px 14px;
          background: #060606; border: 1px solid #262626;
          color: #fff; font-size: 13.5px; outline: none;
        }
        .search-input:focus { border-color: #fff; }
        .filter-select {
          padding: 10px 30px 10px 12px; background: #060606; border: 1px solid #262626;
          color: #fff; font-family: ui-monospace, monospace; font-size: 11px;
          letter-spacing: 1.4px; text-transform: uppercase; cursor: pointer;
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #666 50%),
                            linear-gradient(135deg, #666 50%, transparent 50%);
          background-position: calc(100% - 16px) center, calc(100% - 11px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
        }
        .filter-select:focus { border-color: #fff; }
        .filter-select option { background: #0c0c0c; color: #fff; }
        .export-btn {
          padding: 10px 14px;
          background: transparent; border: 1px solid #333; color: #ccc;
          text-decoration: none; font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .export-btn:hover { background: #fff; border-color: #fff; color: #000; }

        .panel { background: #0c0c0c; border: 1px solid #1f1f1f; }
        .panel-body.center { padding: 60px 20px; text-align: center; }
        .muted { color: #666; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2.4px; }

        .audit-list { display: flex; flex-direction: column; gap: 6px; }
        .audit-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 16px; background: #0c0c0c; border: 1px solid #1a1a1a;
          animation: rowIn 0.3s ease;
        }
        @keyframes rowIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .ar-icon { font-size: 18px; line-height: 1; flex-shrink: 0; padding-top: 2px; }
        .ar-main { flex: 1; min-width: 0; }
        .ar-title {
          font-family: ui-monospace, monospace; font-size: 11px;
          letter-spacing: 1.6px; text-transform: uppercase; font-weight: 800;
          margin-bottom: 4px;
        }
        .ar-meta {
          font-size: 12px; color: #ccc;
        }
        .ar-meta strong { color: #fff; }
        .ar-reason {
          font-size: 12px; color: #888; font-style: italic;
          margin-top: 4px; line-height: 1.5;
        }
        .ar-time {
          font-family: ui-monospace, monospace; font-size: 10.5px;
          color: #555; flex-shrink: 0; white-space: nowrap;
        }

        @media (max-width: 640px) {
          .ph-title { font-size: 28px; letter-spacing: 2px; }
          .audit-row { flex-wrap: wrap; }
          .ar-time { width: 100%; text-align: right; }
        }
      `}</style>
    </Layout>
  );
}
