import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const DEPARTMENTS = [
  { id: 'ib',       name: 'IB (Intelligence Branch)' },
  { id: 'cid',      name: 'CID (Criminal Investigation Department)' },
  { id: 'fa',       name: 'FA (Free Agent)' },
  { id: 'hrt',      name: 'HRT (Hostage Rescue Team)' },
  { id: 'atf',      name: 'ATF (Anti Terrorism Force)' },
  { id: 'af',       name: 'AF (Air Force)' },
  { id: 'ocu',      name: 'OCU (Organized Crime Unit)' },
  { id: 'dea',      name: 'DEA (Drug Enforcement Administration)' },
  { id: 'fna',      name: 'FNA (Federal National Academy)' },
  { id: 'nsb',      name: 'NSB (National Security Branch)' },
  { id: 'trainee',  name: 'TR (Trainee)' },
  { id: 'director', name: 'Director' },
  { id: 'cod',      name: 'Chief Of Discipline' },
  { id: 'assh',     name: 'Assistance of Sheriff' }
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [department, setDepartment] = useState('');
  const [banned, setBanned] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const fetchSpamStatus = async () => {
    try {
      const res = await fetch('/api/spam-status');
      const data = await res.json();
      if (data.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft);
      if (data.isBanned !== undefined) setBanned(data.isBanned);
    } catch (e) {
      console.error('Ошибка при обновлении счётчика заявок:', e);
    }
  };

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.error) { setStatus(data.error); setLoading(false); return; }
        setUser(data.user);
        setNickname(data.nickname || '');
        setDepartment(data.department || '');
        setBanned(data.banned);
        setLoading(false);
      })
      .catch(() => { setStatus('Проблема загрузки профиля'); setLoading(false); });

    fetchSpamStatus();
    const id = setInterval(fetchSpamStatus, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const saveProfile = async () => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, department })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
  };

  if (loading) {
    return <Layout><div className="loading-line">ЗАГРУЗКА ПРОФИЛЯ...</div></Layout>;
  }

  const deptName = DEPARTMENTS.find(d => d.id === department)?.name || department || '—';

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">DOSSIER · PERSONAL FILE</div>
          <h1 className="ph-title">ПРОФИЛЬ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Ваша учётная запись в системе FIB Forms</p>
          <div className="ph-rule" />
        </header>

        {user && (
          <>
            {/* КАРТОЧКА АГЕНТА */}
            <section className="panel">
              <div className="panel-head">
                <span className="p-num">01</span>
                <h2 className="p-title">УДОСТОВЕРЕНИЕ</h2>
                <span className={`p-tag ${banned ? 'p-tag-danger' : 'p-tag-on'}`}>
                  {banned ? 'BLOCKED' : 'ACTIVE'}
                </span>
              </div>
              <div className="panel-body">
                <div className="id-card">
                  <div className="id-photo">
                    {user.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                        alt="Avatar"
                      />
                    ) : (
                      <div className="id-photo-empty">?</div>
                    )}
                  </div>

                  <div className="id-info">
                    <div className="id-row">
                      <span className="id-key">USERNAME</span>
                      <span className="id-val">{user.username}</span>
                    </div>
                    <div className="id-row">
                      <span className="id-key">DISCORD ID</span>
                      <span className="id-val id-mono">{user.id}</span>
                    </div>
                    <div className="id-row">
                      <span className="id-key">CALLSIGN</span>
                      <span className="id-val">{nickname || '—'}</span>
                    </div>
                    <div className="id-row">
                      <span className="id-key">DEPARTMENT</span>
                      <span className="id-val">{deptName}</span>
                    </div>
                    <div className="id-row">
                      <span className="id-key">STATUS</span>
                      <span className={`id-val id-status ${banned ? 'is-banned' : 'is-active'}`}>
                        {banned ? '⛔ ЗАБЛОКИРОВАН' : '✅ АКТИВЕН'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="quota">
                  <span className="quota-lbl">ДОСТУПНО ЗАЯВОК В ЧАС</span>
                  <span className="quota-val">{banned ? 0 : attemptsLeft}</span>
                  <span className="quota-max">/ 6</span>
                </div>
              </div>
            </section>

            {/* РЕДАКТИРОВАНИЕ */}
            <section className="panel">
              <div className="panel-head">
                <span className="p-num">02</span>
                <h2 className="p-title">РЕДАКТИРОВАНИЕ ДАННЫХ</h2>
                <span className="p-tag">EDIT</span>
              </div>
              <div className="panel-body">
                <div className="field-block">
                  <label className="lbl">Игровой ник (Имя Фамилия + Статик)</label>
                  <input
                    className="field"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Name Surname | 123456"
                  />
                </div>

                <div className="field-block">
                  <label className="lbl">Ваш отдел</label>
                  <select
                    className="field"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">-- НЕ ВЫБРАН --</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-solid btn-wide" onClick={saveProfile}>
                  💾 СОХРАНИТЬ ДАННЫЕ
                </button>

                {status && <p className="msg">{status}</p>}
              </div>
            </section>
          </>
        )}
      </div>

      <style jsx>{`
        .info { max-width: 800px; margin: 0 auto; }

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
          margin-bottom: 16px;
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
        .p-tag-on {
          color: #000;
          background: #fff;
          border-color: #fff;
        }
        .p-tag-danger {
          color: #ff8080;
          border-color: #553030;
        }

        .panel-body { padding: 22px; }

        /* ── УДОСТОВЕРЕНИЕ ── */
        .id-card {
          display: flex;
          gap: 22px;
          align-items: flex-start;
          padding: 20px;
          background: #060606;
          border: 1px solid #1a1a1a;
          margin-bottom: 20px;
        }
        .id-photo {
          flex: 0 0 110px;
          height: 110px;
          border: 1px solid #2a2a2a;
          overflow: hidden;
          background: #0a0a0a;
        }
        .id-photo img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(0.15) contrast(1.05);
        }
        .id-photo-empty {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-family: ui-monospace, monospace;
          font-size: 32px;
        }

        .id-info { flex: 1; min-width: 0; }
        .id-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 5px 0;
          border-bottom: 1px dashed #1a1a1a;
        }
        .id-row:last-child { border-bottom: none; }
        .id-key {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          min-width: 110px;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .id-val {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          word-break: break-word;
        }
        .id-mono {
          font-family: ui-monospace, monospace;
          letter-spacing: 0.5px;
          font-size: 13px;
        }
        .id-status.is-active { color: #8ee08e; }
        .id-status.is-banned { color: #ff8080; }

        /* ── КВОТА ── */
        .quota {
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 14px 18px;
          background: #060606;
          border: 1px solid #1a1a1a;
          font-family: ui-monospace, monospace;
        }
        .quota-lbl {
          flex: 1;
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          text-transform: uppercase;
        }
        .quota-val {
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          line-height: 1;
        }
        .quota-max {
          font-size: 12px;
          color: #555;
        }

        /* ── ПОЛЯ ── */
        .field-block { margin-bottom: 20px; }
        .lbl {
          display: block;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .lbl::before { content: '▸ '; color: #333; }
        .field {
          width: 100%;
          padding: 12px 14px;
          background: #060606;
          border: 1px solid #262626;
          color: #fff;
          border-radius: 0;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .field:focus { border-color: #fff; }
        .field::placeholder { color: #444; }
        select.field {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #666 50%),
                            linear-gradient(135deg, #666 50%, transparent 50%);
          background-position: calc(100% - 18px) center, calc(100% - 13px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          padding-right: 36px;
          cursor: pointer;
        }
        select.field option { background: #0c0c0c; color: #fff; }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
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
        .btn-solid {
          background: #fff;
          color: #000;
          border-color: #fff;
          font-weight: 800;
        }
        .btn-solid:hover { background: #ccc; border-color: #ccc; }
        .btn-wide { width: 100%; }

        .msg {
          margin-top: 12px;
          color: #4caf50;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.4px;
          text-align: center;
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
          .ph-title { font-size: 28px; letter-spacing: 2px; }
          .panel-body { padding: 16px; }
          .id-card { flex-direction: column; align-items: center; text-align: center; }
          .id-key { min-width: auto; }
          .id-row { flex-direction: column; gap: 4px; align-items: flex-start; }
          .id-key { display: block; }
        }
      `}</style>
    </Layout>
  );
}
