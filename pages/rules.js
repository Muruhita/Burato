import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
// import { ADMIN_IDS } from '../lib/admins';

export default function Rules() {
  const [content, setContent] = useState('ЗАГРУЗКА...');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetch('/api/rules')
      .then(res => res.json())
      .then(data => {
        setContent(data.rules || 'Правила пока не заполнены.');
        setNewContent(data.rules || '');
      })
      .catch(() => setContent('Не удалось загрузить правила.'));

    fetch('/api/me')
      .then(res => res.json())
      .then(data => setIsAdmin(data.user && ADMIN_IDS.includes(data.user.id)));
  }, []);

  const saveContent = async () => {
    const res = await fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newContent })
    });
    const data = await res.json();
    if (data.message) {
      setContent(newContent);
      setEditMode(false);
    }
  };

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">DOC · RULES · OFFICIAL</div>
          <h1 className="ph-title">ПРАВИЛА<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Официальные правила использования бота FIB Forms</p>
          <div className="ph-rule" />
        </header>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">§</span>
            <h2 className="p-title">РЕГЛАМЕНТ</h2>
            <span className="p-tag">{editMode ? 'EDIT' : 'VIEW'}</span>
            {isAdmin && !editMode && (
              <button className="p-edit" onClick={() => setEditMode(true)}>✎ РЕД.</button>
            )}
          </div>

          <div className="panel-body">
            {editMode ? (
              <>
                <span className="lbl">ТЕКСТ ПРАВИЛ</span>
                <textarea
                  className="field"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows="18"
                  placeholder="Введите правила использования бота..."
                />
                <div className="row">
                  <button className="btn btn-solid" onClick={saveContent}>💾 СОХРАНИТЬ</button>
                  <button className="btn" onClick={() => setEditMode(false)}>ОТМЕНА</button>
                </div>
              </>
            ) : (
              <div className="text-content">{content}</div>
            )}
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
        .ph-dot {
          color: #fff;
          animation: blink 1.2s steps(2, start) infinite;
        }
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
          animation: cardIn 0.45s ease;
        }
        .panel-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
        }
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

        .panel-body { padding: 22px; }

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
          padding: 12px 14px;
          background: #060606;
          border: 1px solid #262626;
          color: #fff;
          border-radius: 0;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .field:focus { border-color: #fff; }
        textarea.field {
          resize: vertical;
          min-height: 280px;
          line-height: 1.7;
        }

        .text-content {
          white-space: pre-line;
          line-height: 1.8;
          font-size: 15px;
          color: #d8d8d8;
          word-break: break-word;
          min-height: 120px;
        }

        .row { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
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

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 640px) {
          .ph-title { font-size: 28px; letter-spacing: 2px; }
          .panel-body { padding: 16px; }
          .text-content { font-size: 14px; }
        }
      `}</style>
    </Layout>
  );
}
