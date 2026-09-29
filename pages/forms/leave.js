import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
import MultiImageUploader from '../../components/MultiImageUploader';

export default function LeaveForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [leaveType, setLeaveType] = useState('IC');
  const [formData, setFormData] = useState({
    department: '',
    reason: '',
    startDate: '',
    endDate: '',
    screenshots: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  const departments = ['IB', 'CID', 'FA', 'HRT', 'ATF', 'AF', 'OCU', 'DEA', 'FNA', 'NSB'];

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.nickname) setNickname(data.nickname);
        if (data.banned) {
          setBanned(true);
          setBanReason(data.banReason || 'Ваш доступ к системе заявок заблокирован.');
          setBanUntil(data.banUntil || null);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leave', leaveType, fullName: nickname, ...formData })
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

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>

        <div className="form-shell">
          <header className="form-head">
            <div className="fh-stamp">FORM-012 · PERSONNEL</div>
            <h1 className="fh-title">Отпуск</h1>
            <p className="fh-sub">
              Заявка на IC или OOC отпуск. Укажите период и, при необходимости, приложите скриншоты.
            </p>
            <div className="fh-rule" />
          </header>

          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Тип отпуска</label>
              <div className="type-switch">
                <button
                  type="button"
                  className={leaveType === 'IC' ? 'active' : ''}
                  onClick={() => setLeaveType('IC')}
                >
                  IC ОТПУСК
                </button>
                <button
                  type="button"
                  className={leaveType === 'OOC' ? 'active' : ''}
                  onClick={() => setLeaveType('OOC')}
                >
                  OOC ОТПУСК
                </button>
              </div>
            </div>

            <div className="field-block">
              <label className="lbl">Имя Фамилия + Статик</label>
              <input
                className="field"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                placeholder="Sanya Suspect 270726"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Отдел</label>
              <select
                className="field"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">-- ВЫБЕРИТЕ ОТДЕЛ --</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="field-block">
              <label className="lbl">Причина</label>
              <textarea
                className="field"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows="4"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Период отпуска</label>
              <div className="date-row">
                <div>
                  <span className="date-lbl">НАЧАЛО</span>
                  <input
                    className="field"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <span className="date-lbl">КОНЕЦ</span>
                  <input
                    className="field"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <MultiImageUploader
              label="Скриншоты (необязательно)"
              value={formData.screenshots}
              onChange={(urls) => setFormData(prev => ({ ...prev, screenshots: urls }))}
              max={5}
            />

            <button type="submit" className="submit-btn" disabled={submitting || success || banned}>
              {submitting
                ? <><span className="btn-spinner" /> ОТПРАВКА...</>
                : banned
                  ? '🚫 ДОСТУП ЗАБЛОКИРОВАН'
                  : '→ ОТПРАВИТЬ'}
            </button>
          </form>
        </div>
      </div>

      <SubmitOverlay show={success} text="Заявка на отпуск отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />

      <style jsx>{`
        .type-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border: 1px solid #262626;
          background: #060606;
        }
        .type-switch button {
          padding: 13px 14px;
          background: transparent;
          border: none;
          color: #777;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          transition: all 0.18s;
          text-transform: uppercase;
        }
        .type-switch button:first-child {
          border-right: 1px solid #262626;
        }
        .type-switch button:hover {
          color: #fff;
        }
        .type-switch button.active {
          background: #fff;
          color: #000;
          font-weight: 800;
        }

        .date-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .date-lbl {
          display: block;
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: #555;
          margin-bottom: 6px;
        }
      `}</style>
    </Layout>
  );
}
