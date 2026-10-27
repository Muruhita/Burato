import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';

const POSITIONS = [
  { value: 'assistant_director', label: 'Assistant of Director' },
  { value: 'deputy_director',    label: 'Deputy of Director' },
  { value: 'head_of_dept',       label: 'Head of Department' },
  { value: 'deputy_head',        label: 'Deputy of Head Department' },
  { value: 'instructor',         label: 'Instructor' },
  { value: 'rank_below_10',      label: 'Сотрудник (ранг ниже 10)' }
];

export default function LeaveForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [formData, setFormData] = useState({
    department: '',
    position: '',
    reason: '',
    startDate: '',
    endDate: ''
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
        body: JSON.stringify({
          type: 'leave',
          leaveType: 'OOC', // всегда OOC
          fullName: nickname,
          ...formData
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

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>

        <div className="form-shell">
          <header className="form-head">
            <div className="fh-stamp">FORM-012 · PERSONNEL</div>
            <h1 className="fh-title">Отпуск (OOC)</h1>
            <p className="fh-sub">
              Заявка на OOC-отпуск. Укажите период, отдел и звание.
            </p>
            <div className="fh-rule" />
          </header>

          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Тип отпуска</label>
              <div className="type-static">
                <span className="type-dot" />
                <span className="type-text">OOC ОТПУСК</span>
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
              <label className="lbl">Звание</label>
              <select
                className="field"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              >
                <option value="">-- ВЫБЕРИТЕ ЗВАНИЕ --</option>
                {POSITIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
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

      <SubmitOverlay show={success} text="Заявка на OOC-отпуск отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />

      <style jsx>{`
        .type-static {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          background: #060606;
          border: 1px solid #262626;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: #fff;
          text-transform: uppercase;
        }
        .type-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.7);
          animation: pulseDot 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        .type-text {
          font-weight: 800;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.85); }
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
