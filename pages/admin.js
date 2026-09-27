import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { ADMIN_IDS } from '../lib/admins';

export default function AdminPanel() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [formsActive, setFormsActive] = useState(true);
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [stats, setStats] = useState(null);

  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banPermanent, setBanPermanent] = useState(false);
  const [banMsg, setBanMsg] = useState('');

  const loadData = async () => {
    const res = await fetch('/api/admin/list');
    const data = await res.json();
    setBannedUsers(data.bannedUsers || []);
    setFormsActive(data.formsActive);
  };

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.total !== undefined) setStats(data);
  };

  useEffect(() => {
    const fetchAll = () => {
      loadData();
      loadStats();
      fetch('/api/announcement')
        .then(res => res.json())
        .then(data => {
          if (data.announcement) {
            setAnnouncement(data.announcement);
            setAnnouncementText(data.announcement);
          }
        })
        .catch(() => {});
    };

    fetchAll();
    const intervalId = setInterval(fetchAll, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUnban = async () => {
    if (!userId.trim()) return;
    const res = await fetch('/api/admin/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
    loadData();
  };

  const handleBan = async () => {
    if (!banUserId.trim()) {
      setBanMsg('⚠️ Введите Discord ID пользователя');
      return;
    }
    const res = await fetch('/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: banUserId,
        reason: banReason,
        username: 'Админ',
        permanent: banPermanent
      })
    });
    const data = await res.json();
    setBanMsg(data.message || data.error);
    loadData();
    setBanUserId('');
    setBanReason('');
    setBanPermanent(false);
  };

  const toggleForms = async () => {
    const res = await fetch('/api/admin/toggle-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: !formsActive })
    });
    const data = await res.json();
    setFormsActive(data.formsActive);
    loadData();
  };

  const saveAnnouncement = async () => {
    const res = await fetch('/api/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: announcementText })
    });
    const data = await res.json();
    setAnnouncementMsg(data.message || data.error);
    setAnnouncement(announcementText.trim());
  };

  const clearAnnouncement = async () => {
    const res = await fetch('/api/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });
    const data = await res.json();
    setAnnouncementMsg(data.message || data.error);
    setAnnouncementText('');
    setAnnouncement('');
  };

  return (
    <Layout>
      <div className="admin-container">
        <h1>Админка</h1>

        {/* 📊 Сервер логов бота */}
        <div className="section logs-section">
          <div className="logs-row">
            <div className="logs-info">
              <h2>📊 Сервер Логов Бота</h2>
              <p>Здесь хранятся все логи: заявки, банворды, автобаны, действия админов и ошибки бота.</p>
            </div>
            <a
              href="https://discord.gg/ce9x4WpSp"
              target="_blank"
              rel="noopener noreferrer"
              className="logs-btn"
            >
              <span className="logs-btn-icon">💬</span>
              Присоединиться
            </a>
          </div>
        </div>

        {/* Секция объявления */}
        <div className="section">
          <h2>📢 Глобальное уведомление</h2>
          <textarea
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            rows="3"
            placeholder="Введите текст объявления (например, 'Завтра формы закрыты с 12:00 до 14:00')"
            className="announcement-textarea"
          />
          <div className="announcement-actions">
            <button onClick={saveAnnouncement} className="save-announcement-btn">💾 Сохранить</button>
            {announcement && (
              <button onClick={clearAnnouncement} className="clear-announcement-btn">🗑️ Удалить</button>
            )}
          </div>
          {announcementMsg && <p className="announcement-msg">{announcementMsg}</p>}
        </div>

        {/* 🧪 TestLik — песочница */}
        <div className="section testlik-section">
          <div className="testlik-row">
            <div className="testlik-info">
              <h2>🧪 TestLik</h2>
              <p>Песочница для проверки всех функций FIB Forms в реальном времени.
              Отправка тестовых заявок в отдельный Discord-канал.</p>
            </div>
            <button
              className="testlik-btn"
              onClick={() => window.location.href = '/forms/testlik'}
            >
              🧪 Открыть TestLik →
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="section">
          <h2>📊 Статистика заявок</h2>
          {stats ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Всего заявок</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.today}</span>
                  <span className="stat-label">Сегодня</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.thisWeek}</span>
                  <span className="stat-label">За неделю</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.thisMonth}</span>
                  <span className="stat-label">За месяц</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.activeUsers}</span>
                  <span className="stat-label">Активных юзеров</span>
                </div>
              </div>
              {stats.types && Object.keys(stats.types).length > 0 && (
                <div className="types-stats">
                  <h3>По типам форм:</h3>
                  <ul>
                    {Object.entries(stats.types).map(([type, count]) => (
                      <li key={type}>{type}: <strong>{count}</strong></li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>Загрузка статистики...</p>
          )}
        </div>

        {/* Глобальное управление заявками */}
        <div className="section">
          <h2>Управление заявками</h2>
          <button onClick={toggleForms} className={formsActive ? 'stop-btn' : 'start-btn'}>
            {formsActive ? '🚫 Остановить ВСЕ заявки' : '✅ Возобновить ВСЕ заявки'}
          </button>
          <p className="status-text">
            Текущий статус: {formsActive ? '🟢 Заявки открыты' : '🔴 Заявки остановлены'}
          </p>
        </div>

        {/* Блокировка пользователя */}
        <div className="section">
          <h2>🚫 Заблокировать пользователя</h2>
          <input
            type="text"
            value={banUserId}
            onChange={(e) => setBanUserId(e.target.value)}
            placeholder="Discord ID пользователя"
          />
          <input
            type="text"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Причина (необязательно)"
            style={{ marginTop: '8px' }}
          />

          <label className="permanent-checkbox">
            <input
              type="checkbox"
              checked={banPermanent}
              onChange={(e) => setBanPermanent(e.target.checked)}
            />
            <span>🔒 Забанить навсегда (без срока)</span>
          </label>

          <button onClick={handleBan} className="ban-btn">
            {banPermanent ? '🔒 Забанить навсегда' : 'Заблокировать (7 дней)'}
          </button>
          {banMsg && <p className="status-msg">{banMsg}</p>}
        </div>

        {/* Разблокировка пользователя */}
        <div className="section">
          <h2>🔓 Разблокировать пользователя</h2>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Discord ID" />
          <button onClick={handleUnban}>Снять блокировку</button>
          {status && <p className="status-msg">{status}</p>}
        </div>

        {/* Список заблокированных */}
        <div className="section">
          <h2>📋 Список заблокированных</h2>
          <div className="banned-list">
            {bannedUsers.length === 0 ? (
              <p>Нет заблокированных пользователей.</p>
            ) : (
              bannedUsers.map(user => (
                <div key={user.userId} className="banned-item">
                  <div className="banned-item-left">
                    <span className="banned-id">
                      ID: {user.userId}
                      {user.username ? ` (${user.username})` : ''}
                    </span>
                    {user.permanent && <span className="permanent-badge">🔒 Навсегда</span>}
                  </div>
                  <span className="banned-reason">Причина: {user.reason}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 900px;
          margin: 0 auto;
        }
        .section {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 25px;
        }
        .section h2 {
          margin-bottom: 15px;
          font-size: 20px;
          color: #fff;
        }

        /* 📊 Сервер логов */
        .logs-section {
          background: linear-gradient(135deg, rgba(88, 101, 242, 0.15), rgba(114, 137, 218, 0.08));
          border: 1px solid rgba(88, 101, 242, 0.5);
          box-shadow: 0 8px 30px rgba(88, 101, 242, 0.2);
          position: relative;
          overflow: hidden;
        }
        .logs-section::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(88, 101, 242, 0.4), transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }
        .logs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .logs-info {
          flex: 1;
          min-width: 240px;
        }
        .logs-info h2 {
          margin-bottom: 8px;
          color: #fff;
          font-size: 20px;
        }
        .logs-info p {
          color: #b0b8e8;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
        }
        .logs-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 26px;
          background: linear-gradient(135deg, #5865F2, #7289DA);
          color: #fff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
          text-decoration: none;
          transition: all 0.3s;
          white-space: nowrap;
          box-shadow: 0 6px 22px rgba(88, 101, 242, 0.5);
        }
        .logs-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 34px rgba(88, 101, 242, 0.7);
        }
        .logs-btn:active {
          transform: translateY(-1px);
        }
        .logs-btn-icon {
          font-size: 18px;
        }

        /* 🧪 TestLik секция */
        .testlik-section {
          background: linear-gradient(135deg, rgba(88, 101, 242, 0.12), rgba(0, 229, 255, 0.08));
          border: 1px solid rgba(88, 101, 242, 0.4);
          box-shadow: 0 8px 30px rgba(88, 101, 242, 0.15);
          position: relative;
          overflow: hidden;
        }
        .testlik-section::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(0, 229, 255, 0.25), transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }
        .testlik-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .testlik-info {
          flex: 1;
          min-width: 240px;
        }
        .testlik-info h2 {
          margin-bottom: 8px;
          color: #fff;
          font-size: 20px;
        }
        .testlik-info p {
          color: #8898c8;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
        }
        .testlik-btn {
          padding: 14px 26px;
          background: linear-gradient(135deg, #5865F2, #00E5FF);
          color: #fff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
          transition: all 0.3s;
          font-family: inherit;
          margin: 0;
          white-space: nowrap;
          box-shadow: 0 6px 22px rgba(88, 101, 242, 0.45);
        }
        .testlik-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 34px rgba(0, 229, 255, 0.6);
        }
        .testlik-btn:active {
          transform: translateY(-1px);
        }

        .announcement-textarea {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          padding: 12px;
          font-size: 16px;
          resize: vertical;
        }
        .announcement-actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }
        .save-announcement-btn {
          background: #5865F2;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .clear-announcement-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .announcement-msg {
          margin-top: 10px;
          color: #4CAF50;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
        }
        .stat-value {
          display: block;
          font-size: 32px;
          font-weight: bold;
          color: #5865F2;
        }
        .stat-label {
          color: #aaa;
          font-size: 14px;
        }
        .types-stats { margin-top: 15px; }
        .types-stats h3 {
          color: #ccc;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .types-stats ul {
          list-style: none;
          padding: 0;
        }
        .types-stats li {
          background: rgba(255,255,255,0.05);
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 5px;
          color: #ccc;
        }
        .types-stats li strong { color: #fff; }

        input[type="text"] {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 8px;
          margin-bottom: 10px;
          box-sizing: border-box;
        }

        .permanent-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ff8080;
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0 14px;
          cursor: pointer;
          user-select: none;
        }
        .permanent-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #ff4444;
          margin: 0;
        }

        button {
          padding: 12px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
          margin-right: 10px;
        }
        .ban-btn {
          background: #f44336;
          color: white;
        }
        .ban-btn:hover { background: #d32f2f; }
        .stop-btn {
          background: #ff4444;
          color: white;
        }
        .start-btn {
          background: #4CAF50;
          color: white;
        }
        .status-text {
          margin-top: 10px;
          color: #aaa;
        }
        .status-msg {
          margin-top: 10px;
          color: #4CAF50;
        }
        .banned-list {
          max-height: 300px;
          overflow-y: auto;
        }
        .banned-item {
          background: rgba(255,255,255,0.05);
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          font-size: 14px;
          color: #ccc;
          flex-wrap: wrap;
        }
        .banned-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .banned-id { color: #ccc; }
        .permanent-badge {
          background: rgba(255, 60, 60, 0.2);
          border: 1px solid #ff4444;
          color: #ff8080;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .banned-reason {
          color: #aaa;
          font-size: 13px;
          text-align: right;
          flex: 1;
          min-width: 200px;
        }

        @media (max-width: 600px) {
          .logs-row {
            flex-direction: column;
            text-align: center;
          }
          .logs-btn {
            width: 100%;
            justify-content: center;
          }
          .testlik-row {
            flex-direction: column;
            text-align: center;
          }
          .testlik-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </Layout>
  );
}
