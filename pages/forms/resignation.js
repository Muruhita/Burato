import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
import ImageUploader from '../../components/ImageUploader';
import SystemAlert from '../../components/SystemAlert';
import { useCooldown } from '../../hooks/useCooldown';

export default function ResignationForm() {
  const router = useRouter();
  const { cooldown, trigger } = useCooldown('resignation');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', screenshot: '' });
  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);
  const [sysAlert, setSysAlert] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    Promise.all([fetch('/api/me').then(res => res.json()), fetch('/api/profile').then(res => res.json())]).then(([meData, profileData]) => {
      if (!meData.user) { router.push('/'); return; }
      setUser(meData.user);
      if (profileData.nickname) setFormData(prev => ({ ...prev, fullName: profileData.nickname }));
      if (profileData.banned) { setBanned(true); setBanReason(profileData.banReason || 'Бан'); setBanUntil(profileData.banUntil || null); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.screenshot) { alert('⚠️ Загрузите скриншот планшета!'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'resignation', fullName: formData.fullName, screenshot: formData.screenshot })
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

  if (loading) return <Layout><div className="loading-line">ЗАГРУЗКА ДАННЫХ...</div></Layout>;

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>
        <div className="form-shell">
          <header className="form-head">
            <div className="fh-stamp">FORM-005 · PERSONNEL</div>
            <h1 className="fh-title">Рапорт на увольнение</h1>
            <p className="fh-sub">Официальное заявление на увольнение из FIB. Приложите скриншот профиля в планшете.</p>
            <div className="fh-rule" />
          </header>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Имя Фамилия + Статик</label>
              <input className="field" type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Name Surname 123456" />
            </div>
            <ImageUploader label="Скриншот планшета" value={formData.screenshot} onChange={(url) => setFormData(prev => ({ ...prev, screenshot: url }))} allowManualUrl />
            <div className="field-block">
              <label className="lbl">Discord (автоматически)</label>
              <input className="field" type="text" value={`${user.username} (${user.id})`} disabled style={{ opacity: 0.45 }} />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting || success || banned || cooldown > 0}>
              {cooldown > 0 ? `⏳ ПОДОЖДИТЕ ${cooldown} СЕК...` : submitting ? 'ОТПРАВКА...' : banned ? '🚫 ДОСТУП ЗАБЛОКИРОВАН' : '→ ОТПРАВИТЬ РАПОРТ'}
            </button>
          </form>
        </div>
      </div>
      <SubmitOverlay show={success} text="Рапорт на увольнение отправлен!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
      <SystemAlert show={sysAlert.show} title={sysAlert.title} message={sysAlert.message} onClose={() => setSysAlert({ ...sysAlert, show: false })} />
    </Layout>
  );
}
