import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CloudBackground from '../components/CloudBackground';

const TOS_URL = 'https://docs.google.com/document/d/1GOFZ0kCdL2WNg85YRgi07BRHd-uQuOQKeqX4m0Ru7Zs/edit?usp=sharing';
const PRIVACY_URL = 'https://docs.google.com/document/d/1kG7hH5jsf1ItOQwsnvGMs_drvssIeJ_vbZQ9_hG7PuE/edit?usp=sharing';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) { router.push('/dashboard'); return; }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDiscordLogin = async () => {
    const res = await fetch('/api/start-auth');
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Ошибка при создании ссылки авторизации');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-inner">
          <div className="boot-line" />
          <span className="boot-text">ИНИЦИАЛИЗАЦИЯ...</span>
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            background: #0a0a0a;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-inner {
            text-align: center;
            font-family: ui-monospace, monospace;
          }
          .boot-line {
            width: 160px;
            height: 1px;
            background: #1f1f1f;
            margin: 0 auto 14px;
            position: relative;
            overflow: hidden;
          }
          .boot-line::after {
            content: '';
            position: absolute;
            inset: 0;
            background: #fff;
            animation: boot 1.4s ease-in-out infinite;
          }
          @keyframes boot {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .boot-text {
            color: #666;
            font-size: 10px;
            letter-spacing: 3px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth">
      <CloudBackground />

      <div className={`auth-card ${visible ? 'show' : ''}`}>
        <div className="top-strip">
          <span>■</span>
          <span>FIB FORMS</span>
          <span>·</span>
          <span>SECURE ACCESS</span>
        </div>

        <div className="logo-wrap">
          <img src="/logo.png" alt="FIB" className="logo" />
        </div>

        <h1 className="title">FIB FORMS<span className="dot">.</span></h1>
        <p className="subtitle">Федеральное бюро расследований · Система подачи заявок</p>

        <div className="rule" />

        <button className="discord-btn" onClick={handleDiscordLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.31.61.67 1.19 1.07 1.74.02.02.06.03.07.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" fill="currentColor"/>
          </svg>
          ВОЙТИ ЧЕРЕЗ DISCORD
        </button>

        <button className="info-btn" onClick={() => setShowInfo(!showInfo)}>
          {showInfo ? '× СКРЫТЬ' : '? ЧТО ПОЛУЧАЕТ БОТ'}
        </button>

        {showInfo && (
          <div className="info-box">
            <div className="info-head">/// SCOPE: identify</div>
            <ul className="info-list">
              <li><span className="ib-bullet">▸</span> ID аккаунта</li>
              <li><span className="ib-bullet">▸</span> @username</li>
              <li><span className="ib-bullet">▸</span> Аватар</li>
              <li><span className="ib-bullet">▸</span> Баннер</li>
            </ul>
            <p className="info-note">
              Больше никакие данные не запрашиваются и не передаются.
            </p>
          </div>
        )}

        <div className="divider">
          <span className="d-line" />
          <span className="d-mark">◆</span>
          <span className="d-line" />
        </div>

        <button className="author-btn" onClick={() => router.push('/author')} title="Об авторе">
          <span className="author-dot" />
          <span>АВТОР: @MURUH1TA</span>
        </button>

        <div className="legal-links">
          <a href={TOS_URL} target="_blank" rel="noopener noreferrer">ToS</a>
          <span className="ll-sep">·</span>
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacy</a>
        </div>

        <div className="bottom-strip">
          <span>CLASSIFIED</span>
          <span>·</span>
          <span>v7.1.0</span>
        </div>
      </div>

      <style jsx>{`
        .auth {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          padding: 20px;
        }

        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          padding: 0 0 30px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6);
        }
        .auth-card.show {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── ВЕРХНЯЯ ПОЛОСА ── */
        .top-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 8px 14px;
          background: #000;
          border-bottom: 1px solid #1f1f1f;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: #666;
        }
        .top-strip span:first-child { color: #fff; font-size: 11px; line-height: 1; }

        /* ── ЛОГО ── */
        .logo-wrap {
          display: flex;
          justify-content: center;
          padding: 34px 0 0;
        }
        .logo {
          width: 78px;
          height: 78px;
          object-fit: contain;
          filter: grayscale(1) contrast(1.1);
          opacity: 0.95;
        }

        /* ── ЗАГОЛОВОК ── */
        .title {
          text-align: center;
          color: #fff;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 20px 0 6px;
          line-height: 1;
          text-transform: uppercase;
        }
        .dot {
          animation: blink 1.2s steps(2, start) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .subtitle {
          text-align: center;
          color: #888;
          font-size: 12.5px;
          margin: 0 20px;
          line-height: 1.5;
        }

        .rule {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #444 50%, transparent 100%);
          margin: 22px 30px 26px;
        }

        /* ── КНОПКА DISCORD ── */
        .discord-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 30px;
          width: calc(100% - 60px);
          padding: 15px 20px;
          background: #fff;
          border: 1px solid #fff;
          color: #000;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.4px;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .discord-btn:hover {
          background: #ccc;
          border-color: #ccc;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255,255,255,0.1);
        }

        /* ── INFO BUTTON ── */
        .info-btn {
          display: block;
          margin: 16px auto 0;
          padding: 5px 12px;
          background: transparent;
          border: 1px solid #2a2a2a;
          color: #777;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.8px;
          cursor: pointer;
          transition: all 0.18s;
          text-transform: uppercase;
        }
        .info-btn:hover {
          border-color: #555;
          color: #ccc;
        }

        /* ── INFO BOX ── */
        .info-box {
          margin: 14px 30px 0;
          padding: 14px 16px;
          background: #060606;
          border: 1px solid #1f1f1f;
          text-align: left;
          animation: boxIn 0.25s ease;
        }
        @keyframes boxIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .info-head {
          color: #666;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #1f1f1f;
          text-transform: uppercase;
        }
        .info-list {
          list-style: none;
          padding: 0;
          margin: 0 0 10px;
        }
        .info-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ccc;
          font-size: 13px;
          padding: 2px 0;
        }
        .ib-bullet {
          color: #fff;
          font-family: ui-monospace, monospace;
          font-size: 11px;
        }
        .info-note {
          color: #666;
          font-size: 11.5px;
          margin: 0;
          line-height: 1.5;
          font-style: italic;
        }

        /* ── DIVIDER ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 30px 18px;
        }
        .d-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #2a2a2a, transparent);
        }
        .d-mark {
          color: #444;
          font-size: 10px;
          line-height: 1;
        }

        /* ── АВТОР ── */
        .author-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0 auto;
          padding: 7px 14px;
          background: transparent;
          border: 1px solid #2a2a2a;
          color: #888;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.8px;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .author-btn:hover {
          background: #fff;
          border-color: #fff;
          color: #000;
        }
        .author-dot {
          width: 5px; height: 5px;
          background: currentColor;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }

        /* ── ПРАВОВЫЕ ССЫЛКИ ── */
        .legal-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }
        .legal-links a {
          color: #666;
          text-decoration: none;
          transition: color 0.18s;
        }
        .legal-links a:hover { color: #fff; }
        .ll-sep { color: #333; }

        /* ── НИЖНЯЯ ПОЛОСА ── */
        .bottom-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px dashed #1a1a1a;
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: #444;
        }

        @media (max-width: 480px) {
          .auth-card { max-width: 100%; }
          .title { font-size: 24px; letter-spacing: 2px; }
          .subtitle { font-size: 11.5px; }
          .logo { width: 64px; height: 64px; }
          .discord-btn { margin: 0 20px; width: calc(100% - 40px); font-size: 11px; padding: 14px; }
          .rule { margin: 20px 20px 22px; }
          .info-box { margin: 12px 20px 0; }
          .divider { margin: 20px 20px 16px; }
        }
      `}</style>
    </div>
  );
}
