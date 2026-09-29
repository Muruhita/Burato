import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ClaimForm() {
  const router = useRouter();
  const [myNickname, setMyNickname] = useState('');
  const [formData, setFormData] = useState({ offenderName: '', proofLink: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.nickname) setMyNickname(data.nickname);
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
        body: JSON.stringify({ type: 'claim', fullName: myNickname, ...formData })
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
            <div className="fh-stamp">FORM-011 · COMPLAINT</div>
            <h1 className="fh-title">Жалоба</h1>
            <p className="fh-sub">
              Официальная жалоба на игрока. Прикладывайте только проверяемые доказательства.
            </p>
            <div className="fh-rule" />
          </header>

          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Ваше Имя Фамилия + Статик</label>
              <input
                className="field"
                type="text"
                value={myNickname}
                onChange={(e) => setMyNickname(e.target.value)}
                required
                placeholder="Ivan Petrov | 123456"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Имя Фамилия + Статик нарушителя</label>
              <input
                className="field"
                type="text"
                value={formData.offenderName}
                onChange={(e) => setFormData({ ...formData, offenderName: e.target.value })}
                required
                placeholder="Petr Ivanov | 654321"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Ссылка на доказательства</label>
              <input
                className="field"
                type="url"
                value={formData.proofLink}
                onChange={(e) => setFormData({ ...formData, proofLink: e.target.value })}
                required
                placeholder="https://imgur.com/..."
              />
            </div>

            <div className="field-block">
              <label className="lbl">Причина жалобы</label>
              <textarea
                className="field"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows="4"
                placeholder="Опишите ситуацию подробно..."
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || success || banned}>
              {submitting
                ? <><span className="btn-spinner" /> ОТПРАВКА...</>
                : banned
                  ? '🚫 ДОСТУП ЗАБЛОКИРОВАН'
                  : '→ ОТПРАВИТЬ ЖАЛОБУ'}
            </button>
          </form>
        </div>
      </div>

      <SubmitOverlay show={success} text="Жалоба отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
