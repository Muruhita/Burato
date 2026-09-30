import Layout from '../components/Layout';
import BanOverlay from '../components/BanOverlay';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const FORMS = [
  // ── Все базовые ──
  { id: 'promotion',       code: 'FORM-001', title: 'Запрос на повышение',   icon: '⬆',  path: '/forms/promotion',        desc: 'Запрос на повышение по рангу',                     tag: 'PERSONNEL' },
  { id: 'transfer',        code: 'FORM-002', title: 'Перевод в отдел',       icon: '⤳',  path: '/forms/transfer',         desc: 'Перевод в другую организацию',                     tag: 'TRANSFER' },
  { id: 'report',          code: 'FORM-003', title: 'Отчёт на повышение',    icon: '▤',  path: '/forms/report',           desc: 'Отчёт на повышение в своём отделе',                tag: 'REPORT' },
  { id: 'highrank',        code: 'FORM-004', title: 'Отчёт на повышение HR', icon: '★',  path: '/forms/high-rank-report', desc: 'Отчёты на повышения от Dep.Head и выше',           tag: 'HIGH-RANK' },
  { id: 'resignation',     code: 'FORM-005', title: 'Рапорт на увольнение',  icon: '✕',  path: '/forms/resignation',      desc: 'Покинуть FIB',                                     tag: 'PERSONNEL' },
  { id: 'reinstatement',   code: 'FORM-006', title: 'Восстановление',        icon: '↻',  path: '/forms/reinstatement',    desc: 'Восстановиться в FIB',                             tag: 'RETURN' },
  { id: 'transferToFib',   code: 'FORM-007', title: 'Перевод в FIB',         icon: '⛨',  path: '/forms/transfer-to-fib',  desc: 'Перевестись в FIB',                                tag: 'TRANSFER' },
  { id: 'weaponRequest',   code: 'FORM-008', title: 'Спец. вооружение',      icon: '⌖',  path: '/forms/weapon-request',   desc: 'Запросить спец. оружие',                           tag: 'ARMORY' },
  { id: 'withdrawal',      code: 'FORM-009', title: 'Снятие ЧС',             icon: '⚿',  path: '/forms/withdrawal',       desc: 'Запрос на снятие ЧС',                              tag: 'CLEARANCE' },
  { id: 'hiring',          code: 'FORM-010', title: 'Трудоустройство',       icon: '⎔',  path: '/forms/hiring',           desc: 'Вступить в FIB',                                   tag: 'RECRUIT' },
  { id: 'claim',           code: 'FORM-011', title: 'Жалоба',                icon: '!',  path: '/forms/claim',            desc: 'Подать жалобу на игрока',                          tag: 'COMPLAINT' },
  // ── Отпуск ──
  { id: 'leave',           code: 'FORM-012', title: 'Отпуск',                icon: '◐',  path: '/forms/leave',            desc: 'Заявка на IC или OOC отпуск',                      tag: 'PERSONNEL' },
  // ── ДБ ──
  { id: 'db',              code: 'FORM-013', title: 'Запрос на ДБ',          icon: '☰',  path: '/forms/db',               desc: 'Запрос на день блата',                             tag: 'PERSONNEL' },
  { id: 'ukmb',            code: 'FORM-015', title: 'Запрос на УКМБ',        icon: '❖',  path: '/forms/ukmb',             desc: 'Учебно-квалификационный минимум бойца',            tag: 'ACADEMY' },
  // ── Trainee ──
  { id: 'exam',            code: 'FORM-014', title: 'Запрос на экзамен',     icon: '◇',  path: '/forms/exam',             desc: 'Запрос на сдачу экзамена (устный / практический)', tag: 'TRAINING' },
];

