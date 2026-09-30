import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';

const AUTHOR = {
  username: 'muruh1ta',
  displayName: 'Mur Kiratu',
  discordId: '1018113109346504744',
  email: 'murkilanki@gmail.com',
  avatar: 'https://i.pinimg.com/736x/8f/c7/20/8fc7201fb1ee4228df360fa848395597.jpg',
  roles: ['ADMIN', 'DEVELOPER'],
  bio: 'Создатель и хранитель FIB Forms. Пишу код, чтобы заявки уходили туда, куда нужно, а не в никуда.',
  site: 'http://saketo.xo.je/?i=2',
  siteLabel: 'ЛИЧНОЕ ПРОСТРАНСТВО'
};

// 🈴 Иероглифы вокруг аватарки
const ORBIT_SYMBOLS = [
  { char: '心', meaning: 'heart' },
  { char: '技', meaning: 'skill' },
  { char: '夢', meaning: 'dream' },
  { char: '炎', meaning: 'flame' },
  { char: '力', meaning: 'power' },
  { char: '光', meaning: 'light' }
];

export default function AuthorPage() {
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(AUTHOR.discordId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {}
  };

  const now = new Date();
  const year = now.getFullYear();

  return (
    <>
      <Head>
        <title>About the Author · Mur Kiratu</title>
        <meta name="description" content="Об авторе Discord-бота FIB Forms" />
      </Head>

      <Layout>
        <div className={`author ${mounted ? 'mounted' : ''}`}>
          {/* ░░ ШАПКА ░░ */}
          <header className="page-head">
            <div className="ph-stamp">DOSSIER · AUTHOR FILE</div>
            <h1 className="ph-title">АВТОР<span className="ph-dot">.</span></h1>
            <p className="ph-sub">
              Служебное дело · Личность, стоящая за FIB Forms
            </p>
            <div className="ph-rule" />
            <div className="ph-meta">
              <span>REF: FIB/AUTH/{AUTHOR.discordId.slice(-6)}</span>
              <span className="ph-sep">·</span>
              <span>ДОСТУП: <em>ПУБЛИЧНЫЙ</em></span>
              <span className="ph-sep">·</span>
              <span>{year}</span>
            </div>
          </header>

          {/* ░░ ОСНОВНАЯ КАРТОЧКА ░░ */}
          <section className="panel">
            <div className="panel-head">
              <span className="p-num">01</span>
              <h2 className="p-title">ИДЕНТИФИКАЦИЯ</h2>
              <span className="p-tag">VERIFIED</span>
            </div>
            <div className="panel-body">
              <div className="id-card">
                {/* ── АВАТАР С ОРБИТОЙ ── */}
                <div className="avatar-block">
                  <div className="orbit-ring">
                    {ORBIT_SYMBOLS.map((s, i) => (
                      <div
                        key={i}
                        className="orbit-symbol"
                        style={{
                          transform: `rotate(${i * 60}deg) translateY(-140px) rotate(-${i * 60}deg)`,
                          animationDelay: `${i * 0.5}s`
                        }}
                        title={s.meaning}
                      >
                        {s.char}
                      </div>
                    ))}
                  </div>

                  <div className="avatar-ring-outer" />
                  <div className="avatar-ring-inner" />

                  <div className="avatar-wrap">
                    {AUTHOR.avatar && !avatarError ? (
                      <img
                        src={AUTHOR.avatar}
                        alt="Author avatar"
                        className="avatar-img"
                        onError={() => setAvatarError(true)}
                      />
                    ) : null}
                    <div className={`avatar-fallback ${AUTHOR.avatar && !avatarError ? 'hidden' : ''}`}>
                      村
                    </div>
                  </div>
                </div>

                {/* ── ДАННЫЕ ── */}
                <div className="id-info">
                  <div className="id-name">{AUTHOR.displayName}</div>
                  <div className="id-handle">
                    <span className="at">@</span>
                    <span>{AUTHOR.username}</span>
                    <span className="verified">✓</span>
                  </div>

                  <div className="roles-row">
                    {AUTHOR.roles.map((role, i) => (
                      <span key={i} className={`role-chip role-${i}`}>
                        {i === 0 ? '◆' : '◇'} {role}
                      </span>
                    ))}
                  </div>

                  <p className="bio">{AUTHOR.bio}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ░░ КОНТАКТЫ ░░ */}
          <section className="panel">
            <div className="panel-head">
              <span className="p-num">02</span>
              <h2 className="p-title">СРЕДСТВА СВЯЗИ</h2>
              <span className="p-tag">CONTACTS</span>
            </div>
            <div className="panel-body no-pad">
              <button className="contact-row" onClick={copyId}>
                <span className="c-idx">[01]</span>
                <span className="c-label">DISCORD ID</span>
                <span className="c-value">{AUTHOR.discordId}</span>
                <span className="c-hint">{copied ? '✅ СКОПИРОВАНО' : 'НАЖМИ'}</span>
              </button>

              <a href={`mailto:${AUTHOR.email}`} className="contact-row">
                <span className="c-idx">[02]</span>
                <span className="c-label">EMAIL</span>
                <span className="c-value">{AUTHOR.email}</span>
                <span className="c-hint">НАПИСАТЬ →</span>
              </a>

              <a
                href={`https://discord.com/users/${AUTHOR.discordId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row"
              >
                <span className="c-idx">[03]</span>
                <span className="c-label">DISCORD</span>
                <span className="c-value">ЛИЧНЫЕ СООБЩЕНИЯ</span>
                <span className="c-hint">ОТКРЫТЬ →</span>
              </a>

              <a
                href={AUTHOR.site}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row contact-row-accent"
              >
                <span className="c-idx">[04]</span>
                <span className="c-label">{AUTHOR.siteLabel}</span>
                <span className="c-value">saketo.xo.je</span>
                <span className="c-hint">ПЕРЕЙТИ →</span>
              </a>
            </div>
          </section>

          {/* ░░ ПРИМЕЧАНИЕ ░░ */}
          <section className="panel panel-muted">
            <div className="panel-head">
              <span className="p-num">03</span>
              <h2 className="p-title">ПРИМЕЧАНИЕ</h2>
            </div>
            <div className="panel-body">
              <p className="note">
                FIB Forms — открытый проект. Исходники доступны на GitHub.
                Все замечания, баги и предложения — через Discord или email.
              </p>
            </div>
          </section>

          {/* ░░ ПОДВАЛ ░░ */}
          <footer className="author-foot">
            <span>FIB · FORMS TERMINAL</span>
            <span className="af-dash">—</span>
            <span>AUTHOR FILE</span>
            <span className="af-dash">—</span>
            <span>v7.1.0</span>
          </footer>
        </div>
      </Layout>

      <style jsx>{`
        .author {
          max-width: 820px;
          margin: 0 auto;
          color: #eaeaea;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .author.mounted { opacity: 1; }

        /* ═══ ШАПКА ═══ */
        .page-head {
          margin-bottom: 26px;
          animation: fadeIn 0.5s ease;
        }
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
          background: rgba(255,255,255,0.02);
        }
        .ph-title {
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          color: #fff;
          line-height: 1;
          text-transform: uppercase;
        }
        .ph-dot {
          color: #fff;
          animation: blink 1.2s steps(2, start) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .ph-sub {
          color: #888;
          font-size: 14px;
          margin: 12px 0 0;
          letter-spacing: 0.3px;
        }
        .ph-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 12px;
        }
        .ph-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.4px;
          color: #777;
          text-transform: uppercase;
        }
        .ph-sep { color: #333; }
        .ph-meta em { color: #fff; font-style: normal; font-weight: 700; }

        /* ═══ ПАНЕЛЬ ═══ */
        .panel {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          margin-bottom: 16px;
          animation: cardIn 0.5s ease both;
        }
        .panel-muted {
          background: #0a0a0a;
          border-color: #1a1a1a;
        }
        .panel-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
        }
        .panel-muted .panel-head {
          border-bottom-color: #1a1a1a;
        }
        .p-num {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: #666;
          font-weight: 700;
        }
        .p-title {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.4px;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
          flex: 1;
        }
        .p-tag {
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: #666;
          border: 1px solid #2a2a2a;
          padding: 2px 8px;
        }
        .panel-body {
          padding: 22px;
        }
        .panel-body.no-pad {
          padding: 0;
        }

        /* ═══ КАРТОЧКА ID ═══ */
        .id-card {
          display: flex;
          gap: 30px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* ── Аватар с орбитой ── */
        .avatar-block {
          position: relative;
          width: 160px;
          height: 160px;
          flex-shrink: 0;
          margin: 0 auto;
        }
        .orbit-ring {
          position: absolute;
          inset: -100px;
          pointer-events: none;
          z-index: 3;
        }
        .orbit-symbol {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 36px;
          height: 36px;
          margin: -18px 0 0 -18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Noto Serif JP', 'Yu Mincho', serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
          border-radius: 50%;
          backdrop-filter: blur(4px);
          box-shadow: 0 0 12px rgba(255,255,255,0.15);
          animation: orbitPulse 3s ease-in-out infinite;
          transition: border-color 0.2s;
        }
        .orbit-symbol:nth-child(1) { animation-delay: 0s; }
        .orbit-symbol:nth-child(2) { animation-delay: 0.5s; }
        .orbit-symbol:nth-child(3) { animation-delay: 1s; }
        .orbit-symbol:nth-child(4) { animation-delay: 1.5s; }
        .orbit-symbol:nth-child(5) { animation-delay: 2s; }
        .orbit-symbol:nth-child(6) { animation-delay: 2.5s; }
        @keyframes orbitPulse {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 8px rgba(255,255,255,0.1); }
          50%      { opacity: 1;   box-shadow: 0 0 20px rgba(255,255,255,0.25); }
        }

        .avatar-ring-outer {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #fff, #333, #fff, #333, #fff);
          animation: spinRing 12s linear infinite;
          opacity: 0.9;
        }
        .avatar-ring-inner {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 180deg, #555, #fff, #555, #fff, #555);
          animation: spinRing 12s linear infinite reverse;
          opacity: 0.5;
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }

        .avatar-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: #0a0a0a;
          border: 3px solid #0a0a0a;
          z-index: 2;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(0.3) contrast(1.05);
          transition: filter 0.3s;
        }
        .avatar-wrap:hover .avatar-img {
          filter: grayscale(0) contrast(1);
        }
        .avatar-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          font-family: 'Noto Serif JP', serif;
          color: #fff;
          background: radial-gradient(circle, #1a1a1a, #0a0a0a);
          z-index: 1;
        }
        .avatar-fallback.hidden { display: none; }

        /* ── Данные ── */
        .id-info {
          flex: 1;
          min-width: 260px;
        }
        .id-name {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: #fff;
          margin: 0 0 6px;
          line-height: 1.1;
        }
        .id-handle {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #aaa;
          font-family: ui-monospace, monospace;
          font-size: 14px;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .at { color: #fff; font-weight: 800; }
        .verified {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          background: #fff;
          color: #000;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 900;
          margin-left: 6px;
        }

        .roles-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .role-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border: 1px solid #333;
          border-radius: 2px;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #ccc;
        }
        .role-0 {
          border-color: #fff;
          color: #fff;
          background: rgba(255,255,255,0.03);
        }

        .bio {
          color: #b0b0b0;
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
          font-style: italic;
        }

        /* ═══ КОНТАКТЫ ═══ */
        .contact-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 20px;
          border-bottom: 1px solid #1a1a1a;
          background: transparent;
          color: #eaeaea;
          cursor: pointer;
          text-decoration: none;
          font-family: inherit;
          font-size: 14px;
          transition: background 0.18s, color 0.18s;
          width: 100%;
          text-align: left;
          border-left: none;
          border-right: none;
          border-top: none;
        }
        .contact-row:last-child { border-bottom: none; }
        .contact-row:hover {
          background: #fff;
          color: #000;
        }
        .contact-row:hover .c-idx,
        .contact-row:hover .c-label,
        .contact-row:hover .c-value,
        .contact-row:hover .c-hint {
          color: #000;
        }
        .contact-row:hover .c-hint {
          opacity: 1;
        }

        .contact-row-accent {
          background: rgba(255, 255, 255, 0.03);
          border-left: 3px solid #fff;
        }
        .contact-row-accent .c-label {
          color: #fff;
        }

        .c-idx {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: #555;
          flex-shrink: 0;
          transition: color 0.18s;
        }
        .c-label {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #888;
          text-transform: uppercase;
          flex-shrink: 0;
          min-width: 110px;
          transition: color 0.18s;
        }
        .c-value {
          flex: 1;
          font-weight: 600;
          letter-spacing: 0.3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.18s;
        }
        .c-hint {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          color: #555;
          flex-shrink: 0;
          opacity: 0.8;
          transition: color 0.18s, opacity 0.18s;
        }

        /* ═══ ПРИМЕЧАНИЕ ═══ */
        .note {
          color: #999;
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
          font-style: italic;
        }

        /* ═══ ПОДВАЛ ═══ */
        .author-foot {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px dashed #262626;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
          flex-wrap: wrap;
          animation: fadeIn 0.7s ease;
        }
        .af-dash { color: #333; }

        /* ═══ АНИМАЦИИ ═══ */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ═══ МОБИЛЬНАЯ ═══ */
        @media (max-width: 640px) {
          .ph-title { font-size: 30px; letter-spacing: 3px; }
          .ph-sub { font-size: 12px; }
          .panel-body { padding: 16px; }
          .id-card { flex-direction: column; text-align: center; gap: 20px; }
          .avatar-block { width: 130px; height: 130px; }
          .orbit-ring { inset: -70px; }
          .orbit-symbol {
            width: 28px;
            height: 28px;
            margin: -14px 0 0 -14px;
            font-size: 14px;
          }
          .id-name { font-size: 22px; letter-spacing: 1px; }
          .id-handle { font-size: 12px; }
          .roles-row { justify-content: center; }
          .bio { font-size: 13px; }
          .contact-row {
            flex-wrap: wrap;
            gap: 8px;
            padding: 12px 16px;
          }
          .c-label { min-width: auto; }
          .c-value { font-size: 13px; }
          .c-hint { width: 100%; text-align: right; }
        }
      `}</style>
    </>
  );
}
