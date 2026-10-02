import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
// import { ADMIN_IDS } from '../../lib/admins';

const RANK_OPTIONS = [
  '1-2 ранг', '2-3 ранг', '3-4 ранг', '4-5 ранг', '5-6 ранг',
  '6-7 ранг', '7-8 ранг', '8-9 ранг', '9-10 ранг', '10-11 ранг',
  '11-12 ранг', '12-13 ранг', '13-14 ранг', '14-15 ранг'
];

export default function HighRankReportForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  const [formData, setFormData] = useState({ fullName: '', rankRange: '', workLink: '' });
  const [conditions, setConditions] = useState('');
  const [editConditions, setEditConditions] = useState(false);
  const [tempConditions, setTempConditions] = useState('');
  const [conditionStatus, setConditionStatus] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(res => res.json()),
      fetch('/api/profile').then(res => res.json()),
      fetch('/api/promotion-conditions').then(res => res.json())
    ]).then(([meData, profileData, conditionsData]) => {
      if (!meData.user) { router.push('/'); return; }
      setUser(meData.user);
      setIsAdmin(!!meData.isAdmin);
      if (profileData.nickname) setFormData(prev => ({ ...prev, fullName: profileData.nickname }));
      if (profileData.banned) {
        setBanned(true);
        setBanReason(profileData.banReason || 'Ваш доступ к системе заявок заблокирован.');
        setBanUntil(profileData.banUntil || null);
      }
      if (conditionsData.content) {
        setConditions(conditionsData.content);
        setTempConditions(conditionsData.content);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'highrank',
          fullName: formData.fullName,
          rankRange: formData.rankRange,
          workLink: formData.workLink
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 1400);
        return;
      }
      if (res.status === 403) {
        const err = await res.json();
        if (err.banned) {
          setBanned(true);
          setBanReason(err.reason || 'Ваш доступ к системе заявок заблокирован.');
          setBanUntil(err.until || null);
          setSubmitting(false);
          return;
        }
        throw new Error(err.error || 'Доступ запрещён');
      }
      const err = await res.json();
      throw new Error(err.error || 'Ошибка');
    } catch (error) {
      alert('❌ ' + error.message);
      setSubmitting(false);
    }
  };

  const saveConditions = async () => {
    const res = await fetch('/api/promotion-conditions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: tempConditions })
    });
    const data = await res.json();
    if (data.message) {
      setConditions(tempConditions);
      setEditConditions(false);
      setConditionStatus('✅ СОХРАНЕНО');
      setTimeout(() => setConditionStatus(''), 2000);
    } else {
      setConditionStatus('❌ ' + (data.error || 'ОШИБКА'));
    }
  };

  if (loading) {
    return <Layout><div className="loading-line">ЗАГРУЗКА ДАННЫХ...</div></Layout>;
  }

  return (
    <Layout>
      <div className="form-page-wide">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>

        <div className="split">
          {/* ЛЕВО: ФОРМА */}
          <div className="form-shell">
            <header className="form-head">
              <div className="fh-stamp">FORM-004 · HIGH-RANK</div>
              <h1 className="fh-title">Отчёт на повышение HR</h1>
              <p className="fh-sub">
                Отчёт для Dep.Head и выше. Приложите ссылку на проделанную работу.
              </p>
              <div className="fh-rule" />
            </header>

            <form onSubmit={handleSubmit} className="form-body">
              <div className="field-block">
                <label className="lbl">Имя Фамилия + Статик</label>
                <input
                  className="field"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Name Surname 123456"
                />
              </div>

              <div className="field-block">
                <label className="lbl">С какого на какой ранг</label>
                <select
                  className="field"
                  required
                  value={formData.rankRange}
                  onChange={(e) => setFormData({ ...formData, rankRange: e.target.value })}
                >
                  <option value="">-- ВЫБЕРИТЕ ДИАПАЗОН --</option>
                  {RANK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="field-block">
                <label className="lbl">Ссылка на проделанную работу</label>
                <textarea
                  className="field"
                  required
                  value={formData.workLink}
                  onChange={(e) => setFormData({ ...formData, workLink: e.target.value })}
                  rows="5"
                  placeholder="https://..."
                />
              </div>

              <div className="field-block">
                <label className="lbl">Discord (автоматически)</label>
                <input
                  className="field"
                  type="text"
                  value={`${user.username} (${user.id})`}
                  disabled
                  style={{ opacity: 0.45, cursor: 'not-allowed' }}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting || success || banned}>
                {submitting
                  ? <><span className="btn-spinner" /> ОТПРАВКА...</>
                  : banned
                    ? '🚫 ДОСТУП ЗАБЛОКИРОВАН'
                    : '→ ОТПРАВИТЬ ОТЧЁТ'}
              </button>
            </form>
          </div>

          {/* ПРАВО: УСЛОВИЯ */}
          <aside className="conditions">
            <div className="cond-head">
              <span className="cond-num">ANNEX</span>
              <h2 className="cond-title">УСЛОВИЯ ДЛЯ ПОВЫШЕНИЯ</h2>
              {isAdmin && !editConditions && (
                <button className="cond-edit" onClick={() => { setEditConditions(true); setTempConditions(conditions); }}>
                  ✎ РЕД.
                </button>
              )}
            </div>

            {editConditions ? (
              <>
                <textarea
                  className="field cond-ta"
                  value={tempConditions}
                  onChange={(e) => setTempConditions(e.target.value)}
                  rows="16"
                  placeholder="Введите условия для повышения..."
                />
                <div className="cond-actions">
                  <button className="btn-mini btn-mini-solid" onClick={saveConditions}>💾 СОХР.</button>
                  <button className="btn-mini" onClick={() => setEditConditions(false)}>ОТМЕНА</button>
                </div>
              </>
            ) : (
              <div className="cond-body">
                {conditions ? (
                  <div className="cond-text">{conditions}</div>
                ) : (
                  <p className="cond-empty">
                    УСЛОВИЯ НЕ ЗАПОЛНЕНЫ
                    {isAdmin && <span className="cond-hint"> · Нажмите «РЕД.»</span>}
                  </p>
                )}
              </div>
            )}

            {conditionStatus && <p className="cond-status">{conditionStatus}</p>}
          </aside>
        </div>
      </div>

      <SubmitOverlay show={success} text="Отчёт отправлен!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />

      <style jsx>{`
        .form-page-wide {
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 30px;
        }
        .split {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .form-shell { flex: 1 1 420px; min-width: 320px; }

        .conditions {
          flex: 0 0 380px;
          min-width: 280px;
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          position: sticky;
          top: 100px;
          animation: formIn 0.5s ease;
        }
        .cond-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
        }
        .cond-num {
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: #555;
          border: 1px solid #2a2a2a;
          padding: 2px 6px;
        }
        .cond-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
          flex: 1;
        }
        .cond-edit {
          background: transparent;
          border: 1px solid #333;
          color: #ccc;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          padding: 4px 9px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .cond-edit:hover { background: #fff; color: #000; border-color: #fff; }

        .cond-body {
          padding: 18px;
          max-height: 520px;
          overflow-y: auto;
        }
        .cond-text {
          white-space: pre-line;
          color: #d0d0d0;
          font-size: 13.5px;
          line-height: 1.75;
        }
        .cond-empty {
          color: #555;
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 1.4px;
          text-align: center;
          padding: 30px 0;
          text-transform: uppercase;
        }
        .cond-hint { color: #888; }

        .cond-ta {
          margin: 14px;
          min-height: 320px;
          width: calc(100% - 28px);
        }
        .cond-actions {
          display: flex;
          gap: 8px;
          padding: 0 14px 14px;
        }
        .btn-mini {
          flex: 1;
          padding: 9px 12px;
          background: transparent;
          border: 1px solid #333;
          color: #ccc;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          transition: all 0.18s;
        }
        .btn-mini:hover { background: #fff; color: #000; border-color: #fff; }
        .btn-mini-solid {
          background: #fff;
          color: #000;
          border-color: #fff;
          font-weight: 800;
        }
        .btn-mini-solid:hover { background: #ccc; border-color: #ccc; }

        .cond-status {
          text-align: center;
          color: #4caf50;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.4px;
          padding: 0 14px 14px;
          margin: 0;
        }

        @media (max-width: 900px) {
          .conditions { flex: 1 1 auto; width: 100%; position: static; }
        }
      `}</style>
    </Layout>
  );
}