const CATEGORIES = [
  { id: 'all',     label: 'ВСЕ ФОРМЫ', icon: '▤', formIds: null },
  { id: 'db',      label: 'ДБ',        icon: '☰', formIds: ['db', 'ukmb'] },
  { id: 'trainee', label: 'TRAINEE',   icon: '◇', formIds: ['exam'] },
  { id: 'leave',   label: 'ОТПУСК',    icon: '◐', formIds: ['leave'] },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('all');

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.banned) {
          setBanned(true);
          setBanReason(data.banReason || 'Ваш доступ к системе заявок заблокирован.');
          setBanUntil(data.banUntil || null);
        }
      })
      .catch(() => {});
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const activeCategory = CATEGORIES.find(c => c.id === activeCat) || CATEGORIES[0];
  const visibleForms = activeCategory.formIds
    ? FORMS.filter(f => activeCategory.formIds.includes(f.id))
    : FORMS;

  return (
    <Layout>
      <div className="dash">
        {/* ─── ВЕРХНЯЯ СЛУЖЕБНАЯ ПЛАШКА ─── */}
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

        {/* ─── ЗАГОЛОВОК ─── */}
        <header className="page-head">
          <div className="ph-stamp">DEPARTMENT OF JUSTICE</div>
          <h1 className="ph-title">ФОРМЫ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">
            Единая система подачи заявок · Выберите категорию или бланк
          </p>
          <div className="ph-rule" />
          <div className="ph-meta">
            <span>ДЕЛО: FIB-FORM-SYS</span>
            <span>·</span>
            <span>СТАТУС: <em>АКТИВНО</em></span>
            <span>·</span>
            <span>{dateStr} {timeStr}</span>
          </div>
        </header>

        {/* ─── КАТЕГОРИИ ─── */}
        <nav className="cats">
          {CATEGORIES.map(cat => {
            const active = activeCat === cat.id;
            const count = cat.formIds ? cat.formIds.length : FORMS.length;
            return (
              <button
                key={cat.id}
                className={`cat ${active ? 'active' : ''}`}
                onClick={() => setActiveCat(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{active ? `[ ${cat.label} ]` : cat.label}</span>
                <span className="cat-count">{String(count).padStart(2, '0')}</span>
              </button>
            );
          })}
        </nav>

        {/* ─── СЕТКА ФОРМ ─── */}
        <section className="grid" key={activeCat}>
          {visibleForms.map((form, i) => (
            <article
              key={form.code}
              className="folder"
              onClick={() => router.push(form.path)}
              style={{ animationDelay: `${i * 0.04}s` }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push(form.path); }}
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
                <span className="folder-open">ОТКРЫТЬ БЛАНК</span>
                <span className="folder-arrow">→</span>
              </div>

              <span className="corner corner-tl" />
              <span className="corner corner-tr" />
              <span className="corner corner-bl" />
              <span className="corner corner-br" />
            </article>
          ))}
        </section>

        {/* ─── ПОДВАЛ ─── */}
        <footer className="dossier-foot">
          <span>FIB · FORMS TERMINAL</span>
          <span className="df-dash">—</span>
          <span>УПОЛНОМОЧЕННЫЙ ДОСТУП</span>
          <span className="df-dash">—</span>
          <span>v7.1.0</span>
        </footer>
      </div>

      <BanOverlay show={banned} reason={banReason} until={banUntil} />

      <style jsx>{`
        .dash {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 4px 40px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #eaeaea;
        }

        /* ═══ ВЕРХНЯЯ ПЛАШКА ═══ */
        .dossier-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #000;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
          font-size: 11px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: #d0d0d0;
          margin-bottom: 26px;
          animation: fadeIn 0.5s ease;
        }
        .dh-left, .dh-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .dh-mark { color: #fff; font-size: 12px; line-height: 1; }
        .dh-title { color: #fff; font-weight: 700; }
        .dh-meta { color: #888; }
        .dh-sep { color: #444; }

        /* ═══ ЗАГОЛОВОК ═══ */
        .page-head {
          position: relative;
          margin-bottom: 26px;
          animation: fadeIn 0.55s ease;
        }
        .ph-stamp {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid #333;
          color: #888;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
          background: rgba(255,255,255,0.02);
        }
        .ph-title {
          font-size: 56px;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          color: #fff;
          line-height: 1;
          text-transform: uppercase;
        }
        .ph-dot {
          color: #fff;
          animation: blink 1.2s steps(2, start) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .ph-sub {
          color: #888;
          font-size: 14px;
          margin: 12px 0 0;
          letter-spacing: 0.3px;
        }
        .ph-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 20px 0 12px;
        }
        .ph-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.4px;
          color: #777;
          text-transform: uppercase;
        }
        .ph-meta em { color: #fff; font-style: normal; font-weight: 700; }

        /* ═══ КАТЕГОРИИ ═══ */
        .cats {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 22px;
          animation: fadeIn 0.6s ease;
        }
        .cat {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          background: transparent;
          border: 1px solid #2a2a2a;
          color: #999;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          transition: all 0.18s ease;
        }
        .cat:hover {
          color: #fff;
          border-color: #555;
        }
        .cat.active {
          background: #fff;
          border-color: #fff;
          color: #000;
          font-weight: 800;
        }
        .cat-icon { font-size: 12px; line-height: 1; }
        .cat-count {
          font-size: 10px;
          opacity: 0.6;
          padding-left: 6px;
          border-left: 1px solid currentColor;
          line-height: 1;
        }
        .cat.active .cat-count { opacity: 0.9; }

        /* ═══ СЕТКА ═══ */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        /* ═══ ПАПКА-КАРТОЧКА ═══ */
        .folder {
          position: relative;
          background: #0c0c0c;
          border: 1px solid #262626;
          border-radius: 2px;
          padding: 22px 22px 18px;
          cursor: pointer;
          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;
          opacity: 0;
          animation: cardIn 0.5s ease forwards;
          overflow: hidden;
        }
        .folder:hover,
        .folder:focus-visible {
          background: #fff;
          border-color: #fff;
          transform: translateY(-4px);
          box-shadow:
            0 14px 40px rgba(0,0,0,0.6),
            0 0 0 1px #fff;
          outline: none;
        }
        .folder:hover .folder-title,
        .folder:hover .folder-desc,
        .folder:hover .folder-code,
        .folder:hover .folder-tag,
        .folder:hover .folder-icon,
        .folder:hover .folder-open,
        .folder:hover .folder-arrow,
        .folder:hover .corner {
          color: #000;
          border-color: #000;
        }
        .folder:hover .folder-tab { border-bottom-color: #000; }
        .folder:hover .folder-foot { border-top-color: #000; }

        .folder-tab {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          margin-bottom: 16px;
          border-bottom: 1px dashed #2a2a2a;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          transition: border-color 0.25s ease;
        }
        .folder-code {
          color: #fff;
          font-weight: 700;
          transition: color 0.25s ease;
        }
        .folder-tag {
          color: #666;
          transition: color 0.25s ease;
        }

        .folder-body {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          min-height: 78px;
        }
        .folder-icon {
          flex: 0 0 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #333;
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          background: #000;
          transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .folder:hover .folder-icon { background: transparent; }
        .folder-text { flex: 1; min-width: 0; }
        .folder-title {
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.4px;
          margin: 2px 0 6px;
          line-height: 1.3;
          transition: color 0.25s ease;
        }
        .folder-desc {
          color: #888;
          font-size: 12.5px;
          line-height: 1.5;
          margin: 0;
          transition: color 0.25s ease;
        }

        .folder-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
          padding-top: 12px;
          border-top: 1px solid #1f1f1f;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #666;
          transition: color 0.25s ease, border-color 0.25s ease;
        }
        .folder-open { color: inherit; transition: color 0.25s ease; }
        .folder-arrow {
          font-size: 14px;
          color: #fff;
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .folder:hover .folder-arrow { transform: translateX(4px); }

        .corner {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: #333;
          border-style: solid;
          border-width: 0;
          transition: border-color 0.25s ease;
          pointer-events: none;
        }
        .corner-tl { top: 6px;  left: 6px;  border-top-width: 1px; border-left-width: 1px; }
        .corner-tr { top: 6px;  right: 6px; border-top-width: 1px; border-right-width: 1px; }
        .corner-bl { bottom: 6px; left: 6px;  border-bottom-width: 1px; border-left-width: 1px; }
        .corner-br { bottom: 6px; right: 6px; border-bottom-width: 1px; border-right-width: 1px; }

        /* ═══ ПОДВАЛ ═══ */
        .dossier-foot {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px dashed #262626;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
          flex-wrap: wrap;
          animation: fadeIn 0.7s ease;
        }
        .df-dash { color: #333; }

        /* ═══ АНИМАЦИИ ═══ */
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ═══ МОБИЛЬНАЯ АДАПТАЦИЯ ═══ */
        @media (max-width: 640px) {
          .dossier-head {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            font-size: 10px;
          }
          .ph-title { font-size: 34px; letter-spacing: 2px; }
          .ph-sub { font-size: 13px; }
          .cats { gap: 4px; }
          .cat { padding: 8px 10px; font-size: 10px; letter-spacing: 1.2px; }
          .cat-count { display: none; }
          .grid { grid-template-columns: 1fr; gap: 12px; }
          .folder { padding: 18px 16px 14px; }
          .folder-body { gap: 12px; min-height: auto; }
          .folder-icon { flex: 0 0 38px; height: 38px; font-size: 18px; }
          .folder-title { font-size: 14px; }
          .folder-desc { font-size: 12px; }
        }
      `}</style>
    </Layout>
  );
}
