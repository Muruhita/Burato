export default function SystemAlert({ show, onClose, title = 'ДОСТУП ЗАПРЕЩЕН', message = 'Эта форма временно отключена администрацией.' }) {
  if (!show) return null;

  return (
    <div className="sys-overlay">
      <div className="sys-scanlines" />
      <div className="sys-box">
        <div className="sys-head">
          <span className="sys-dot" />
          <span className="sys-title">SYSTEM_ALERT // ERR_403</span>
        </div>
        
        <div className="sys-body">
          <div className="sys-icon-wrap">
            <svg className="sys-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              <circle cx="12" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </div>
          
          <h2 className="sys-title-main glitch" data-text={title}>{title}</h2>
          <p className="sys-msg">{message}</p>
        </div>

        <div className="sys-foot">
          <button className="sys-btn" onClick={onClose}>ПОНЯТНО</button>
        </div>
      </div>

      <style jsx>{`
        .sys-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(10, 5, 5, 0.88);
          backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.25s ease;
          padding: 20px;
        }

        .sys-scanlines {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, rgba(255, 50, 50, 0.05) 0px, rgba(255, 50, 50, 0.05) 1px, transparent 1px, transparent 3px);
          animation: scan 4s linear infinite;
        }
        @keyframes scan { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }

        .sys-box {
          position: relative; width: 100%; max-width: 460px;
          background: #050505; border: 1px solid #ff3333;
          box-shadow: 0 0 40px rgba(255, 50, 50, 0.2), inset 0 0 20px rgba(255, 50, 50, 0.05);
          animation: boxIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        @keyframes boxIn { 0% { transform: scale(0.9) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }

        .sys-head {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 14px; background: #1a0505; border-bottom: 1px solid #ff3333;
          font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 2px; color: #ff8080;
          text-transform: uppercase;
        }
        .sys-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #ff3333;
          box-shadow: 0 0 8px #ff3333; animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        .sys-body { padding: 36px 24px; text-align: center; }

        .sys-icon-wrap {
          width: 72px; height: 72px; margin: 0 auto 20px;
          border: 1px dashed rgba(255, 50, 50, 0.4); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .sys-icon-wrap::before {
          content: ''; position: absolute; inset: -8px; border-radius: 50%;
          border: 1px solid rgba(255, 50, 50, 0.1); animation: pulseRing 2s infinite;
        }
        @keyframes pulseRing { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }

        .sys-lock { width: 32px; height: 32px; color: #ff4444; filter: drop-shadow(0 0 10px rgba(255, 50, 50, 0.8)); }

        .sys-title-main {
          font-family: ui-monospace, monospace; font-size: 22px; font-weight: 900;
          color: #fff; letter-spacing: 2px; margin: 0 0 12px;
          text-shadow: 0 0 10px rgba(255, 50, 50, 0.5);
        }

        .glitch { position: relative; display: inline-block; }
        .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; }
        .glitch::before { color: #00e5ff; animation: gl1 3s infinite; clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%); }
        .glitch::after { color: #ff44aa; animation: gl2 3s infinite; clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%); }
        @keyframes gl1 { 0%, 90%, 100% { opacity: 0; transform: translate(0); } 92% { opacity: 0.8; transform: translate(-2px, -1px); } 94% { opacity: 0.8; transform: translate(2px, 1px); } 96% { opacity: 0; } }
        @keyframes gl2 { 0%, 90%, 100% { opacity: 0; transform: translate(0); } 93% { opacity: 0.8; transform: translate(2px, 1px); } 95% { opacity: 0.8; transform: translate(-2px, -1px); } 97% { opacity: 0; } }

        .sys-msg {
          color: #aaa; font-size: 13.5px; line-height: 1.6; margin: 0;
        }

        .sys-foot { padding: 0 24px 24px; display: flex; justify-content: center; }
        .sys-btn {
          width: 100%; padding: 12px; background: transparent; border: 1px solid #ff3333;
          color: #ff3333; font-family: ui-monospace, monospace; font-size: 11px;
          font-weight: 800; letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
          text-transform: uppercase;
        }
        .sys-btn:hover { background: #ff3333; color: #fff; box-shadow: 0 0 20px rgba(255, 50, 50, 0.4); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
