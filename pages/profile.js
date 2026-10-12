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

const PRESETS = [
  { id: 'default', label: 'Стандарт',  color: '#161616' },
  { id: 'blue',    label: 'Синий',     color: '#3b82f6' },
  { id: 'purple',  label: 'Фиолетовый',color: '#a855f7' },
  { id: 'green',   label: 'Зелёный',   color: '#10b981' }
];

const PRESET_STYLES = {
  default: { background: '#161616', border: '1px solid #333' },
  blue:    { background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', border: '1px solid #3b82f6' },
  purple:  { background: 'linear-gradient(135deg, #4c1d95, #a855f7)', border: '1px solid #a855f7' },
  green:   { background: 'linear-gradient(135deg, #065f46, #10b981)', border: '1px solid #10b981' }
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [department, setDepartment] = useState('');
  const [custom, setCustom] = useState({ type: 'preset', presetId: 'default' });
  const [customImageUrl, setCustomImageUrl] = useState('');
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
        if (data.profileCustom) {
          setCustom(data.profileCustom);
          if (data.profileCustom.type === 'image') {
            setCustomImageUrl(data.profileCustom.url || '');
          }
        }
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

  const saveCustom = async () => {
    const payload = custom.type === 'image'
      ? { type: 'image', url: customImageUrl.trim() }
      : { type: 'preset', presetId: custom.presetId };

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileCustom: payload })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
  };

  const resetCustom = async () => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileCustom: null })
    });
    const data = await res.json();
    setStatus(data.message || data.error);
    setCustom({ type: 'preset', presetId: 'default' });
    setCustomImageUrl('');
  };

  if (loading) {
    return <Layout><div className="loading-line">ЗАГРУЗКА ПРОФИЛЯ...</div></Layout>;
  }

  const deptName = DEPARTMENTS.find(d => d.id === department)?.name || department || '—';

  const previewStyle = custom.type === 'image' && customImageUrl
    ? {
        backgroundImage: `url(${customImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid #fff'
      }
    : PRESET_STYLES[custom.presetId] || PRESET_STYLES.default;

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">DOSSIER · PERSONAL FILE</div>
          <h1 className="ph-title">ПРОФИЛЬ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Ваша учётная запись и внешний вид карточки</p>
          <div className="ph-rule" />
        </header>

        {user && (
          <>
            {/* 01 · УДОСТОВЕРЕНИЕ */}
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

            {/* 02 · РЕДАКТИРОВАНИЕ */}
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
              </div>
            </section>

            {/* 03 · КАСТОМИЗАЦИЯ */}
            <section className="panel">
              <div className="panel-head">
                <span className="p-num">03</span>
                <h2 className="p-title">КАСТОМИЗАЦИЯ КАРТОЧКИ</h2>
                <span className="p-tag">VISUAL</span>
              </div>
              <div className="panel-body">
                <div className="custom-grid">
                  {/* Левая колонка — настройки */}
                  <div className="custom-form">
                    <label className="lbl">Пресет</label>
                    <div className="preset-row">
                      {PRESETS.map(p => (
                        <button
                          key={p.id}
                          className={`preset-btn ${custom.type === 'preset' && custom.presetId === p.id ? 'active' : ''}`}
                          onClick={() => setCustom({ type: 'preset', presetId: p.id })}
                        >
                          <span className="preset-swatch" style={{ background: p.color }} />
                          <span className="preset-label">{p.label}</span>
                        </button>
                      ))}
                    </div>

                    <label className="lbl" style={{ marginTop: 18 }}>Или URL картинки</label>
                    <input
                      className="field"
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => {
                        setCustomImageUrl(e.target.value);
                        if (e.target.value.trim()) {
                          setCustom({ type: 'image', url: e.target.value.trim() });
                        }
                      }}
                      placeholder="https://i.ibb.co/..."
                    />

                    <div className="row">
                      <button className="btn btn-solid" onClick={saveCustom}>💾 СОХРАНИТЬ КАСТОМ</button>
                      <button className="btn btn-danger" onClick={resetCustom}>✕ СБРОСИТЬ</button>
                    </div>
                  </div>

                  {/* Правая колонка — превью */}
                  <div className="custom-preview-wrap">
                    <label className="lbl">Превью</label>
                    <div className="card-preview" style={previewStyle}>
                      <div className="cp-avatar">
                        {user.avatar ? (
                          <img
                            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                            alt=""
                          />
                        ) : (
                          <div className="cp-avatar-empty">?</div>
                        )}
                      </div>
                      <div className="cp-nick">{nickname || 'Ваш ник'}</div>
                      <div className="cp-user">@{user.username}</div>
                      <div className="cp-dept">[{deptName.split(' ')[0]}]</div>
                    </div>
                  </div>
                </div>

                {status && <p className="msg">{status}</p>}
              </div>
            </section>
          </>
        )}
      </div>

      <style jsx>{`
        .info { max-width: 900px; margin: 0 auto; }

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
        .p-tag-on { color: #000; background: #fff; border-color: #fff; }
        .p-tag-danger { color: #ff8080; border-color: #553030; }

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
        .btn-danger { color: #ff8080; border-color: #553030; }
        .btn-danger:hover { background: #ff4444; border-color: #ff4444; color: #fff; }
        .btn-wide { width: 100%; }

        .row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }

        .msg {
          margin-top: 12px;
          color: #4caf50;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.4px;
          text-align: center;
        }

        /* ── КАСТОМИЗАЦИЯ ── */
        .custom-grid {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .custom-grid { grid-template-columns: 1fr; }
        }

        .custom-form { min-width: 0; }

        .preset-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .preset-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #060606;
          border: 1px solid #262626;
          color: #ccc;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          transition: all 0.18s;
        }
        .preset-btn:hover {
          border-color: #555;
          color: #fff;
        }
        .preset-btn.active {
          background: #fff;
          border-color: #fff;
          color: #000;
        }
        .preset-swatch {
          width: 18px;
          height: 18px;
          border: 1px solid rgba(255,255,255,0.2);
          flex-shrink: 0;
        }
        .preset-btn.active .preset-swatch {
          border-color: #000;
        }
        .preset-label { flex: 1; text-align: left; }

        .custom-preview-wrap { min-width: 0; }

        .card-preview {
          border-radius: 12px;
          padding: 18px 14px;
          text-align: center;
          color: #fff;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.25s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .cp-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.5);
          background: #0a0a0a;
          margin-bottom: 8px;
          flex-shrink: 0;
        }
        .cp-avatar img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .cp-avatar-empty {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ui-monospace, monospace;
          font-size: 22px;
          color: #555;
        }
        .cp-nick {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.2px;
          text-shadow: 0 2px 5px rgba(0,0,0,0.6);
        }
        .cp-user {
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          color: rgba(255,255,255,0.75);
        }
        .cp-dept {
          margin-top: 8px;
          padding: 3px 10px;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          font-family: ui-monospace, monospace;
          font-size: 9.5px;
          letter-spacing: 1.4px;
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
        }
      `}</style>
    </Layout>
  );
}
