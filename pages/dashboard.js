import Layout from '../components/Layout';
import BanOverlay from '../components/BanOverlay';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const FORMS = [
  { id: 'promotion',       code: 'FORM-001', title: 'Запрос на повышение',   icon: '⬆',  path: '/forms/promotion',        desc: 'Запрос на повышение по рангу',                     tag: 'PERSONNEL', toggleable: true },
  { id: 'transfer',        code: 'FORM-002', title: 'Перевод в отдел',       icon: '⤳',  path: '/forms/transfer',         desc: 'Перевод в другую организацию',                     tag: 'TRANSFER', toggleable: true },
  { id: 'report',          code: 'FORM-003', title: 'Отчёт на повышение',    icon: '▤',  path: '/forms/report',           desc: 'Отчёт на повышение в своём отделе',                tag: 'REPORT', toggleable: true },
  { id: 'highrank',        code: 'FORM-004', title: 'Отчёт на повышение HR', icon: '★',  path: '/forms/high-rank-report', desc: 'Отчёты на повышения от Dep.Head и выше',           tag: 'HIGH-RANK', toggleable: true },
  { id: 'resignation',     code: 'FORM-005', title: 'Рапорт на увольнение',  icon: '✕',  path: '/forms/resignation',      desc: 'Покинуть FIB',                                     tag: 'PERSONNEL', toggleable: true },
  { id: 'reinstatement',   code: 'FORM-006', title: 'Восстановление',        icon: '↻',  path: '/forms/reinstatement',    desc: 'Восстановиться в FIB',                             tag: 'RETURN', toggleable: true },
  { id: 'transferToFib',   code: 'FORM-007', title: 'Перевод в FIB',         icon: '⛨',  path: '/forms/transfer-to-fib',  desc: 'Перевестись в FIB',                                tag: 'TRANSFER', toggleable: true },
  { id: 'weaponRequest',   code: 'FORM-008', title: 'Спец. вооружение',      icon: '⌖',  path: '/forms/weapon-request',   desc: 'Запросить спец. оружие',                           tag: 'ARMORY', toggleable: true },
  { id: 'withdrawal',      code: 'FORM-009', title: 'Снятие ЧС',             icon: '⚿',  path: '/forms/withdrawal',       desc: 'Запрос на снятие ЧС',                              tag: 'CLEARANCE', toggleable: true },
  { id: 'hiring',          code: 'FORM-010', title: 'Трудоустройство',       icon: '⎔',  path: '/forms/hiring',           desc: 'Вступить в FIB',                                   tag: 'RECRUIT', toggleable: true },
  { id: 'claim',           code: 'FORM-011', title: 'Жалоба',                icon: '!',  path: '/forms/claim',            desc: 'Подать жалобу на игрока',                          tag: 'COMPLAINT', toggleable: true },
  { id: 'leave',           code: 'FORM-012', title: 'Отпуск',                icon: '◐',  path: '/forms/leave',            desc: 'Заявка на IC или OOC отпуск',                      tag: 'PERSONNEL', toggleable: true },
  { id: 'db',              code: 'FORM-013', title: 'Запрос на ДБ',          icon: '☰',  path: '/forms/db',               desc: 'Запрос на день блата',                             tag: 'PERSONNEL', toggleable: true },
  { id: 'ukmb',            code: 'FORM-015', title: 'Запрос на УКМБ',        icon: '❖',  path: '/forms/ukmb',             desc: 'Учебно-квалификационный минимум бойца',            tag: 'ACADEMY',   toggleable: true },
  { id: 'exam',            code: 'FORM-014', title: 'Запрос на экзамен',     icon: '◇',  path: '/forms/exam',             desc: 'Запрос на сдачу экзамена',                         tag: 'TRAINING', toggleable: true },
];

