import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';

const DEPT_SHORT = {
  ib: 'IB', cid: 'CID', fa: 'FA', hrt: 'HRT',
  atf: 'ATF', af: 'AF', ocu: 'OCU', dea: 'DEA',
  fna: 'FNA', nsb: 'NSB', trainee: 'TR',
  director: 'DIR', cod: 'COD', assh: 'ASS',
};

export default function AdminDuplicates() {
  const [data, setData] = useState({ duplicates: [], totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/duplicates')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalDupes = data.duplicates.reduce((s, g) => s + g.users.length, 0);

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">ADMIN · MULTI-ACCOUNT DETECTOR</div>
          <h1 className="ph-title">ДУБЛИ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">
            Игроки с одинаковым статиком в нике · {data.duplicates.length} групп, {totalDupes} аккаунтов
          </p>
          <div className="ph-rule" />
        </header>

        {loading ? (
          <div className="panel"><div className="panel-body center"><p className="muted">ЗАГРУЗКА...</p></div></div>
        ) : data.duplicates.length === 0 ? (
          <div className="panel">
            <div className="panel-body center">
              <div className="empty-icon">✓</div>
              <p className="muted">МУЛЬТИАККАУНТОВ НЕ НАЙДЕНО</p>
              <p className="muted small">Проверено ников: {data.totalUsers}</p>
            </div>
          </div>
        ) : (
          <div className="groups">
            {data.duplicates.map((g, i) => (
              <section key={g.staticId} className="panel" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="panel-head">
                  <span className="p-num">#{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="p-title">СТАТИК {g.staticId}</h2>
                  <span className="p-tag p-tag-danger">{g.users.length} АККАУНТА</span>
                </div>
                <div className="panel-body no-pad">
                  {g.users.map(u => (
                    <div key={u.userId} className="dupe-row">
                      <div className="dr-avatar">
                        <img
                          src={`https://cdn.discordapp.com/avatars/${u.userId}/0.png`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          alt=""
                        />
                      </div>
                      <div className="dr-info">
                        <div className="dr-nick">{u.nickname || 'Не указан'}</div>
                        <div className="dr-user">@{u.username || 'unknown'} · ID {u.userId}</div>
                      </div>
                      <span className="dr-dept">[{DEPT_SHORT[u.department] || u.department || '—'}]</span>
                      {u.banned && <span className="dr-badge">⛔ БАН</span>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .info { max-width: 900px; margin: 0 auto; }
        .page-head { margin-bottom: 24px; }
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

        .panel { background: #0c0c0c; border: 1px solid #1f1f1f; margin-bottom: 14px; }
        .panel-head {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 18px; border-bottom: 1px solid #1f1f1f; background: #0a0a0a;
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
        .p-tag-danger { color: #ff8080; border-color: #553030; }

        .panel-body.no-pad { padding: 0; }
        .panel-body.center { padding: 60px 20px; text-align: center; }
        .empty-icon {
          font-family: ui-monospace, monospace; font-size: 32px;
          color: #4caf50; letter-spacing: 6px; margin-bottom: 12px;
        }
        .muted {
          color: #666; font-family: ui-monospace, monospace; font-size: 11px;
          letter-spacing: 2.4px; margin: 0; text-transform: uppercase;
        }
        .muted.small { font-size: 9.5px; margin-top: 8px; color: #444; }

        .dupe-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 18px; border-bottom: 1px solid #1a1a1a;
        }
        .dupe-row:last-child { border-bottom: none; }
        .dr-avatar {
          width: 34px; height: 34px; border: 1px solid #2a2a2a;
          background: #060606; overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: ui-monospace, monospace; font-size: 14px; color: #333;
        }
        .dr-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .dr-info { flex: 1; min-width: 0; }
        .dr-nick { color: #fff; font-size: 13.5px; font-weight: 600; }
        .dr-user {
          color: #777; font-family: ui-monospace, monospace;
          font-size: 10.5px; margin-top: 2px;
        }
        .dr-dept {
          font-family: ui-monospace, monospace; font-size: 11px;
          color: #ccc; padding: 3px 8px; border: 1px solid #2a2a2a;
        }
        .dr-badge {
          font-family: ui-monospace, monospace; font-size: 9px;
          color: #ff8080; border: 1px solid #553030;
          padding: 3px 7px; letter-spacing: 1.4px;
        }

        @media (max-width: 640px) {
          .dupe-row { flex-wrap: wrap; }
          .dr-dept, .dr-badge { margin-left: auto; }
        }
      `}</style>
    </Layout>
  );
}
