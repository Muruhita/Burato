import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
import SystemAlert from '../../components/SystemAlert';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCooldown } from '../../hooks/useCooldown';

export default function WithdrawalForm() {
  const router = useRouter();
  const { cooldown, trigger } = useCooldown('withdrawal');
  const [nickname, setNickname] = useState('');
  const [formData, setFormData] = useState({ reason: '', date: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);
  const [sysAlert, setSysAlert] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data.nickname) setNickname(data.nickname);
      if (data.banned) { setBanned(true); setBanReason(data.banReason || 'Бан'); setBanUntil(data.banUntil || null); }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'withdrawal', fullName: nickname, ...formData })
      });
      if (res.ok) { setSuccess(true); trigger(20); setTimeout(() => router.push('/dashboard'), 1400); return; }
      if (res.status === 429) { trigger(20); throw new Error('Слишком много запросов.'); }
      if (res.status === 403) {
        const err = await res.json();
        if (err.banned) { setBanned(true); setBanReason(err.reason || 'Бан'); setBanUntil(err.until || null); setSubmitting(false); return; }
        setSysAlert({ show: true, title: 'ДОСТУП ЗАПРЕЩЕН', message: err.error || 'Подача заявок остановлена.' }); setSubmitting(false); return;
      }
      throw new Error((await res.json()).error || 'Ошибка');
    } catch (error) { alert('❌ ' + error.message); setSubmitting(false); }
  };

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>
        <div className="form-shell">
          <header className="form-head">
            <div className="fh-stamp">FORM-009 · CLEARANCE</div>
            <h1 className="fh-title">Снятие ЧС</h1>
            <p className="fh-sub">Запрос на снятие чёрного списка. При наличии — укажите причину и дату выдачи ЧС.</p>
            <div className="fh-rule" />
          </header>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Имя Фамилия + Статик</label>
              <input className="field" type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required placeholder="Name Surname 123456" />
            </div>
            <div className="field-block">
              <label className="lbl">Причина ЧС (если известна)</label>
              <textarea className="field" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows="4" placeholder="Введите причину..." />
            </div>
            <div className="field-block">
              <label className="lbl">Дата выдачи ЧС (если известна)</label>
              <input className="field" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting || success || banned || cooldown > 0}>
              {cooldown > 0 ? `⏳ ПОДОЖДИТЕ ${cooldown} СЕК...` : submitting ? 'ОТПРАВКА...' : banned ? '🚫 ДОСТУП ЗАБЛОКИРОВАН' : '→ ОТПРАВИТЬ'}
            </button>
          </form>
        </div>
      </div>
      <SubmitOverlay show={success} text="Заявка на снятие ЧС отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
      <SystemAlert show={sysAlert.show} title={sysAlert.title} message={sysAlert.message} onClose={() => setSysAlert({ ...sysAlert, show: false })} />
    </Layout>
  );
}
