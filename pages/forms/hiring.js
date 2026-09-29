import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HiringForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  const [formData, setFormData] = useState({
    age: '', experience: '', lawKnowledge: '',
    passportScreenshot: '', militaryId: '', medicalCertificates: ''
  });

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
        body: JSON.stringify({ type: 'hiring', fullName: nickname, ...formData })
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
            <div className="fh-stamp">FORM-010 · RECRUIT</div>
            <h1 className="fh-title">Трудоустройство в FIB</h1>
            <p className="fh-sub">
              Заявка на вступление в Federal Investigation Bureau. Приложите скриншоты паспорта, военного билета и мед. справок.
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
                placeholder="Name Surname | 123456"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Возраст (RP)</label>
              <input
                className="field"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                placeholder="22"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Опыт работы</label>
              <textarea
                className="field"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                required
                rows="3"
                placeholder="Были ли в других организациях? Опишите..."
              />
            </div>

            <div className="field-block">
              <label className="lbl">Знание законов RP (1–10)</label>
              <select
                className="field"
                value={formData.lawKnowledge}
                onChange={(e) => setFormData({ ...formData, lawKnowledge: e.target.value })}
                required
              >
                <option value="">-- ОЦЕНИТЕ ЗНАНИЯ --</option>
                {['1','2','3','4','5','6','7','8','9','10'].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="field-block">
              <label className="lbl">Скриншот паспорта (ссылка)</label>
              <input
                className="field"
                type="url"
                value={formData.passportScreenshot}
                onChange={(e) => setFormData({ ...formData, passportScreenshot: e.target.value })}
                required
                placeholder="https://imgur.com/..."
              />
            </div>

            <div className="field-block">
              <label className="lbl">Военный билет (ссылка)</label>
              <input
                className="field"
                type="url"
                value={formData.militaryId}
                onChange={(e) => setFormData({ ...formData, militaryId: e.target.value })}
                required
                placeholder="https://imgur.com/..."
              />
            </div>

            <div className="field-block">
              <label className="lbl">Мед. справки (ссылка)</label>
              <input
                className="field"
                type="url"
                value={formData.medicalCertificates}
                onChange={(e) => setFormData({ ...formData, medicalCertificates: e.target.value })}
                required
                placeholder="https://imgur.com/..."
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || success || banned}>
              {submitting
                ? <><span className="btn-spinner" /> ОТПРАВКА...</>
                : banned
                  ? '🚫 ДОСТУП ЗАБЛОКИРОВАН'
                  : '→ ОТПРАВИТЬ ЗАЯВКУ'}
            </button>
          </form>
        </div>
      </div>

      <SubmitOverlay show={success} text="Заявка на трудоустройство отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
