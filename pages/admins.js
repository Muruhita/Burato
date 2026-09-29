import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const DEPT_SHORT = {
  ib: 'IB', cid: 'CID', fa: 'FA', hrt: 'HRT',
  atf: 'ATF', af: 'AF', ocu: 'OCU', dea: 'DEA',
  fna: 'FNA', nsb: 'NSB', trainee: 'TR',
  director: 'DIRECTOR', cod: 'COD', assh: 'ASS.SHERIFF'
};

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admins')
      .then(res => res.json())
      .then(data => {
        if (data.admins) setAdmins(data.admins);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <Layout><div className="loading-line">ЗАГРУЗКА СОСТАВА...</div></Layout>;
  }

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">COMMAND · OFFICIAL ROSTER</div>
          <h1 className="ph-title">КОМАНДОВАНИЕ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Официальный состав администрации FIB Forms · {admins.length} человек</p>
          <div className="ph-rule" />
        </header>

        {admins.length === 0 ? (
          <section className="panel">
            <div className="panel-body center">
              <div className="empty-icon">//</div>
              <p className="muted">СПИСОК ПУСТ</p>
            </div>
          </section>
        ) : (
          <div className="admins">
            {admins.map((admin, i) => {
              const hasCustomImage = admin.profileCustom?.type === 'image' && admin.profileCustom?.url;
              const dept = DEPT_SHORT[admin.department] || admin.department || '—';
              return (
                <article
                  key={admin.userId}
                  className="admin"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  {hasCustomImage && (
                    <div
                      className="admin-bg"
                      style={{ backgroundImage: `url(${admin.profileCustom.url})` }}
                    />
                  )}

                  <div className="admin-crown">◆</div>

                  <div className="admin-avatar">
                    {admin.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${admin.userId}/${admin.avatar}.png`}
                        alt=""
                      />
                    ) : (
                      <div className="admin-avatar-empty">?</div>
                    )}
                  </div>

                  <div className="admin-nick">{admin.nickname}</div>
                  <div className="admin-user">@{admin.username}</div>

                  <div className="admin-foot">
                    <span className="a-dept">{dept}</span>
                    <span className="a-role">ADMIN</span>
                  </div>

                  <span className="corner corner-tl" />
                  <span className="corner corner-tr" />
                  <span className="corner corner-bl" />
                  <span className="corner corner-br" />
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

        .admins {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
        }

        .admin {
          position: relative;
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          padding: 26px 20px 0;
          text-align: center;
          overflow: hidden;
          transition: all 0.22s ease;
          opacity: 0;
          animation: cardIn 0.45s ease forwards;
        }
        .admin:hover {
          border-color: #fff;
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.55), 0 0 0 1px #fff;
        }

        .admin-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0.14;
          filter: grayscale(1);
          pointer-events: none;
          transition: opacity 0.22s;
        }
        .admin:hover .admin-bg { opacity: 0.26; }

        .admin-crown {
          position: absolute;
          top: 14px;
          right: 16px;
          color: #fff;
          font-size: 12px;
          line-height: 1;
          opacity: 0.7;
          transition: opacity 0.22s;
        }
        .admin:hover .admin-crown { opacity: 1; }

        .admin-avatar {
          position: relative;
          width: 84px; height: 84px;
          margin: 0 auto 16px;
          border: 1px solid #2a2a2a;
          overflow: hidden;
          background: #060606;
          transition: border-color 0.22s;
        }
        .admin:hover .admin-avatar { border-color: #fff; }
        .admin-avatar img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(0.3);
          transition: filter 0.22s;
        }
        .admin:hover .admin-avatar img { filter: grayscale(0); }
        .admin-avatar-empty {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-family: ui-monospace, monospace;
          font-size: 30px;
        }

        .admin-nick {
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.3px;
          margin-bottom: 4px;
          position: relative;
        }
        .admin-user {
          color: #888;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
          position: relative;
        }

        .admin-foot {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 11px 0;
          border-top: 1px solid #1a1a1a;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          position: relative;
          transition: border-color 0.22s;
        }
        .admin:hover .admin-foot { border-top-color: #2a2a2a; }
        .a-dept {
          color: #ccc;
          border: 1px solid #2a2a2a;
          padding: 2px 8px;
        }
        .a-role {
          color: #000;
          background: #fff;
          padding: 2px 8px;
          font-weight: 800;
        }

        /* Угловые метки */
        .corner {
          position: absolute;
          width: 8px; height: 8px;
          border-color: #333;
          border-style: solid;
          border-width: 0;
          pointer-events: none;
          transition: border-color 0.22s;
        }
        .admin:hover .corner { border-color: #fff; }
        .corner-tl { top: 6px;  left: 6px;  border-top-width: 1px; border-left-width: 1px; }
        .corner-tr { top: 6px;  right: 6px; border-top-width: 1px; border-right-width: 1px; }
        .corner-bl { bottom: 6px; left: 6px;  border-bottom-width: 1px; border-left-width: 1px; }
        .corner-br { bottom: 6px; right: 6px; border-bottom-width: 1px; border-right-width: 1px; }

        .panel {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
        }
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
          .ph-title { font-size: 24px; letter-spacing: 2px; }
          .admins { grid-template-columns: 1fr 1fr; gap: 10px; }
          .admin { padding: 20px 12px 0; }
          .admin-avatar { width: 64px; height: 64px; }
          .admin-nick { font-size: 13px; }
          .admin-user { font-size: 10px; }
          .admin-foot { font-size: 9px; letter-spacing: 1px; gap: 5px; }
        }
        @media (max-width: 400px) {
          .admins { grid-template-columns: 1fr; }
        }
      `}</style>
    </Layout>
  );
}
