import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';

export default function TransferToFibForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [formData, setFormData] = useState({ approval: '', rankProof: '' });
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
        body: JSON.stringify({ type: 'transferToFib', fullName: nickname, ...formData })
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
            <div className="fh-stamp">FORM-007 · TRANSFER</div>
            <h1 className="fh-title">Перевод в FIB</h1>
            <p className="fh-sub">
              Заявка на перевод в Federal Investigation Bureau из другой фракции. Требуется одобрение начальства.
            </p>
            <div className="fh-rule" />
          </header>

          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Имя Фамилия + Статик</label>
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
              <label className="lbl">Одобрение от начальства (ссылка)</label>
              <input
                className="field"
                type="text"
                value={formData.approval}
                onChange={(e) => setFormData({ ...formData, approval: e.target.value })}
                required
                placeholder="https://..."
              />
            </div>

            <div className="field-block">
              <label className="lbl">Доказательство ранга (скрин с планшета)</label>
              <textarea
                className="field"
                value={formData.rankProof}
                onChange={(e) => setFormData({ ...formData, rankProof: e.target.value })}
                required
                rows="4"
                placeholder="Вставьте ссылку на скриншот"
              />
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

      <SubmitOverlay show={success} text="Заявка в FIB отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
