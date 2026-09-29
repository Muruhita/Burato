import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';

export default function ReinstatementForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [formData, setFormData] = useState({ rank: '', proof: '', wasBannedWarned: 'no', approvalLink: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data.nickname) setNickname(data.nickname);
      if (data.banned) {
        setBanned(true);
        setBanReason(data.banReason || 'Ваш доступ к системе заявок заблокирован.');
        setBanUntil(data.banUntil || null);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reinstatement', fullName: nickname, ...formData })
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
            <div className="fh-stamp">FORM-006 · RETURN</div>
            <h1 className="fh-title">Восстановление</h1>
            <p className="fh-sub">
              Заявка на восстановление в FIB. Приложите скрины последнего повышения и увольнения.
            </p>
            <div className="fh-rule" />
          </header>

          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Имя Фамилия | Статик ID</label>
              <input
                className="field"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                placeholder="Name Surname 123456"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Ранг на момент увольнения</label>
              <input
                className="field"
                type="text"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                required
              />
            </div>

            <div className="field-block">
              <label className="lbl">Доказательства (последнее повышение + увольнение)</label>
              <textarea
                className="field"
                value={formData.proof}
                onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
                required
                rows="4"
                placeholder="Ссылка на скриншоты"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Уволен после Ban/Warn?</label>
              <select
                className="field"
                value={formData.wasBannedWarned}
                onChange={(e) => setFormData({ ...formData, wasBannedWarned: e.target.value })}
              >
                <option value="idk">Не помню</option>
                <option value="no">Нет</option>
                <option value="yes">Да</option>
              </select>
            </div>

            {formData.wasBannedWarned === 'yes' && (
              <div className="field-block">
                <label className="lbl">Ссылка на одобрение (State Fraction)</label>
                <input
                  className="field"
                  type="text"
                  value={formData.approvalLink}
                  onChange={(e) => setFormData({ ...formData, approvalLink: e.target.value })}
                  required
                />
              </div>
            )}

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

      <SubmitOverlay show={success} text="Заявка на восстановление отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
