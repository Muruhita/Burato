import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';

const RANK_OPTIONS = [
  '1-2 ранг', '2-3 ранг', '3-4 ранг', '4-5 ранг', '5-6 ранг',
  '6-7 ранг', '7-8 ранг', '8-9 ранг', '9-10 ранг', '10-11 ранг',
  '11-12 ранг', '12-13 ранг'
];

export default function PromotionForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', rankRange: '', reportLink: '' });

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(res => res.json()),
      fetch('/api/profile').then(res => res.json())
    ]).then(([meData, profileData]) => {
      if (!meData.user) { router.push('/'); return; }
      setUser(meData.user);
      if (profileData.nickname) setFormData(prev => ({ ...prev, fullName: profileData.nickname }));
      if (profileData.banned) {
        setBanned(true);
        setBanReason(profileData.banReason || 'Ваш доступ к системе заявок заблокирован.');
        setBanUntil(profileData.banUntil || null);
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
          type: 'promotion',
          fullName: formData.fullName,
          rankRange: formData.rankRange,
          reportLink: formData.reportLink
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

  if (loading) {
    return (
      <Layout>
        <div className="loading-line">ЗАГРУЗКА ДАННЫХ...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>

        <div className="form-shell">
          <header className="form-head">
            <div className="fh-stamp">FORM-001 · PERSONNEL</div>
            <h1 className="fh-title">Запрос на повышение</h1>
            <p className="fh-sub">
              Заявка на повышение по рангу. Укажите диапазон и приложите ссылку на одобренный отчёт.
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
              <label className="lbl">Ссылка на одобренный отчёт</label>
              <textarea
                className="field"
                required
                value={formData.reportLink}
                onChange={(e) => setFormData({ ...formData, reportLink: e.target.value })}
                rows="4"
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
                  : '→ ОТПРАВИТЬ'}
            </button>
          </form>
        </div>
      </div>

      <SubmitOverlay show={success} text="Запрос на повышение отправлен!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
