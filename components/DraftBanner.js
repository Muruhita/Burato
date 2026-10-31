import { formatSavedAt } from '../hooks/useFormDraft';

export default function DraftBanner({ savedAt, hasDraft, clear }) {
  if (!hasDraft || !savedAt) return null;

  return (
    <div className="draft">
      <span className="draft-icon">💾</span>
      <span className="draft-text">
        Черновик сохранён <strong>{formatSavedAt(savedAt)}</strong>
      </span>
      <button
        type="button"
        className="draft-clear"
        onClick={clear}
        title="Удалить черновик"
      >
        ✕ ОЧИСТИТЬ
      </button>
      <style jsx>{`
        .draft {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; margin-bottom: 16px;
          background: rgba(79, 195, 247, 0.06);
          border: 1px solid rgba(79, 195, 247, 0.3);
          border-left: 3px solid #4fc3f7;
          font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 1px;
          color: #8fd9ff;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .draft-icon { font-size: 14px; line-height: 1; }
        .draft-text { flex: 1; }
        .draft-text strong { color: #fff; font-weight: 700; }
        .draft-clear {
          background: transparent;
          border: 1px solid #2a4a5a;
          color: #8fd9ff;
          padding: 5px 10px;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 10px; letter-spacing: 1.4px;
          text-transform: uppercase;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .draft-clear:hover {
          background: #ff4444;
          border-color: #ff4444;
          color: #fff;
        }
        @media (max-width: 500px) {
          .draft { flex-wrap: wrap; font-size: 10px; }
          .draft-clear { width: 100%; }
        }
      `}</style>
    </div>
  );
}
