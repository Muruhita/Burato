import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const DEPT_SHORT = {
  ib: 'IB', cid: 'CID', fa: 'FA', hrt: 'HRT',
  atf: 'ATF', af: 'AF', ocu: 'OCU', dea: 'DEA',
  fna: 'FNA', nsb: 'NSB', trainee: 'TR',
  director: 'DIR', cod: 'COD', assh: 'ASS'
};

export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <Layout><div className="loading-line">ЗАГРУЗКА РЕЕСТРА...</div></Layout>;
  }

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">ROSTER · PERSONNEL FILE</div>
          <h1 className="ph-title">ЛИЧНЫЙ СОСТАВ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Реестр зарегистрированных сотрудников FIB Forms · {users.length} записей</p>
          <div className="ph-rule" />
        </header>

        {users.length === 0 ? (
          <section className="panel">
            <div className="panel-body center">
              <div className="empty-icon">//</div>
              <p className="muted">РЕЕСТР ПУСТ</p>
            </div>
          </section>
        ) : (
          <div className="roster">
            {users.map((user, i) => {
              const hasCustomImage = user.profileCustom?.type === 'image' && user.profileCustom?.url;
              const dept = DEPT_SHORT[user.department] || user.department || '—';
              return (
                <article
                  key={user.userId}
                  className="member"
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  {hasCustomImage && (
                    <div
                      className="member-bg"
                      style={{ backgroundImage: `url(${user.profileCustom.url})` }}
                    />
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
          .ph-title { font-size: 26px; letter-spacing: 2px; }
          .roster { grid-template-columns: 1fr; gap: 10px; }
          .member-inner { padding: 14px 14px 10px; }
          .member-foot { padding: 9px 14px; }
        }
      `}</style>
    </Layout>
  );
}
