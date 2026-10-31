import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
import MultiImageUploader from '../../components/MultiImageUploader';
import DraftBanner from '../../components/DraftBanner';
import { useFormDraft } from '../../hooks/useFormDraft';

const DEPARTMENTS = [
  { id: 'ib', name: 'IB (Intelligence Branch)' }, { id: 'cid', name: 'CID (Criminal Investigation)' },
  { id: 'fa', name: 'FA (Free Agent)' }, { id: 'hrt', name: 'HRT (Hostage Rescue)' },
  { id: 'atf', name: 'ATF (Anti Terrorism)' }, { id: 'af', name: 'AF (Air Force)' },
  { id: 'ocu', name: 'OCU (Organized Crime)' }, { id: 'dea', name: 'DEA (Drug Enforcement)' },
  { id: 'fna', name: 'FNA (Academy)' }, { id: 'nsb', name: 'NSB (National Security)' },
  { id: 'trainee', name: 'Trainee (Стажёр)' }
];
const RANKS = ['1','2','3','4','5','6','7','8','9','10'];

export default function ReportForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', department: '', currentRank: '', targetRank: '',
    isInstructor: '', workLinks: '', workImages: []
  });

  const draft = useFormDraft(
    'draft:report',
    { fullName: formData.fullName, department: formData.department, currentRank: formData.currentRank, targetRank: formData.targetRank, isInstructor: formData.isInstructor, workLinks: formData.workLinks, workImages: formData.workImages },
    {
      enabled: !banned,
      onLoad: (saved) => {
        if (!saved) return;
        setFormData(prev => ({ ...prev, ...saved }));
      }
    }
  );

  const targetRankNum = parseInt(formData.targetRank);
  const showInstructorField = (targetRankNum === 9 || targetRankNum === 10) && formData.department !== 'fa';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [meRes, profileRes] = await Promise.all([fetch('/api/me'), fetch('/api/profile')]);
        const meData = await meRes.json().catch(() => ({}));
        const profileData = await profileRes.json().catch(() => ({}));
        if (cancelled) return;
        if (!meData?.user) { router.push('/'); return; }
        setUser(meData.user);
        if (profileData.nickname) setFormData(prev => ({ ...prev, fullName: profileData.nickname }));
        if (profileData.department) setFormData(prev => ({ ...prev, department: profileData.department }));
        if (profileData.banned) {
          setBanned(true);
          setBanReason(profileData.banReason || 'Ваш доступ к системе заявок заблокирован.');
          setBanUntil(profileData.banUntil || null);
        }
      } catch (e) { console.error('[report] load error:', e); } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showInstructorField && formData.isInstructor !== 'yes') { alert('⚠️ Для повышения на 9 или 10 ранг необходимо подтвердить назначение на инструктора!'); return; }
    const hasLinks = formData.workLinks && formData.workLinks.trim().length > 0;
    const hasImages = Array.isArray(formData.workImages) && formData.workImages.length > 0;
    if (!hasLinks && !hasImages) { alert('⚠️ Приложите хотя бы одну ссылку или скриншот проделанной работы.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'report', department: formData.department, fullName: formData.fullName, currentRank: formData.currentRank, targetRank: formData.targetRank, isInstructor: formData.isInstructor || 'no', workLinks: formData.workLinks, workImages: formData.workImages })
      });
      if (res.ok) {
        draft.clear();
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 1400);
        return;
      }
      if (res.status === 403) {
        const err = await res.json();
        if (err.banned) { setBanned(true); setBanReason(err.reason || 'Бан'); setBanUntil(err.until || null); setSubmitting(false); return; }
        throw new Error(err.error || 'Доступ запрещён');
      }
      const err = await res.json();
      throw new Error(err.error || 'Ошибка');
    } catch (error) { alert('❌ ' + error.message); setSubmitting(false); }
  };

  if (loading) return <Layout><div className="loading-line">ЗАГРУЗКА ДАННЫХ...</div></Layout>;

  return (
    <Layout>
      <div className="form-page">
        <button onClick={() => router.push('/dashboard')} className="back-btn">← НАЗАД К БЛАНКАМ</button>
        <DraftBanner {...draft} />
        <div className="form-shell">
          <header className="form-head">
            <div className="fh-stamp">FORM-003 · REPORT</div>
            <h1 className="fh-title">Отчёт на повышение</h1>
            <p className="fh-sub">Внутренний отчёт на повышение в своём отделе.</p>
            <div className="fh-rule" />
          </header>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="field-block">
              <label className="lbl">Имя Фамилия + Статик</label>
              <input className="field" type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Name Surname 123456" />
            </div>
            <div className="field-block">
              <label className="lbl">Отдел</label>
              <select className="field" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                <option value="">-- ВЫБЕРИТЕ ОТДЕЛ --</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="field-block">
              <label className="lbl">Текущий ранг</label>
              <select className="field" required value={formData.currentRank} onChange={(e) => setFormData({ ...formData, currentRank: e.target.value })}>
                <option value="">-- ВЫБЕРИТЕ РАНГ --</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field-block">
              <label className="lbl">На какой ранг повышаетесь</label>
              <select className="field" required value={formData.targetRank} onChange={(e) => setFormData({ ...formData, targetRank: e.target.value })}>
                <option value="">-- ВЫБЕРИТЕ РАНГ --</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {showInstructorField && (
              <div className="field-block">
                <label className="lbl">Назначены ли вы на инструктора?</label>
                <select className="field" required value={formData.isInstructor} onChange={(e) => setFormData({ ...formData, isInstructor: e.target.value })}>
                  <option value="">-- ВЫБЕРИТЕ ОТВЕТ --</option>
                  <option value="yes">✅ Да</option><option value="no">❌ Нет</option>
                </select>
              </div>
            )}
            <div className="field-block">
              <label className="lbl">Ссылки на проделанную работу</label>
              <textarea className="field" value={formData.workLinks} onChange={(e) => setFormData({ ...formData, workLinks: e.target.value })} rows="4" placeholder="https://..." />
            </div>
            <MultiImageUploader label="Скриншоты проделанной работы" value={formData.workImages} onChange={(urls) => setFormData(prev => ({ ...prev, workImages: urls }))} max={10} />
            <div className="field-block">
              <label className="lbl">Discord (автоматически)</label>
              <input className="field" type="text" value={user ? `${user.username} (${user.id})` : ''} disabled style={{ opacity: 0.45 }} />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting || success || banned}>
              {submitting ? 'ОТПРАВКА...' : banned ? '🚫 ДОСТУП ЗАБЛОКИРОВАН' : '→ ОТПРАВИТЬ ОТЧЁТ'}
            </button>
          </form>
        </div>
      </div>
      <SubmitOverlay show={success} text="Отчёт успешно отправлен!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
