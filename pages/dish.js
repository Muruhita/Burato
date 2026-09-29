import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

const EDITOR_ID = '1018113109346504744';
const MAX_LINKS = 10;

export default function DisH() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ links: [], text: '' });
  const [editMode, setEditMode] = useState(false);

  const [formLinks, setFormLinks] = useState([{ label: '', url: '' }]);
  const [formText, setFormText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const isEditor = me?.id === EDITOR_ID;

  const load = () => {
    fetch('/api/dish')
      .then(res => res.json())
      .then(d => {
        const links = Array.isArray(d.links) ? d.links : [];
        setData({ links, text: d.text || '' });
        setFormLinks(links.length > 0 ? links : [{ label: '', url: '' }]);
        setFormText(d.text || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(d => { if (d.user) setMe(d.user); })
      .catch(() => {});
    load();
  }, []);

  const addLink = () => {
    if (formLinks.length >= MAX_LINKS) return;
    setFormLinks([...formLinks, { label: '', url: '' }]);
  };

  const removeLink = (idx) => setFormLinks(formLinks.filter((_, i) => i !== idx));

  const updateLink = (idx, field, value) => {
    const next = [...formLinks];
    next[idx][field] = value;
    setFormLinks(next);
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: formLinks, text: formText })
      });
      const d = await res.json();
      if (res.ok) {
        setMsg('✅ СОХРАНЕНО');
        setEditMode(false);
        load();
        setTimeout(() => setMsg(''), 2500);
      } else {
        setMsg('❌ ' + (d.error || 'ОШИБКА'));
      }
    } catch (e) {
      setMsg('❌ ОШИБКА СЕТИ');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormLinks(data.links.length > 0 ? data.links : [{ label: '', url: '' }]);
    setFormText(data.text || '');
    setMsg('');
  };

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp ph-stamp-alert">⚠ ALERT · DISCORD ISSUES</div>
          <h1 className="ph-title">ПРОБЛЕМЫ С DISCORD<span className="ph-dot">?</span></h1>
          <p className="ph-sub">Полезные ссылки и информация по решению проблем с Discord</p>
          <div className="ph-rule ph-rule-alert" />
        </header>

        {loading ? (
          <div className="panel">
            <div className="panel-body center">
              <div className="spinner-dark" />
              <p className="muted">ЗАГРУЗКА ДАННЫХ...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ССЫЛКИ */}
            <section className="panel">
              <div className="panel-head panel-head-alert">
                <span className="p-num">01</span>
                <h2 className="p-title">ССЫЛКИ</h2>
                <span className="p-tag">{data.links.length} ЗАПИСЕЙ</span>
              </div>
              <div className="panel-body no-pad">
                {data.links.length > 0 ? (
                  <div className="dish-links">
                    {data.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dish-row"
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        <span className="d-idx">[{String(i + 1).padStart(2, '0')}]</span>
                        <span className="d-label">{link.label}</span>
                        <span className="d-arrow">→</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <span className="empty-icon">//</span>
                    <p>ССЫЛКИ НЕ ДОБАВЛЕНЫ</p>
                  </div>
                )}
              </div>
            </section>

            {/* ТЕКСТ */}
            {data.text && (
              <section className="panel">
                <div className="panel-head panel-head-alert">
                  <span className="p-num">02</span>
                  <h2 className="p-title">ДОПОЛНИТЕЛЬНО</h2>
                  <span className="p-tag">NOTE</span>
                </div>
                <div className="panel-body">
                  <div className="dish-text">{data.text}</div>
                </div>
              </section>
            )}
          </>
        )}

        {/* РЕДАКТОР */}
        {isEditor && (
          <section className="panel panel-owner">
            <div className="panel-head panel-head-owner">
              <span className="p-num">⌘</span>
              <h2 className="p-title">OWNER MODE</h2>
              {!editMode ? (
                <button className="p-edit" onClick={() => setEditMode(true)}>✎ РЕД.</button>
              ) : (
                <button className="p-edit p-edit-danger" onClick={cancelEdit}>✕ ОТМЕНА</button>
              )}
            </div>

            {editMode && (
              <div className="panel-body">
                <span className="lbl">ССЫЛКИ ({formLinks.length}/{MAX_LINKS})</span>
                {formLinks.map((link, idx) => (
                  <div key={idx} className="link-edit-row">
                    <span className="ler-idx">[{idx + 1}]</span>
                    <div className="ler-fields">
                      <input
                        className="field"
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(idx, 'label', e.target.value)}
                        placeholder="Название ссылки"
                      />
                      <input
                        className="field"
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(idx, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <button
                      type="button"
                      className="ler-remove"
                      onClick={() => removeLink(idx)}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {formLinks.length < MAX_LINKS && (
                  <button type="button" className="add-link" onClick={addLink}>
                    + ДОБАВИТЬ ССЫЛКУ
                  </button>
                )}

                <div style={{ marginTop: 22 }}>
                  <span className="lbl">ТЕКСТ НИЖЕ</span>
                  <textarea
                    className="field"
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    rows="6"
                    placeholder="Введите текст под ссылками. Переносы строк сохраняются."
                  />
                </div>

                <div className="row">
                  <button className="btn btn-solid" onClick={save} disabled={saving}>
                    {saving ? '⏳ СОХРАНЕНИЕ...' : '💾 СОХРАНИТЬ'}
                  </button>
                </div>

                {msg && <p className="msg">{msg}</p>}
              </div>
            )}
          </section>
        )}
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
        .ph-stamp-alert {
          color: #ff8080;
          border-color: #553030;
          background: rgba(255, 60, 60, 0.05);
        }
        .ph-title {
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 0;
          color: #fff;
          line-height: 1.05;
          text-transform: uppercase;
        }
        .ph-dot { color: #ff4444; animation: blink 1.2s steps(2, start) infinite; }
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
        .ph-rule-alert {
          background: linear-gradient(90deg, #ff4444 0%, #553030 30%, #1a1a1a 100%);
        }

        .panel {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          margin-bottom: 16px;
          animation: cardIn 0.45s ease;
        }
        .panel-owner { border-color: #2a2a3a; }
        .panel-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
        }
        .panel-head-alert { border-bottom-color: #2a1a1a; }
        .panel-head-owner { border-bottom-color: #2a2a3a; background: #0a0a0f; }
        .p-num {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: #666;
          font-weight: 700;
        }
        .p-title {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.4px;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
          flex: 1;
        }
        .p-tag {
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: #666;
          border: 1px solid #2a2a2a;
          padding: 2px 8px;
        }
        .p-edit {
          background: transparent;
          border: 1px solid #333;
          color: #ccc;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          padding: 4px 10px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .p-edit:hover { background: #fff; color: #000; border-color: #fff; }
        .p-edit-danger { color: #ff8080; border-color: #553030; }
        .p-edit-danger:hover { background: #ff4444; border-color: #ff4444; color: #fff; }

        .panel-body { padding: 20px; }
        .panel-body.no-pad { padding: 0; }
        .center { text-align: center; padding: 40px; }

        .dish-links { display: flex; flex-direction: column; }
        .dish-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 20px;
          border-bottom: 1px solid #1a1a1a;
          color: #eaeaea;
          text-decoration: none;
          font-size: 14px;
          opacity: 0;
          animation: rowIn 0.4s ease forwards;
          transition: background 0.18s, color 0.18s;
        }
        .dish-row:last-child { border-bottom: none; }
        .dish-row:hover {
          background: #ff4444;
          color: #fff;
        }
        .dish-row:hover .d-idx,
        .dish-row:hover .d-arrow { color: #fff; }
        .d-idx {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1px;
          color: #666;
          flex-shrink: 0;
          transition: color 0.18s;
        }
        .d-label {
          flex: 1;
          font-weight: 600;
        }
        .d-arrow {
          color: #fff;
          font-size: 16px;
          flex-shrink: 0;
          transition: transform 0.2s, color 0.18s;
        }
        .dish-row:hover .d-arrow { transform: translateX(4px); }

        .dish-text {
          white-space: pre-line;
          line-height: 1.75;
          font-size: 14.5px;
          color: #d8d8d8;
        }

        .empty {
          padding: 50px 20px;
          text-align: center;
          color: #666;
          border-bottom: 1px dashed #1f1f1f;
        }
        .empty-icon {
          display: block;
          font-family: ui-monospace, monospace;
          font-size: 32px;
          color: #2a2a2a;
          letter-spacing: 6px;
          margin-bottom: 12px;
        }
        .empty p {
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 2px;
          margin: 0;
        }

        .lbl {
          display: block;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .lbl::before { content: '▸ '; color: #333; }

        .field {
          width: 100%;
          padding: 11px 14px;
          background: #060606;
          border: 1px solid #262626;
          color: #fff;
          border-radius: 0;
          font-size: 13.5px;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .field:focus { border-color: #fff; }
        textarea.field { resize: vertical; min-height: 100px; line-height: 1.6; }

        .link-edit-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: #060606;
          border: 1px solid #1a1a1a;
          margin-bottom: 10px;
        }
        .ler-idx {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          color: #666;
          padding-top: 12px;
          min-width: 30px;
          flex-shrink: 0;
        }
        .ler-fields {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }
        .ler-fields .field { margin: 0; }
        .ler-remove {
          width: 34px;
          height: 34px;
          background: transparent;
          border: 1px solid #553030;
          color: #ff8080;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .ler-remove:hover {
          background: #ff4444;
          border-color: #ff4444;
          color: #fff;
        }

        .add-link {
          width: 100%;
          padding: 11px;
          background: transparent;
          border: 1px dashed #333;
          color: #ccc;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.8px;
          transition: all 0.18s;
        }
        .add-link:hover { background: #131313; color: #fff; border-style: solid; }

        .row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
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
        .btn:hover { background: #fff; border-color: #fff; color: #000; }
        .btn-solid { background: #fff; color: #000; border-color: #fff; font-weight: 800; }
        .btn-solid:hover { background: #ccc; border-color: #ccc; }
        .btn-solid:disabled { opacity: 0.5; cursor: not-allowed; }

        .muted {
          color: #666;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          margin: 12px 0 0;
          text-transform: uppercase;
        }
        .msg {
          margin-top: 12px;
          color: #4caf50;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.4px;
        }

        .spinner-dark {
          width: 32px;
          height: 32px;
          border: 3px solid #1f1f1f;
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .ph-title { font-size: 24px; letter-spacing: 1.6px; line-height: 1.1; }
          .panel-body { padding: 14px; }
          .dish-row { padding: 12px 14px; gap: 10px; font-size: 13px; }
          .link-edit-row { flex-direction: column; }
          .ler-idx { padding-top: 0; }
          .ler-remove { align-self: flex-end; }
        }
      `}</style>
    </Layout>
  );
}
