import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';

const DEPARTMENTS = [
  { id: 'ib', name: 'IB (Intelligence Branch)' },
  { id: 'cid', name: 'CID (Criminal Investigation)' },
  { id: 'fa', name: 'FA (Free Agent)' },
  { id: 'hrt', name: 'HRT (Hostage Rescue)' },
  { id: 'atf', name: 'ATF (Anti Terrorism)' },
  { id: 'af', name: 'AF (Air Force)' },
  { id: 'ocu', name: 'OCU (Organized Crime)' },
  { id: 'dea', name: 'DEA (Drug Enforcement)' },
  { id: 'fna', name: 'FNA (Academy)' },
  { id: 'nsb', name: 'NSB (National Security)' },
  { id: 'trainee', name: 'Trainee (Стажёр)' }
];

// 🎯 Отделы, в которые НЕЛЬЗЯ переводиться
const FORBIDDEN_TARGETS = ['ib', 'trainee'];

const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function TransferForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', rank: '', currentDepartment: '', targetDepartment: '', reason: '',
    cidExperience: '', cidExamples: '', cidServers: '', cidKnowledge: '', cidLawKnowledge: '',
    faRules: '', faPrevious: ''
  });

  const targetDept = formData.targetDepartment;
  const currentDept = formData.currentDepartment;
  const rankNum = parseInt(formData.rank);

  const showCidFields = targetDept === 'cid';
  const showFaFields = targetDept === 'fa';
  const isSameDepartment = currentDept && targetDept && currentDept === targetDept;
  const isFaRankValid = targetDept !== 'fa' || (targetDept === 'fa' && rankNum >= 5);

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(res => res.json()),
      fetch('/api/profile').then(res => res.json())
    ]).then(([meData, profileData]) => {
      if (!meData.user) { router.push('/'); return; }
      setUser(meData.user);
      if (profileData.nickname) setFormData(prev => ({ ...prev, fullName: profileData.nickname }));
      if (profileData.department) setFormData(prev => ({ ...prev, currentDepartment: profileData.department }));
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
    if (isSameDepartment) { alert('❌ Нельзя перевестись в тот же отдел!'); return; }
    if (!isFaRankValid) { alert('❌ Для перевода в FA необходим ранг 5 или выше!'); return; }
    if (showCidFields && (!formData.cidExperience || !formData.cidExamples || !formData.cidServers || !formData.cidKnowledge || !formData.cidLawKnowledge)) {
      alert('❌ Пожалуйста, заполните все дополнительные вопросы для CID!');
      return;
    }
    if (showFaFields && (!formData.faRules || !formData.faPrevious)) {
      alert('❌ Пожалуйста, заполните все дополнительные вопросы для FA!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer',
          targetDepartment: formData.targetDepartment,
          fullName: formData.fullName,
          rank: formData.rank,
          currentDepartment: formData.currentDepartment,
          reason: formData.reason,
          cidExperience: formData.cidExperience,
          cidExamples: formData.cidExamples,
          cidServers: formData.cidServers,
          cidKnowledge: formData.cidKnowledge,
          cidLawKnowledge: formData.cidLawKnowledge,
          faRules: formData.faRules,
          faPrevious: formData.faPrevious
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
      throw new Error(err.error || 'Ошибка отправки');
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
            <div className="fh-stamp">FORM-002 · TRANSFER</div>
            <h1 className="fh-title">Перевод в отдел</h1>
            <p className="fh-sub">
              Заявка на перевод из текущего отдела в целевой. Для CID/FA потребуются дополнительные ответы.
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
              <label className="lbl">Ваш ранг</label>
              <select
                className="field"
                required
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
              >
                <option value="">-- ВЫБЕРИТЕ РАНГ --</option>
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="field-block">
              <label className="lbl">Ваш текущий отдел</label>
              <select
                className="field"
                required
                value={formData.currentDepartment}
                onChange={(e) => setFormData({ ...formData, currentDepartment: e.target.value })}
              >
                <option value="">-- ВЫБЕРИТЕ ОТДЕЛ --</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="field-block">
              <label className="lbl">Желаемый отдел</label>
              <select
                className="field"
                required
                value={formData.targetDepartment}
                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
              >
                <option value="">-- ВЫБЕРИТЕ ОТДЕЛ --</option>
                {DEPARTMENTS.filter(d => !FORBIDDEN_TARGETS.includes(d.id)).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {isSameDepartment && (
              <div className="warn">❌ НЕЛЬЗЯ ПЕРЕВЕСТИСЬ В ТОТ ЖЕ ОТДЕЛ</div>
            )}
            {targetDept === 'fa' && !isFaRankValid && (
              <div className="warn">❌ ДЛЯ ПЕРЕВОДА В FA НЕОБХОДИМ РАНГ 5+</div>
            )}

            <div className="field-block">
              <label className="lbl">Причина перевода</label>
              <textarea
                className="field"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows="4"
                placeholder="Опишите причину перевода..."
              />
            </div>

            {showCidFields && (
              <div className="sub-section">
                <div className="sub-head">
                  <span className="sub-tag">ANNEX · CID</span>
                  <span className="sub-title">ДОПОЛНИТЕЛЬНЫЕ ВОПРОСЫ</span>
                </div>

                <div className="field-block">
                  <label className="lbl">Чем занимается CID?</label>
                  <textarea required value={formData.cidExperience}
                    onChange={(e) => setFormData({ ...formData, cidExperience: e.target.value })} className="field" rows="3" />
                </div>
                <div className="field-block">
                  <label className="lbl">Ваш опыт в CID?</label>
                  <input type="text" required value={formData.cidExamples}
                    onChange={(e) => setFormData({ ...formData, cidExamples: e.target.value })} className="field" />
                </div>
                <div className="field-block">
                  <label className="lbl">Примеры работ</label>
                  <textarea required value={formData.cidServers}
                    onChange={(e) => setFormData({ ...formData, cidServers: e.target.value })} className="field" rows="3" />
                </div>
                <div className="field-block">
                  <label className="lbl">Серверы с CID</label>
                  <input type="text" required value={formData.cidKnowledge}
                    onChange={(e) => setFormData({ ...formData, cidKnowledge: e.target.value })} className="field" />
                </div>
                <div className="field-block">
                  <label className="lbl">Знания CID (1-10)</label>
                  <select required value={formData.cidLawKnowledge}
                    onChange={(e) => setFormData({ ...formData, cidLawKnowledge: e.target.value })} className="field">
                    <option value="">-- ВЫБЕРИТЕ --</option>
                    {['1','2','3','4','5','6','7','8','9','10'].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            {showFaFields && (
              <div className="sub-section">
                <div className="sub-head">
                  <span className="sub-tag">ANNEX · FA</span>
                  <span className="sub-title">ДОПОЛНИТЕЛЬНЫЕ ВОПРОСЫ</span>
                </div>

                <div className="field-block">
                  <label className="lbl">Знания правил ПОИП</label>
                  <textarea required value={formData.faRules}
                    onChange={(e) => setFormData({ ...formData, faRules: e.target.value })} className="field" rows="3" />
                </div>
                <div className="field-block">
                  <label className="lbl">Были ли в FA раньше?</label>
                  <textarea required value={formData.faPrevious}
                    onChange={(e) => setFormData({ ...formData, faPrevious: e.target.value })} className="field" rows="3" />
                </div>
              </div>
            )}

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

      <SubmitOverlay show={success} text="Заявка на перевод отправлена!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />

      <style jsx>{`
        .warn {
          padding: 11px 14px;
          background: rgba(255, 60, 60, 0.05);
          border-left: 3px solid #ff4444;
          color: #ff8080;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.4px;
          margin-bottom: 18px;
        }
        .sub-section {
          border: 1px dashed #2a2a2a;
          padding: 18px 16px 8px;
          margin: 22px 0;
          background: rgba(255,255,255,0.01);
        }
        .sub-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px dashed #1f1f1f;
        }
        .sub-tag {
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: #888;
          border: 1px solid #2a2a2a;
          padding: 2px 7px;
          text-transform: uppercase;
        }
        .sub-title {
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 2px;
          color: #ccc;
          text-transform: uppercase;
        }
      `}</style>
    </Layout>
  );
}
