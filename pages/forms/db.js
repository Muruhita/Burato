import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';

const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

export default function DBForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', fromRank: '', toRank: '' });

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [meRes, profileRes] = await Promise.all([
          fetch('/api/me'),
          fetch('/api/profile')
        ]);
        const meData = await meRes.json().catch(() => ({}));
        const profileData = await profileRes.json().catch(() => ({}));

        if (cancelled) return;
        if (!meData?.user) { router.push('/'); return; }

        setUser(meData.user);
        if (profileData.nickname) setFormData(prev => ({ ...prev, fullName: profileData.nickname }));
        if (profileData.banned) {
          setBanned(true);
          setBanReason(profileData.banReason || 'Ваш доступ к системе заявок заблокирован.');
          setBanUntil(profileData.banUntil || null);
        }
      } catch (e) {
        console.error('[db] load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'db',
          fullName: formData.fullName,
          fromRank: formData.fromRank,
          toRank: formData.toRank
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
    return <Layout><div className="loading-line">ЗАГРУЗКА ДАННЫХ...</div></Layout>;
  }

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>

        <div className="form-shell">
          <header className="form-head">
            <div className="fh-stamp">FORM-013 · PERSONNEL</div>
            <h1 className="fh-title">Запрос на ДБ</h1>
            <p className="fh-sub">
              Запрос на день блата (ДБ). Укажите свои данные и диапазон повышения.
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
              <label className="lbl">С какого ранга</label>
              <select
                className="field"
                required
                value={formData.fromRank}
                onChange={(e) => setFormData({ ...formData, fromRank: e.target.value })}
              >
                <option value="">-- ВЫБЕРИТЕ РАНГ --</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="field-block">
              <label className="lbl">На какой ранг</label>
              <select
                className="field"
                required
                value={formData.toRank}
                onChange={(e) => setFormData({ ...formData, toRank: e.target.value })}
              >
                <option value="">-- ВЫБЕРИТЕ РАНГ --</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="field-block">
              <label className="lbl">Отправитель (автоматически)</label>
              <input
                className="field"
                type="text"
                value={user ? `${user.username} (${user.id})` : ''}
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

      <SubmitOverlay show={success} text="Запрос на ДБ отправлен!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