const CATEGORIES = [
  { id: 'all',     label: 'ВСЕ ФОРМЫ', icon: '▤', formIds: null },
  { id: 'db',      label: 'ДБ',        icon: '☰', formIds: ['db', 'ukmb'] },
  { id: 'trainee', label: 'TRAINEE',   icon: '◇', formIds: ['exam', 'promotion', 'report'] },
  { id: 'leave',   label: 'ОТПУСК',    icon: '◐', formIds: ['leave'] },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('all');
  const [formStatus, setFormStatus] = useState({});
  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data.banned) {
        setBanned(true);
        setBanReason(data.banReason || 'Ваш доступ к системе заявок заблокирован.');
        setBanUntil(data.banUntil || null);
      }
    }).catch(() => {});

    fetch('/api/forms-status').then(res => res.json()).then(data => {
      if (data.forms) setFormStatus(data.forms);
    }).catch(() => {});
  }, []);

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    setTimeStr(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const activeCategory = CATEGORIES.find(c => c.id === activeCat) || CATEGORIES[0];
  const visibleForms = activeCategory.formIds ? FORMS.filter(f => activeCategory.formIds.includes(f.id)) : FORMS;

  const handleOpen = (form) => {
    const disabled = form.toggleable && formStatus[form.id] === false;
    if (disabled) {
      alert('🚫 Эта форма временно отключена администрацией.');
      return;
    }
    router.push(form.path);
  };

  return (
    <Layout>
      <div className="dash">
        <div className="dossier-head">
          <div className="dh-left">
            <span className="dh-mark">⬛</span>
            <span className="dh-title">FEDERAL INVESTIGATION BUREAU</span>
          </div>
          <div className="dh-right">
            <span className="dh-meta">REF: FIB/FRM/{dateStr.replace(/\./g, '')}</span>
            <span className="dh-sep">·</span>
            <span className="dh-meta">CLASSIFIED</span>
          </div>
        </div>

        <header className="page-head">
          <div className="ph-stamp">DEPARTMENT OF JUSTICE</div>
          <h1 className="ph-title">ФОРМЫ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Единая система подачи заявок · Выберите категорию или бланк</p>
          <div className="ph-rule" />
          <div className="ph-meta">
            <span>ДЕЛО: FIB-FORM-SYS</span>
            <span>·</span>
            <span>СТАТУС: <em>АКТИВНО</em></span>
            <span>·</span>
            <span>{dateStr} {timeStr}</span>
          </div>
        </header>

        <nav className="cats">
          {CATEGORIES.map(cat => {
            const active = activeCat === cat.id;
            const count = cat.formIds ? cat.formIds.length : FORMS.length;
            return (
              <button key={cat.id} className={`cat ${active ? 'active' : ''}`} onClick={() => setActiveCat(cat.id)}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{active ? `[ ${cat.label} ]` : cat.label}</span>
                <span className="cat-count">{String(count).padStart(2, '0')}</span>
              </button>
            );
          })}
        </nav>

        <section className="grid" key={activeCat}>
          {visibleForms.map((form, i) => {
            const isToggleable = !!form.toggleable;
            const isDisabled = isToggleable && formStatus[form.id] === false;

            return (
              <article
                key={form.code}
                className={`folder ${isDisabled ? 'folder-disabled' : ''}`}
                onClick={() => handleOpen(form)}
                style={{ animationDelay: `${i * 0.04}s` }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(form); }}
              >
                <div className="folder-tab">
                  <span className="folder-code">{form.code}</span>
                  <span className="folder-tag">{form.tag}</span>
                </div>

                <div className="folder-body">
                  <div className="folder-icon">{form.icon}</div>
                  <div className="folder-text">
                    <h3 className="folder-title">{form.title}</h3>
                    <p className="folder-desc">{form.desc}</p>
                  </div>
                </div>

                <div className="folder-foot">
                  {isDisabled ? (
                    <>
                      <span className="folder-open folder-open-off">● ОТКЛЮЧЕНО</span>
                      <span className="folder-arrow">×</span>
                    </>
                  ) : (
                    <>
                      <span className="folder-open">ОТКРЫТЬ БЛАНК</span>
                      <span className="folder-arrow">→</span>
                    </>
                  )}
                </div>

                {isToggleable && !isDisabled && <span className="folder-badge folder-badge-on" title="Форма включена">ВКЛ</span>}
                {isToggleable && isDisabled && <span className="folder-badge folder-badge-off" title="Форма отключена">ВЫКЛ</span>}

                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />
              </article>
            );
          })}
        </section>
      </div>
      <BanOverlay show={banned} reason={banReason} until={banUntil} />
      
      {/* Стили оставь из своего старого dashboard.js */}
    </Layout>
  );
}
