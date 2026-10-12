import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const THEMES = [
  {
    id: 'default',
    name: 'Чёрная',
    desc: 'Классическая тёмная тема FIB',
    swatches: ['#0a0a0a', '#1f1f1f', '#eaeaea'],
  },
  {
    id: 'white',
    name: 'Белая',
    desc: 'Светлая тема для дневного времени',
    swatches: ['#f2f2f2', '#ffffff', '#0a0a0a'],
  },
  {
    id: 'blue',
    name: 'Синяя',
    desc: 'Холодный акцент · стабильность',
    swatches: ['#0a0a0a', '#3b82f6', '#1e3a8a'],
  },
  {
    id: 'green',
    name: 'Зелёная',
    desc: 'Тёплый акцент · рост',
    swatches: ['#0a0a0a', '#10b981', '#065f46'],
  },
  {
    id: 'purple',
    name: 'Фиолетовая',
    desc: 'Холодный неон · глубина',
    swatches: ['#0a0a0a', '#a855f7', '#4c1d95'],
  },
];

export default function Settings() {
  const [current, setCurrent] = useState('default');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fib-theme') || 'default';
      setCurrent(saved);
    } catch {}
  }, []);

  const applyTheme = (id) => {
    try {
      localStorage.setItem('fib-theme', id);
      document.documentElement.setAttribute('data-theme', id);
    } catch {}
    setCurrent(id);
  };

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">SETTINGS · APPEARANCE</div>
          <h1 className="ph-title">НАСТРОЙКИ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Персонализация внешнего вида FIB Forms</p>
          <div className="ph-rule" />
        </header>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">ЦВЕТОВАЯ ТЕМА</h2>
            <span className="p-tag">
              {THEMES.find(t => t.id === current)?.name.toUpperCase() || '—'}
            </span>
          </div>
          <div className="panel-body">
            <p className="hint">
              Выбор сохраняется в этом браузере. Тема применяется мгновенно.
            </p>

            <div className="theme-grid">
              {THEMES.map(t => {
                const active = current === t.id;
                return (
                  <button
                    key={t.id}
                    className={`theme-card ${active ? 'active' : ''}`}
                    onClick={() => applyTheme(t.id)}
                    type="button"
                  >
                    <div className="tc-preview">
                      {t.swatches.map((c, i) => (
                        <span key={i} className="tc-swatch" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="tc-name">
                      {t.name}
                      {active && <span className="tc-check">✓</span>}
                    </div>
                    <div className="tc-desc">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="panel panel-muted">
          <div className="panel-head">
            <span className="p-num">02</span>
            <h2 className="p-title">СБРОС</h2>
          </div>
          <div className="panel-body">
            <p className="hint">
              Вернуть тему к стандартной чёрной.
            </p>
            <button
              className="btn btn-danger"
              onClick={() => applyTheme('default')}
              disabled={current === 'default'}
            >
              ↻ СБРОСИТЬ ТЕМУ
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .info { max-width: 860px; margin: 0 auto; }

        .page-head { margin-bottom: 26px; animation: fadeIn 0.45s ease; }
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
        }
        .ph-title {
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 0;
          color: #fff;
          line-height: 1;
          text-transform: uppercase;
        }
        .ph-dot { color: #fff; animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .ph-sub { color: #888; font-size: 13px; margin: 12px 0 0; }
        .ph-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 0;
        }

        .panel {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          margin-bottom: 16px;
          animation: cardIn 0.45s ease;
        }
        .panel-muted { background: #0a0a0a; border-color: #1a1a1a; }
        .panel-head {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
        }
        .p-num {
          font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 2px;
          color: #666; font-weight: 700;
        }
        .p-title {
          font-size: 12px; font-weight: 800; letter-spacing: 2.4px;
          color: #fff; margin: 0; text-transform: uppercase; flex: 1;
        }
        .p-tag {
          font-family: ui-monospace, monospace;
          font-size: 9px; letter-spacing: 2px;
          color: #666; border: 1px solid #2a2a2a;
          padding: 2px 8px;
        }

        .panel-body { padding: 22px; }

        .hint {
          color: #888;
          font-size: 12.5px;
          line-height: 1.6;
          margin: 0 0 18px;
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .theme-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          background: #060606;
          border: 1px solid #262626;
          color: #eaeaea;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .theme-card:hover {
          border-color: #555;
          transform: translateY(-2px);
        }
        .theme-card.active {
          border-color: #fff;
          background: #0f0f0f;
          box-shadow: 0 0 0 1px #fff;
        }

        .tc-preview {
          display: flex;
          height: 44px;
          border: 1px solid #1a1a1a;
          overflow: hidden;
        }
        .tc-swatch {
          flex: 1;
          display: block;
        }

        .tc-name {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: ui-monospace, monospace;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: #fff;
        }
        .theme-card.active .tc-name { color: #fff; }

        .tc-check {
          color: #4caf50;
          font-size: 14px;
          font-weight: 900;
        }

        .tc-desc {
          color: #666;
          font-size: 11.5px;
          line-height: 1.5;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          background: transparent;
          border: 1px solid #333;
          color: #eaeaea;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .btn:hover:not(:disabled) {
          background: #fff;
          border-color: #fff;
          color: #000;
        }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-danger { color: #ff8080; border-color: #553030; }
        .btn-danger:hover:not(:disabled) {
          background: #ff4444;
          border-color: #ff4444;
          color: #fff;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 640px) {
          .ph-title { font-size: 28px; letter-spacing: 2px; }
          .panel-body { padding: 16px; }
          .theme-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .theme-card { padding: 12px; }
          .tc-preview { height: 34px; }
          .tc-name { font-size: 11px; letter-spacing: 1.2px; }
          .tc-desc { font-size: 10.5px; }
        }
      `}</style>
    </Layout>
  );
}
