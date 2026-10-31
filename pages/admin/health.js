import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';

export default function AdminHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/health')
      .then(r => r.json())
      .then(d => { setData(d); setError(null); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">OPS · SYSTEM HEALTH</div>
          <h1 className="ph-title">ДИАГНОСТИКА<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Проверка env-переменных, Redis и Discord API</p>
          <div className="ph-rule" />
        </header>

        <div className="actions">
          <button className="btn btn-solid" onClick={load} disabled={loading}>
            {loading ? '⏳ ПРОВЕРКА...' : '↻ ОБНОВИТЬ'}
          </button>
          {data && (
            <span className="last-check">
              Последняя проверка: {new Date(data.timestamp).toLocaleTimeString('ru-RU')}
            </span>
          )}
        </div>

        {error && (
          <div className="panel panel-danger">
            <div className="panel-body"><p className="muted-red">❌ {error}</p></div>
          </div>
        )}

        {data && (
          <>
            {/* SERVICES */}
            <section className="panel">
              <div className="panel-head">
                <span className="p-num">01</span>
                <h2 className="p-title">СЕРВИСЫ</h2>
              </div>
              <div className="panel-body no-pad">
                <StatusRow
                  name="Redis"
                  ok={data.redis.ok}
                  detail={
                    data.redis.ok
                      ? `PONG · ${data.redis.latency}ms · ${data.redis.keys} ключей`
                      : data.redis.error
                  }
                />
                <StatusRow
                  name="Discord Bot API"
                  ok={data.discord.ok}
                  detail={
                    data.discord.ok
                      ? `@${data.discord.botName} · ${data.discord.latency}ms`
                      : data.discord.error
                  }
                />
                <StatusRow
                  name="Node.js"
                  ok={true}
                  detail={data.node}
                />
                <StatusRow
                  name="NODE_ENV"
                  ok={true}
                  detail={data.env_mode}
                />
              </div>
            </section>

            {/* ENV */}
            <section className="panel">
              <div className="panel-head">
                <span className="p-num">02</span>
                <h2 className="p-title">ENV-ПЕРЕМЕННЫЕ</h2>
                <span className="p-tag">
                  {data.env.filter(e => e.set).length} / {data.env.length}
                </span>
              </div>
              <div className="panel-body no-pad">
                {data.env.map(e => (
                  <div key={e.key} className="env-row">
                    <span className={`env-icon ${e.set ? 'env-on' : (e.required ? 'env-off-req' : 'env-off')}`}>
                      {e.set ? '✓' : '✕'}
                    </span>
                    <span className="env-key">{e.key}</span>
                    {e.required && <span className="env-badge">ОБЯЗАТЕЛЬНА</span>}
                    <span className={`env-status ${e.set ? 'st-ok' : (e.required ? 'st-err' : 'st-warn')}`}>
                      {e.set ? 'ЗАДАНА' : (e.required ? 'ОТСУТСТВУЕТ' : 'НЕ ЗАДАНА')}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* EXPORT */}
            <section className="panel">
              <div className="panel-head">
                <span className="p-num">03</span>
                <h2 className="p-title">ЭКСПОРТ ДАННЫХ</h2>
                <span className="p-tag">CSV</span>
              </div>
              <div className="panel-body">
                <div className="export-grid">
                  <a href="/api/admin/export?type=banned" className="export-btn">
                    ⬇ БАНЫ
                  </a>
                  <a href="/api/admin/export?type=users" className="export-btn">
                    ⬇ ЮЗЕРЫ
                  </a>
                  <a href="/api/admin/export?type=audit" className="export-btn">
                    ⬇ АУДИТ
                  </a>
                  <a href="/api/admin/export?type=stats" className="export-btn">
                    ⬇ СТАТИСТИКА
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <style jsx>{`
        .info { max-width: 860px; margin: 0 auto; }
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

        .actions {
          display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .last-check {
          font-family: ui-monospace, monospace; font-size: 10.5px;
          letter-spacing: 1.4px; color: #666;
        }
        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 16px; background: transparent; border: 1px solid #333;
          color: #ccc; cursor: pointer; font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .btn:hover:not(:disabled) { background: #fff; border-color: #fff; color: #000; }
        .btn:disabled { opacity: 0.5; cursor: wait; }
        .btn-solid { background: #fff; color: #000; border-color: #fff; font-weight: 800; }

        .panel {
          background: #0c0c0c; border: 1px solid #1f1f1f;
          margin-bottom: 12px; animation: cardIn 0.4s ease;
        }
        .panel-danger { border-color: #3a1a1a; }
        .panel-head {
          display: flex; align-items: center; gap: 12px; padding: 11px 18px;
          border-bottom: 1px solid #1f1f1f; background: #0a0a0a;
        }
        .p-num {
          font-family: ui-monospace, monospace; font-size: 11px;
          letter-spacing: 2px; color: #666; font-weight: 700;
        }
        .p-title {
          font-size: 12px; font-weight: 800; letter-spacing: 2.4px;
          color: #fff; margin: 0; text-transform: uppercase; flex: 1;
        }
        .p-tag {
          font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 2px;
          color: #666; border: 1px solid #2a2a2a; padding: 2px 8px;
        }
        .panel-body { padding: 14px 18px; }
        .panel-body.no-pad { padding: 0; }

        .muted-red {
          color: #ff8080; font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 1.2px; margin: 0;
        }

        .env-row {
          display: flex; align-items: center; gap: 12px; padding: 10px 18px;
          border-bottom: 1px solid #1a1a1a; font-family: ui-monospace, monospace;
          font-size: 12px;
        }
        .env-row:last-child { border-bottom: none; }
        .env-icon {
          width: 22px; height: 22px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid; border-radius: 50%; font-size: 11px; font-weight: 900;
        }
        .env-on { color: #8ee08e; border-color: #2a5a2a; }
        .env-off { color: #666; border-color: #2a2a2a; }
        .env-off-req { color: #ff8080; border-color: #553030; }
        .env-key { flex: 1; color: #fff; letter-spacing: 0.5px; }
        .env-badge {
          font-size: 9px; letter-spacing: 1.4px; padding: 2px 7px;
          color: #888; border: 1px solid #2a2a2a; text-transform: uppercase;
        }
        .env-status {
          font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase;
          flex-shrink: 0;
        }
        .st-ok { color: #8ee08e; }
        .st-err { color: #ff8080; }
        .st-warn { color: #888; }

        .export-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
        }
        .export-btn {
          padding: 12px; text-align: center;
          background: #060606; border: 1px solid #2a2a2a; color: #ccc;
          text-decoration: none; font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .export-btn:hover { background: #fff; border-color: #fff; color: #000; }

        @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .ph-title { font-size: 28px; letter-spacing: 2px; }
          .env-row { padding: 8px 14px; font-size: 11px; }
          .env-badge { display: none; }
        }
      `}</style>
    </Layout>
  );
}

function StatusRow({ name, ok, detail }) {
  return (
    <div className="env-row">
      <span className={`env-icon ${ok ? 'env-on' : 'env-off-req'}`}>{ok ? '✓' : '✕'}</span>
      <span className="env-key">{name}</span>
      <span className="env-status" style={{ color: ok ? '#8ee08e' : '#ff8080' }}>
        {detail}
      </span>
    </div>
  );
}
