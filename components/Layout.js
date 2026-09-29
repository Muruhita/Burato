import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ADMIN_IDS } from '../lib/admins';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setUser(data.user);
        setIsAdmin(ADMIN_IDS.includes(data.user.id));
      });
  }, []);

  useEffect(() => {
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => { if (data.announcement) setAnnouncement(data.announcement); })
      .catch(() => {});
  }, []);

  const tabs = [
    { name: 'FORMS',    path: '/dashboard', icon: '▤' },
    { name: 'PROFILE',  path: '/profile',   icon: '◉' },
    { name: 'MEMBERS',  path: '/members',   icon: '⎔' },
    { name: 'HELP',     path: '/help',      icon: '?' },
    ...(isAdmin ? [{ name: 'ADMIN', path: '/admin', icon: '⚙' }] : []),
  ];

  return (
    <div className="app">
      {/* ░░ ВЕРХНЯЯ СЛУЖЕБНАЯ ПОЛОСА ░░ */}
      <div className="topbar">
        <span className="tb-mark">■</span>
        <span className="tb-title">FIB FORMS // TERMINAL</span>
        <span className="tb-spacer" />
        <span className="tb-meta">SECURE CHANNEL</span>
        <span className="tb-sep">·</span>
        <span className="tb-meta">v7.1.0</span>
      </div>

      {/* ░░ НАВИГАЦИЯ ░░ */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => router.push('/dashboard')}>
          <img src="/logo.png" alt="FIB" className="nav-logo-img" />
          <span className="nav-logo-text">FIB</span>
        </div>

        <div className="nav-tabs">
          {tabs.map(tab => {
            const active = router.pathname === tab.path;
            return (
              <button
                key={tab.path}
                className={`nav-tab ${active ? 'active' : ''}`}
                onClick={() => router.push(tab.path)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{active ? `[ ${tab.name} ]` : tab.name}</span>
              </button>
            );
          })}
        </div>

        <div className="nav-user">
          {user && (
            <span className="nav-user-name">
              <span className="nu-dot" />
              {user.username}
            </span>
          )}
          <button
            className="nav-exit"
            onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/'); }}
            title="Выйти"
          >
            EXIT
          </button>
        </div>
      </nav>

      {/* ░░ ОБЪЯВЛЕНИЕ ░░ */}
      {announcement && (
        <div className="announce">
          <span className="announce-tag">NOTICE</span>
          <span className="announce-text">{announcement}</span>
        </div>
      )}

      {/* ░░ КОНТЕНТ ░░ */}
      <main key={router.pathname} className="main">
        {children}
      </main>

      {/* ░░ ПОДВАЛ ░░ */}
      <footer className="footer">
        <div className="footer-links">
          <a href="/terms"   className="f-link">MINI-GAME</a>
          <span className="f-sep">/</span>
          <a href="/privacy" className="f-link">LINKS</a>
          <span className="f-sep">/</span>
          <a href="/hosting" className="f-link">HOSTING</a>
          <span className="f-sep">/</span>
          <a href="/admins"  className="f-link">ADMINS</a>
          <span className="f-sep">/</span>
          <a href="/author"  className="f-link f-author" title="Об авторе">
            <span className="f-dot" />
            @muruh1ta
          </a>
        </div>
        <div className="footer-note">
          FIB · FORMS TERMINAL — CLASSIFIED
        </div>
      </footer>

      {/* ░░ БОКОВЫЕ КНОПКИ ░░ */}
      <div className="side">
        <a href="/dish" className="side-btn side-btn-warn" title="Проблемы с Discord?">
          <span className="side-ico">!</span> DISCORD
        </a>
        <a href="/leh" className="side-btn" title="Условия пользования">
          <span className="side-ico">§</span> ToS
        </a>
        <a href="/geh" className="side-btn" title="Политика конфиденциальности">
          <span className="side-ico">¶</span> PRIVACY
        </a>
      </div>

      <style jsx>{`
        .app {
          min-height: 100vh;
          background: transparent;
          color: var(--text, #eaeaea);
          position: relative;
        }

        /* ═══ ВЕРХНЯЯ ПОЛОСА ═══ */
        .topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 105;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 20px;
          background: #000;
          border-bottom: 1px solid var(--border, #1f1f1f);
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-mute, #555);
        }
        .tb-mark  { color: #fff; font-size: 11px; line-height: 1; }
        .tb-title { color: #ddd; font-weight: 700; }
        .tb-spacer { flex: 1; }
        .tb-meta  { color: var(--text-mute, #555); }
        .tb-sep   { color: var(--text-fade, #333); }

        /* ═══ НАВИГАЦИЯ ═══ */
        .navbar {
          position: fixed;
          top: 24px; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 12px 24px;
          background: rgba(10, 10, 10, 0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border, #1f1f1f);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .nav-logo-img {
          width: 26px; height: 26px;
          object-fit: contain;
          filter: grayscale(1);
        }
        .nav-logo-text {
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #fff;
        }

        .nav-tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-dim, #888);
          border-radius: 0;
          cursor: pointer;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 11px;
          letter-spacing: 1.4px;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .nav-tab:hover {
          color: #fff;
          border-color: var(--border-2, #2a2a2a);
        }
        .nav-tab.active {
          background: #fff;
          color: #000;
          border-color: #fff;
          font-weight: 700;
        }
        .tab-icon { font-size: 12px; line-height: 1; }
        .tab-name { line-height: 1; }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 11px;
          letter-spacing: 1.2px;
        }
        .nav-user-name {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--text-2, #b0b0b0);
          text-transform: uppercase;
        }
        .nu-dot {
          width: 5px; height: 5px;
          background: #fff;
          display: inline-block;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        .nav-exit {
          background: transparent;
          border: 1px solid var(--border-2, #2a2a2a);
          color: var(--text-2, #b0b0b0);
          padding: 6px 12px;
          cursor: pointer;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: 2px;
          transition: all 0.18s ease;
        }
        .nav-exit:hover {
          background: #fff;
          border-color: #fff;
          color: #000;
        }

        /* ═══ ОБЪЯВЛЕНИЕ ═══ */
        .announce {
          position: fixed;
          top: 73px;
          left: 0; right: 0;
          z-index: 90;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 9px 22px;
          background: repeating-linear-gradient(
            -45deg,
            #0a0a0a 0px, #0a0a0a 12px,
            #131313 12px, #131313 24px
          );
          border-bottom: 1px dashed #444;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 11px;
          letter-spacing: 1px;
        }
        .announce-tag {
          padding: 2px 8px;
          background: #fff;
          color: #000;
          font-weight: 800;
          letter-spacing: 2px;
          flex-shrink: 0;
        }
        .announce-text {
          color: #eaeaea;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ═══ КОНТЕНТ ═══ */
        .main {
          position: relative;
          z-index: 10;
          padding: 30px 24px 90px;
          padding-top: 100px;
          max-width: 1200px;
          margin: 0 auto;
          animation: mainIn 0.4s ease both;
        }
        @keyframes mainIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ═══ ПОДВАЛ ═══ */
        .footer {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 20px;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border, #1f1f1f);
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .f-link {
          color: var(--text-dim, #888);
          text-decoration: none;
          padding: 3px 6px;
          transition: color 0.18s ease;
        }
        .f-link:hover { color: #fff; }
        .f-sep { color: var(--text-fade, #333); }
        .f-author {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #ddd;
          border: 1px solid var(--border-2, #2a2a2a);
          padding: 3px 9px;
        }
        .f-author:hover {
          background: #fff;
          color: #000;
          border-color: #fff;
        }
        .f-dot {
          width: 5px; height: 5px;
          background: currentColor;
          border-radius: 50%;
          display: inline-block;
        }
        .footer-note {
          color: var(--text-fade, #333);
          font-size: 9px;
          letter-spacing: 2px;
        }

        /* ═══ БОКОВЫЕ КНОПКИ ═══ */
        .side {
          position: fixed;
          right: 16px;
          bottom: 60px;
          z-index: 99;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        .side-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(12, 12, 12, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-2, #2a2a2a);
          color: var(--text-2, #b0b0b0);
          text-decoration: none;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: 1.6px;
          transition: all 0.18s ease;
        }
        .side-btn:hover {
          background: #fff;
          color: #000;
          border-color: #fff;
        }
        .side-ico {
          font-size: 11px;
          line-height: 1;
        }
        .side-btn-warn {
          border-color: #555;
          color: #ccc;
        }

        /* ═══ МОБИЛЬНАЯ АДАПТАЦИЯ ═══ */
        @media (max-width: 720px) {
          .navbar {
            padding: 10px 14px;
            gap: 10px;
            flex-wrap: wrap;
          }
          .nav-tabs { order: 3; width: 100%; justify-content: flex-start; }
          .tab-name { display: none; }
          .nav-tab { padding: 8px 10px; }
          .tab-icon { font-size: 15px; }
          .nav-user-name { display: none; }
          .main { padding: 130px 14px 90px; }
          .footer {
            flex-direction: column;
            gap: 4px;
            padding: 6px 12px;
            font-size: 9px;
          }
          .footer-note { display: none; }
          .side { bottom: 70px; right: 10px; }
          .side-btn { padding: 5px 9px; font-size: 9px; }
          .topbar { padding: 5px 14px; font-size: 9px; letter-spacing: 1.4px; }
          .tb-meta { display: none; }
        }
      `}</style>
    </div>
  );
}
