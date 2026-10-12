import Layout from '../components/Layout';
import { useState, useEffect, useMemo } from 'react';
import { getRankLabel, getRankShort } from '../lib/ranks';

const DEPT_SHORT = {
  ib: 'IB', cid: 'CID', fa: 'FA', hrt: 'HRT',
  atf: 'ATF', af: 'AF', ocu: 'OCU', dea: 'DEA',
  fna: 'FNA', nsb: 'NSB', trainee: 'TR',
  director: 'DIR', cod: 'COD', assh: 'ASS'
};

const SORT_OPTIONS = [
  { id: 'nick-asc',  label: 'НИК ↑' },
  { id: 'nick-desc', label: 'НИК ↓' },
  { id: 'dept-asc',  label: 'ОТДЕЛ ↑' },
  { id: 'dept-desc', label: 'ОТДЕЛ ↓' },
  { id: 'rank-desc', label: 'РАНГ ↓' },
  { id: 'rank-asc',  label: 'РАНГ ↑' },
  { id: 'status',    label: 'СТАТУС' },
];

export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortBy, setSortBy] = useState('nick-asc');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const availableDepts = useMemo(() => {
    const set = new Set();
    users.forEach(u => { if (u.department) set.add(u.department); });
    return Array.from(set).sort();
  }, [users]);

  const rankValue = (r) => {
    if (!r) return -1;
    if (r === 'director') return 100;
    const n = parseInt(r);
    return isNaN(n) ? -1 : n;
  };

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = users.filter(u => {
      if (deptFilter && u.department !== deptFilter) return false;
      if (!q) return true;
      const haystack = `${u.nickname || ''} ${u.username || ''} ${u.userId || ''}`.toLowerCase();
      return haystack.includes(q);
    });

    const deptName = (id) => DEPT_SHORT[id] || id || '';

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'nick-asc':
          return (a.nickname || '').localeCompare(b.nickname || '', 'ru');
        case 'nick-desc':
          return (b.nickname || '').localeCompare(a.nickname || '', 'ru');
        case 'dept-asc':
          return deptName(a.department).localeCompare(deptName(b.department));
        case 'dept-desc':
          return deptName(b.department).localeCompare(deptName(a.department));
        case 'rank-desc':
          return rankValue(b.rank) - rankValue(a.rank);
        case 'rank-asc':
          return rankValue(a.rank) - rankValue(b.rank);
        case 'status':
          if (a.banned === b.banned) return (a.nickname || '').localeCompare(b.nickname || '', 'ru');
          return a.banned ? 1 : -1;
        default:
          return 0;
      }
    });

    return list;
  }, [users, search, deptFilter, sortBy]);

  const hasFilters = search.trim() || deptFilter || sortBy !== 'nick-asc';

  const resetFilters = () => {
    setSearch('');
    setDeptFilter('');
    setSortBy('nick-asc');
  };

  if (loading) {
    return <Layout><div className="loading-line">ЗАГРУЗКА РЕЕСТРА...</div></Layout>;
  }

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">ROSTER · PERSONNEL FILE</div>
          <h1 className="ph-title">ЛИЧНЫЙ СОСТАВ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">
            Реестр зарегистрированных сотрудников FIB Forms · {users.length} записей
          </p>
          <div className="ph-rule" />
        </header>

        {users.length > 0 && (
          <section className="filters">
            <div className="filter-row">
              <div className="search-wrap">
                <span className="search-icon">⌕</span>
                <input
                  className="search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по нику, юзернейму или Discord ID..."
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')} title="Очистить">✕</button>
                )}
              </div>

              <select
                className="filter-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">ВСЕ ОТДЕЛЫ</option>
                {availableDepts.map(d => (
                  <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>

              {hasFilters && (
                <button className="filter-reset" onClick={resetFilters}>✕ СБРОС</button>
              )}
            </div>

            <div className="filter-meta">
              <span className="fm-found">
                НАЙДЕНО: <strong>{visibleUsers.length}</strong> / {users.length}
              </span>
              {deptFilter && <span className="fm-chip">ОТДЕЛ: {DEPT_SHORT[deptFilter] || deptFilter}</span>}
              {search && <span className="fm-chip">ПОИСК: «{search}»</span>}
            </div>
          </section>
        )}

        {users.length === 0 ? (
          <section className="panel">
            <div className="panel-body center">
              <div className="empty-icon">//</div>
              <p className="muted">РЕЕСТР ПУСТ</p>
            </div>
          </section>
        ) : visibleUsers.length === 0 ? (
          <section className="panel">
            <div className="panel-body center">
              <div className="empty-icon">//</div>
              <p className="muted">НИЧЕГО НЕ НАЙДЕНО</p>
              <button className="empty-reset" onClick={resetFilters}>СБРОСИТЬ ФИЛЬТРЫ</button>
            </div>
          </section>
        ) : (
          <div className="roster">
            {visibleUsers.map((user, i) => {
              const hasCustomImage = user.profileCustom?.type === 'image' && user.profileCustom?.url;
              const presetId = user.profileCustom?.type === 'preset' ? user.profileCustom.presetId : null;
              const dept = DEPT_SHORT[user.department] || user.department || '—';
              const rankLabel = getRankLabel(user.rank);
              const rankShort = getRankShort(user.rank);

              let cardClass = 'member';
              if (presetId && presetId !== 'default') cardClass += ` member-preset-${presetId}`;

              return (
                <article
                  key={user.userId}
                  className={cardClass}
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  {hasCustomImage && (
                    <div
                      className="member-bg"
                      style={{ backgroundImage: `url(${user.profileCustom.url})` }}
                    />
                  )}

                  {rankShort && (
                    <span className="member-rank" title={rankLabel || ''}>
                      {rankShort}
                    </span>
                  )}

                  <div className="member-inner">
                    <div className="member-avatar">
                      {user.avatar ? (
                        <img
                          src={`https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png`}
                          alt=""
                        />
                      ) : (
                        <div className="member-avatar-empty">?</div>
                      )}
                    </div>

                    <div className="member-info">
                      <div className="member-nick">
                        {user.nickname || 'Не указан'}
                      </div>
                      <div className="member-user">
                        @{user.username || 'unknown'}
                      </div>
                      {rankLabel && (
                        <div className="member-rank-line">{rankLabel}</div>
                      )}
                    </div>
                  </div>

                  <div className="member-foot">
                    <span className="m-dept">[{dept}]</span>
                    <span className={`m-status ${user.banned ? 'is-banned' : 'is-active'}`}>
                      {user.banned ? '⛔ BAN' : '● ACTIVE'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .info { max-width: 1200px; margin: 0 auto; }

        .page-head { margin-bottom: 26px; animation: fadeIn 0.45s ease; }
        .ph-stamp {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid #333;
          color: #888;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .ph-title {
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 0;
          color: #fff;
          line-height: 1;
          text-transform: uppercase;
        }
        .ph-dot { color: #fff; animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .ph-sub { color: #888; font-size: 13px; margin: 12px 0 0; }
        .ph-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 0;
        }

        /* ═══ ФИЛЬТРЫ ═══ */
        .filters {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          padding: 16px 18px;
          margin-bottom: 18px;
          animation: cardIn 0.4s ease;
        }
        .filter-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-wrap {
          position: relative;
          flex: 1 1 260px;
          min-width: 200px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #555;
          font-size: 15px;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 11px 36px 11px 34px;
          background: #060606;
          border: 1px solid #262626;
          color: #fff;
          border-radius: 0;
          font-size: 13.5px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #fff; }
        .search-input::placeholder { color: #444; }
        .search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 22px;
          height: 22px;
          background: transparent;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 13px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s;
        }
        .search-clear:hover { color: #fff; background: #222; }

        .filter-select {
          padding: 11px 34px 11px 14px;
          background: #060606;
          border: 1px solid #262626;
          color: #fff;
          border-radius: 0;
          font-size: 12px;
          font-family: ui-monospace, monospace;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          cursor: pointer;
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #666 50%),
                            linear-gradient(135deg, #666 50%, transparent 50%);
          background-position: calc(100% - 16px) center, calc(100% - 11px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          outline: none;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .filter-select:focus { border-color: #fff; }
        .filter-select option { background: #0c0c0c; color: #fff; }

        .filter-reset {
          padding: 11px 14px;
          background: transparent;
          border: 1px solid #553030;
          color: #ff8080;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .filter-reset:hover {
          background: #ff4444;
          border-color: #ff4444;
          color: #fff;
        }

        .filter-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #1f1f1f;
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 1.4px;
        }
        .fm-found { color: #888; }
        .fm-found strong { color: #fff; font-size: 12px; }
        .fm-chip {
          padding: 3px 9px;
          background: rgba(255,255,255,0.06);
          border: 1px solid #2a2a2a;
          color: #ccc;
          text-transform: uppercase;
          font-size: 10px;
        }

        /* ═══ РЕЕСТР ═══ */
        .roster {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }

        .member {
          position: relative;
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          padding: 0;
          overflow: hidden;
          transition: all 0.22s ease;
          opacity: 0;
          animation: cardIn 0.4s ease forwards;
        }
        .member:hover {
          background: #131313;
          border-color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px #fff;
        }

        .member-preset-blue {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          border-color: #3b82f6;
        }
        .member-preset-purple {
          background: linear-gradient(135deg, #4c1d95, #a855f7);
          border-color: #a855f7;
        }
        .member-preset-green {
          background: linear-gradient(135deg, #065f46, #10b981);
          border-color: #10b981;
        }
        .member-preset-blue:hover,
        .member-preset-purple:hover,
        .member-preset-green:hover {
          border-color: #fff;
          box-shadow: 0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px #fff;
        }

        .member-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.22;
          filter: grayscale(1);
          transition: opacity 0.22s;
          pointer-events: none;
        }
        .member:hover .member-bg { opacity: 0.35; }

        /* Ранг бейдж в правом верхнем углу */
        .member-rank {
          position: absolute;
          top: 10px;
          right: 10px;
          min-width: 28px;
          height: 22px;
          padding: 0 6px;
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #fff;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          border-radius: 2px;
        }

        .member-inner {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 16px 12px;
        }

        .member-avatar {
          flex: 0 0 48px;
          width: 48px; height: 48px;
          border: 1px solid #2a2a2a;
          overflow: hidden;
          background: #060606;
        }
        .member-avatar img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(0.4);
          transition: filter 0.22s;
        }
        .member:hover .member-avatar img { filter: grayscale(0); }
        .member-avatar-empty {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-family: ui-monospace, monospace;
          font-size: 20px;
        }

        .member-info { flex: 1; min-width: 0; }
        .member-nick {
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 3px;
        }
        .member-user {
          color: #888;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .member-rank-line {
          margin-top: 4px;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1px;
          color: #b0b0b0;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .member-foot {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          border-top: 1px solid #1a1a1a;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
        }
        .m-dept {
          color: #fff;
          font-weight: 700;
        }
        .m-status.is-active { color: #8ee08e; }
        .m-status.is-banned { color: #ff8080; }

        /* ── ПУСТЫЕ СОСТОЯНИЯ ── */
        .panel { background: #0c0c0c; border: 1px solid #1f1f1f; }
        .panel-body.center { padding: 60px 20px; text-align: center; }
        .empty-icon {
          font-family: ui-monospace, monospace;
          font-size: 32px;
          color: #2a2a2a;
          letter-spacing: 6px;
          margin-bottom: 12px;
        }
        .muted {
          color: #666;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2.4px;
          margin: 0;
          text-transform: uppercase;
        }
        .empty-reset {
          margin-top: 18px;
          padding: 10px 18px;
          background: transparent;
          border: 1px solid #333;
          color: #ccc;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          transition: all 0.18s;
        }
        .empty-reset:hover { background: #fff; border-color: #fff; color: #000; }

        .loading-line {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2.4px;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 640px) {
          .ph-title { font-size: 26px; letter-spacing: 2px; }
          .roster { grid-template-columns: 1fr; gap: 10px; }
          .member-inner { padding: 14px 14px 10px; }
          .member-foot { padding: 9px 14px; }
          .filter-row { gap: 8px; }
          .search-wrap { flex: 1 1 100%; }
          .filter-select { flex: 1 1 calc(50% - 4px); }
          .filter-reset { flex: 1 1 100%; }
        }
      `}</style>
    </Layout>
  );
}
