import Layout from '../../components/Layout';
import SubmitOverlay from '../../components/SubmitOverlay';
import BanOverlay from '../../components/BanOverlay';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function WeaponRequestForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [formData, setFormData] = useState({ rank: '', department: '', item: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  const departments = ['IB', 'CID', 'FA', 'HRT', 'ATF', 'AF', 'OCU', 'DEA', 'FNA', 'NSB'];
  const items = [
    'Дрон',
    'Высокоточная винтовка (Прецизионная винтовка)',
    'Heave Sniper Mk1',
    'Heave Sniper Mk2'
  ];

  const deptMap = {
    'ib': 'IB', 'cid': 'CID', 'fa': 'FA', 'hrt': 'HRT',
    'atf': 'ATF', 'af': 'AF', 'ocu': 'OCU', 'dea': 'DEA',
    'fna': 'FNA', 'nsb': 'NSB', 'trainee': 'Trainee'
  };

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.nickname) setNickname(data.nickname);
        if (data.department) {
          const deptName = deptMap[data.department] || data.department;
          setFormData(prev => ({ ...prev, department: deptName }));
        }
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
        body: JSON.stringify({ type: 'weaponRequest', fullName: nickname, ...formData })
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
            <div className="fh-stamp">FORM-008 · ARMORY</div>
            <h1 className="fh-title">Спец. вооружение</h1>
            <p className="fh-sub">
              Запрос на получение специального вооружения. Указывайте корректный ранг и отдел.
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
              <label className="lbl">Ваш ранг</label>
              <input
                className="field"
                type="text"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                required
                placeholder="Например: 7"
              />
            </div>

            <div className="field-block">
              <label className="lbl">Ваш отдел</label>
              <select
                className="field"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">-- ВЫБЕРИТЕ ОТДЕЛ --</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="field-block">
              <label className="lbl">Предмет на выбор</label>
              <select
                className="field"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                required
              >
                <option value="">-- ВЫБЕРИТЕ ПРЕДМЕТ --</option>
                {items.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || success || banned}>
              {submitting
                ? <><span className="btn-spinner" /> ОТПРАВКА...</>
                : banned
                  ? '🚫 ДОСТУП ЗАБЛОКИРОВАН'
                  : '→ ОТПРАВИТЬ ЗАПРОС'}
            </button>
          </form>
        </div>
      </div>

      <SubmitOverlay show={success} text="Запрос на вооружение отправлен!" />
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
    </Layout>
  );
}
