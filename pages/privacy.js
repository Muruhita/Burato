import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Privacy() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const links = [
    { label: 'Памятка (Google Таблица)',             url: 'https://docs.google.com/spreadsheets/d/1vghv-rV-7XVEzaZMvdLv2mj73LOb3IZgHOmEFeNYe5w/edit?gid=487155581#gid=487155581' },
    { label: 'Памятка by sylphy (Google Таблица)',   url: 'https://docs.google.com/spreadsheets/d/1G1wyJtcV4c2r_Oo7qvw0dl4tTBwaRy8TRONXtnCpNAE/edit?gid=0#gid=0' },
    { label: 'Памятка by Tamerlan (Google Таблица)', url: 'https://docs.google.com/spreadsheets/d/1wtOzs-zYqVBF2JhCYstLs4Cn7hLMw1YMWdppgS_L0AQ/edit?gid=0#gid=0' },
    { label: 'Форум с законами Majestic RP',         url: 'https://forum.majestic-rp.ru/forums/zakonodatel-naya-baza.1017/' }
  ];

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">REF · UTILITY · INDEX</div>
          <h1 className="ph-title">ПОЛЕЗНЫЕ ССЫЛКИ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Внешние материалы для работы с FIB Forms</p>
          <div className="ph-rule" />
        </header>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">ВНЕШНИЕ РЕСУРСЫ</h2>
            <span className="p-tag">{links.length} ФАЙЛОВ</span>
          </div>
          <div className="panel-body no-pad">
            <div className="links">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-row"
                  style={{ animationDelay: `${0.15 + i * 0.06}s` }}
                >
                  <span className="l-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="l-name">{link.label}</span>
                  <span className="l-arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="back-wrap">
          <button className="btn" onClick={() => router.push('/dashboard')}>← ВЕРНУТЬСЯ</button>
        </div>
      </div>

      <style jsx>{`
        .info { max-width: 860px; margin: 0 auto; }

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

        .panel {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          animation: cardIn 0.45s ease;
        }
        .panel-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
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

        .panel-body.no-pad { padding: 0; }
        .links { display: flex; flex-direction: column; }

        .link-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #1a1a1a;
          color: #eaeaea;
          text-decoration: none;
          font-size: 14px;
          opacity: 0;
          animation: rowIn 0.4s ease forwards;
          transition: background 0.18s, color 0.18s;
        }
        .link-row:last-child { border-bottom: none; }
        .link-row:hover {
          background: #fff;
          color: #000;
        }
        .link-row:hover .l-idx { color: #000; }
        .link-row:hover .l-arrow { color: #000; transform: translateX(4px); }

        .l-idx {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #555;
          flex-shrink: 0;
          transition: color 0.18s;
        }
        .l-name {
          flex: 1;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .l-arrow {
          color: #fff;
          font-size: 16px;
          flex-shrink: 0;
          transition: transform 0.2s, color 0.18s;
        }

        .back-wrap { margin-top: 20px; }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          background: transparent;
          border: 1px solid #333;
          color: #eaeaea;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .btn:hover { background: #fff; border-color: #fff; color: #000; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .ph-title { font-size: 24px; letter-spacing: 1.6px; }
          .link-row { padding: 13px 14px; gap: 10px; font-size: 13px; }
          .l-name { font-size: 13px; }
        }
      `}</style>
    </Layout>
  );
}
