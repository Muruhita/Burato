import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Hosting() {
  const router = useRouter();

  const hosts = [
    { name: 'Дроп',       url: 'https://dropmefiles.com' },
    { name: 'Япикс',      url: 'https://yapx.ru/upload' },
    { name: 'Фотора',     url: 'https://fotora.ru' },
    { name: 'Гугл Диск',  url: 'https://drive.google.com/drive/' },
    { name: 'Imgur',      url: 'https://imgur.com/upload' },
    { name: 'Imgbb',      url: 'https://ru.imgbb.com' },
    { name: 'Яндекс Диск', url: 'https://disk.yandex.ru/client/recent' },
    { name: 'Pixsafe',    url: 'https://pixsafe.online' },
    { name: 'Pixhost',    url: 'https://pixhost.to' },
  ];

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">REF · HOSTING · INDEX</div>
          <h1 className="ph-title">ФОТОХОСТИНГИ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Список доверенных сервисов для загрузки скриншотов</p>
          <div className="ph-rule" />
        </header>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">СЕРВИСЫ</h2>
            <span className="p-tag">{hosts.length} ИСТОЧНИКОВ</span>
          </div>
          <div className="panel-body no-pad">
            <div className="hosts">
              {hosts.map((host, i) => (
                <a
                  key={i}
                  href={host.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="host-row"
                >
                  <span className="h-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-name">{host.name}</span>
                  <span className="h-dots" />
                  <span className="h-url">{host.url.replace(/^https?:\/\//, '')}</span>
                  <span className="h-arrow">→</span>
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
        .hosts { display: flex; flex-direction: column; }

        .host-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #1a1a1a;
          color: #eaeaea;
          text-decoration: none;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          transition: all 0.18s;
        }
        .host-row:last-child { border-bottom: none; }
        .host-row:hover {
          background: #fff;
          color: #000;
        }
        .host-row:hover .h-url,
        .host-row:hover .h-idx,
        .host-row:hover .h-dots { color: #000; }
        .host-row:hover .h-dots {
          background: repeating-linear-gradient(
            90deg, #999 0px, #999 3px,
            transparent 3px, transparent 6px
          );
        }

        .h-idx {
          color: #555;
          letter-spacing: 2px;
          font-size: 10px;
          flex-shrink: 0;
        }
        .h-name {
          font-weight: 700;
          letter-spacing: 0.4px;
          font-family: -apple-system, sans-serif;
          font-size: 14px;
          flex-shrink: 0;
        }
        .h-dots {
          flex: 1;
          height: 1px;
          background: repeating-linear-gradient(
            90deg, #2a2a2a 0px, #2a2a2a 3px,
            transparent 3px, transparent 6px
          );
          transition: background 0.18s;
        }
        .h-url {
          color: #888;
          font-size: 11px;
          letter-spacing: 0.4px;
          flex-shrink: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 220px;
        }
        .h-arrow {
          color: #fff;
          font-size: 14px;
          flex-shrink: 0;
        }
        .host-row:hover .h-arrow { transform: translateX(4px); }

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

        @media (max-width: 640px) {
          .ph-title { font-size: 26px; letter-spacing: 2px; }
          .host-row { padding: 12px 14px; gap: 8px; }
          .h-name { font-size: 13px; }
          .h-url { max-width: 100px; font-size: 10px; }
        }
      `}</style>
    </Layout>
  );
}
