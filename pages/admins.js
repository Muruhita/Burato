// pages/admins.js  ← ФРОНТ! Тут только React!
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const DEPARTMENTS_NAMES = {
  'ib': 'IB',
  'cid': 'CID',
  'fa': 'FA',
  'hrt': 'HRT',
  'atf': 'ATF',
  'af': 'AF',
  'ocu': 'OCU',
  'dea': 'DEA',
  'fna': 'FNA',
  'nsb': 'NSB',
  'trainee': 'Trainee',
  'director': 'Director',
  'cod': 'Chief of Discipline',
  'assh': 'Ass. Sheriff'
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
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка админов...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="page-title"> Админчики</h1>

      {admins.length === 0 ? (
        <p className="empty-text">Список админов пуст.</p>
      ) : (
        <div className="admins-grid">
          {admins.map(admin => {
            let cardStyle = {
              background: 'linear-gradient(135deg, #271A3D, #5452AB)',
              border: '2px solid #6E038F'
            };

            if (admin.profileCustom) {
              if (admin.profileCustom.type === 'preset') {
                const presets = {
                  default: { background: '#7670FF', border: '1px solid #42186E' },
                  blue: { background: 'linear-gradient(135deg, #3C5875, #7670FF)', border: '1px solid #42186E' },
                  purple: { background: 'linear-gradient(135deg, #3C5875, #7670FF)', border: '1px solid #42186E' },
                  green: { background: 'linear-gradient(135deg, #3C5875, #7670FF)', border: '1px solid #42186E' }
                };
                cardStyle = presets[admin.profileCustom.presetId] || cardStyle;
              } else if (admin.profileCustom.type === 'image' && admin.profileCustom.url) {
                cardStyle = {
                  backgroundImage: `url(${admin.profileCustom.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid #fff'
                };
              }
            }

            return (
              <div key={admin.userId} className="admin-card" style={cardStyle}>
                <div className="admin-avatar-container">
                  {admin.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${admin.userId}/${admin.avatar}.png`}
                      alt="Avatar"
                      className="admin-avatar"
                    />
                  ) : (
                    <div className="admin-avatar-placeholder">🛡️</div>
                  )}
                </div>

                <div className="admin-crown">👑</div>

                <h3>{admin.nickname}</h3>
                <p className="admin-username">@{admin.username}</p>

                <div className="admin-info">
                  <span className="admin-department">
                     {DEPARTMENTS_NAMES[admin.department] || admin.department}
                  </span>
                  <span className="admin-status">Администратор</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .page-title {
          font-size: 32px;
          margin-bottom: 30px;
          text-align: center;
          color: #fff;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        .admins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin-card {
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          color: #fff;
          position: relative;
          overflow: hidden;
          min-height: 240px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .admin-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.5);
        }
        .admin-avatar-container {
          margin-bottom: 15px;
          position: relative;
        }
        .admin-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.7);
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
        }
        .admin-avatar-placeholder {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          border: 3px solid rgba(255,255,255,0.7);
        }
        .admin-crown {
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 26px;
          filter: drop-shadow(0 2px 5px rgba(0,0,0,0.6));
          animation: crownFloat 3s ease-in-out infinite;
        }
        @keyframes crownFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-8deg); }
        }
        h3 {
          font-size: 20px;
          margin-bottom: 5px;
          text-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }
        .admin-username {
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          margin-bottom: 12px;
        }
        .admin-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 10px;
        }
        .admin-department {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
        }
        .admin-status {
          background: rgba(59, 130, 246, 0.5);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .empty-text {
          text-align: center;
          color: #888;
          font-size: 18px;
          margin-top: 50px;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
