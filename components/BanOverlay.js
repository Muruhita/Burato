import { useRouter } from 'next/router';

export default function BanOverlay({
  show,
  reason = 'Вы были заблокированы',
  until = null,
  onClose = null
}) {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) onClose();
    router.push('/dashboard');
  };

  if (!show) return null;

  return (
    <div className="ban-overlay">
      {/* CRT-шум */}
      <div className="ban-scanlines" />
      {/* Красная пульсирующая аура */}
      <div className="ban-aura" />

      <div className="ban-box">
        {/* Верхняя служебная полоса */}
        <div className="bb-topstrip">
          <span className="bb-mark">■</span>
          <span className="bb-label">ACCESS DENIED</span>
          <span className="bb-spacer" />
          <span className="bb-code">ERR-403</span>
        </div>

        {/* Иконка — предупреждение */}
        <div className="bb-icon-wrap">
          <div className="bb-icon-ring" />
          <div className="bb-icon-ring-inner" />
          <svg className="bb-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L1 21h22L12 2z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="18" r="1" fill="currentColor"/>
          </svg>
        </div>

        {/* Заголовок с глитч-эффектом */}
        <h2 className="bb-title">
          <span className="bb-glitch" data-text="ДОСТУП ЗАБЛОКИРОВАН">ДОСТУП ЗАБЛОКИРОВАН</span>
        </h2>

        <div className="bb-divider">
          <span className="bb-div-line" />
          <span className="bb-div-mark">§</span>
          <span className="bb-div-line" />
        </div>

        {/* Причина */}
        <div className="bb-reason-block">
          <div className="bb-reason-label">/// ПРИЧИНА</div>
          <div className="bb-reason">{reason}</div>
        </div>

        {/* Срок */}
        {until && (
          <div className="bb-until-block">
            <span className="bb-until-key">СРОК</span>
            <span className="bb-until-val">{until}</span>
          </div>
        )}

        {/* Подсказка */}
        <div className="bb-hint">
          <div className="bb-hint-label">/// ОБЖАЛОВАНИЕ</div>
          <p className="bb-hint-text">
            Если вы считаете это ошибкой — обратитесь в Discord к <strong>@muruh1ta</strong> (ASS|AF), в крайнем случае к <strong>Dep.Dir</strong> или <strong>Foren (COD)</strong>.
          </p>
        </div>

        {/* Кнопка */}
        <button className="bb-btn" onClick={handleClose}>
          <span className="bb-btn-arrow">←</span>
          <span>ВЕРНУТЬСЯ В ПАНЕЛЬ</span>
        </button>

        {/* Углы */}
        <span className="bb-corner bb-corner-tl" />
        <span className="bb-corner bb-corner-tr" />
        <span className="bb-corner bb-corner-bl" />
        <span className="bb-corner bb-corner-br" />
      </div>

      <style jsx>{`
        .ban-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(30, 5, 5, 0.94) 0%, rgba(5, 5, 5, 0.98) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: overlayIn 0.35s ease;
          overflow: hidden;
          padding: 20px;
        }

        /* ─── CRT-шум ─── */
        .ban-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(255, 60, 60, 0.03) 0px,
            rgba(255, 60, 60, 0.03) 1px,
            transparent 1px,
            transparent 3px
          );
          pointer-events: none;
          animation: scanMove 8s linear infinite;
        }
        @keyframes scanMove {
          0%   { background-position: 0 0; }
          100% { background-position: 0 120px; }
        }

        /* ─── Красная аура ─── */
        .ban-aura {
          position: absolute;
          width: 620px;
          height: 620px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 40, 40, 0.22), transparent 65%);
          filter: blur(80px);
          pointer-events: none;
          animation: auraPulse 3.2s ease-in-out infinite;
        }
        @keyframes auraPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }

        /* ─── Основная коробка ─── */
        .ban-box {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: #0a0a0a;
          border: 1px solid #2a1a1a;
          padding: 0 0 28px;
          overflow: hidden;
          animation: boxIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 60, 60, 0.06),
            0 0 100px rgba(255, 20, 20, 0.2);
        }
        @keyframes boxIn {
          0%   { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* ─── Верхняя полоса ─── */
        .bb-topstrip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: #150808;
          border-bottom: 1px solid #3a1a1a;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: #a06060;
        }
        .bb-mark { color: #ff4444; font-size: 11px; line-height: 1; }
        .bb-label { color: #ff8080; font-weight: 800; }
        .bb-spacer { flex: 1; }
        .bb-code {
          color: #553030;
          font-weight: 700;
        }

        /* ─── Иконка ─── */
        .bb-icon-wrap {
          position: relative;
          width: 92px;
          height: 92px;
          margin: 32px auto 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bb-icon-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(255, 60, 60, 0.35);
          animation: ringPulse 2.2s ease-in-out infinite;
        }
        .bb-icon-ring-inner {
          position: absolute;
          inset: 12px;
          border-radius: 50%;
          border: 1px dashed rgba(255, 60, 60, 0.25);
          animation: spinSlow 12s linear infinite;
        }
        @keyframes spinSlow {
          to { transform: rotate(360deg); }
        }
        @keyframes ringPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 60, 60, 0.4);
            border-color: rgba(255, 60, 60, 0.35);
          }
          50% {
            box-shadow: 0 0 0 14px rgba(255, 60, 60, 0);
            border-color: rgba(255, 60, 60, 0.7);
          }
        }
        .bb-icon {
          position: relative;
          width: 44px;
          height: 44px;
          color: #ff4444;
          filter: drop-shadow(0 0 10px rgba(255, 60, 60, 0.7));
          animation: iconShake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.35s;
          z-index: 1;
        }
        @keyframes iconShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-5px) rotate(-3deg); }
          30% { transform: translateX(4px) rotate(3deg); }
          45% { transform: translateX(-3px) rotate(-2deg); }
          60% { transform: translateX(2px) rotate(2deg); }
          80% { transform: translateX(-1px); }
        }

        /* ─── Заголовок ─── */
        .bb-title {
          text-align: center;
          color: #ff5252;
          font-family: ui-monospace, monospace;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 0 24px;
          line-height: 1.2;
          text-transform: uppercase;
        }
        .bb-glitch {
          position: relative;
          display: inline-block;
        }
        .bb-glitch::before,
        .bb-glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }
        .bb-glitch::before {
          color: #00e5ff;
          animation: glitchBefore 3.5s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }
        .bb-glitch::after {
          color: #ff44aa;
          animation: glitchAfter 3.5s infinite;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        }
        @keyframes glitchBefore {
          0%, 92%, 100% { opacity: 0; transform: translate(0); }
          93% { opacity: 0.9; transform: translate(-2px, -1px); }
          95% { opacity: 0.9; transform: translate(2px, 1px); }
          97% { opacity: 0; }
        }
        @keyframes glitchAfter {
          0%, 92%, 100% { opacity: 0; transform: translate(0); }
          94% { opacity: 0.9; transform: translate(2px, 1px); }
          96% { opacity: 0.9; transform: translate(-2px, -1px); }
          98% { opacity: 0; }
        }

        /* ─── Разделитель ─── */
        .bb-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 40px 22px;
        }
        .bb-div-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #3a1a1a, transparent);
        }
        .bb-div-mark {
          color: #ff4444;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          opacity: 0.6;
        }

        /* ─── Блок причины ─── */
        .bb-reason-block {
          margin: 0 24px 18px;
          padding: 14px 16px;
          background: #080404;
          border: 1px solid #2a1a1a;
          border-left: 3px solid #ff4444;
        }
        .bb-reason-label {
          color: #a06060;
          font-family: ui-monospace, monospace;
          font-size: 9.5px;
          letter-spacing: 2.4px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .bb-reason {
          color: #e8e0e0;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-line;
        }

        /* ─── Срок ─── */
        .bb-until-block {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin: 0 24px 18px;
          padding: 10px 16px;
          background: #080404;
          border: 1px dashed #3a1a1a;
          font-family: ui-monospace, monospace;
        }
        .bb-until-key {
          color: #a06060;
          font-size: 10px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .bb-until-val {
          color: #ff8080;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        /* ─── Обжалование ─── */
        .bb-hint {
          margin: 0 24px 22px;
          padding: 14px 16px;
          background: #050505;
          border: 1px solid #1f1f1f;
        }
        .bb-hint-label {
          color: #666;
          font-family: ui-monospace, monospace;
          font-size: 9.5px;
          letter-spacing: 2.4px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .bb-hint-text {
          color: #999;
          font-size: 12.5px;
          line-height: 1.65;
          margin: 0;
        }
        .bb-hint-text strong {
          color: #ddd;
          font-weight: 700;
        }

        /* ─── Кнопка ─── */
        .bb-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 0 24px;
          width: calc(100% - 48px);
          padding: 14px 20px;
          background: transparent;
          color: #ff5252;
          border: 1px solid #3a1a1a;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          transition: all 0.22s ease;
        }
        .bb-btn:hover {
          background: #ff4444;
          border-color: #ff4444;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 60, 60, 0.4);
        }
        .bb-btn:active {
          transform: translateY(0);
        }
        .bb-btn-arrow {
          font-size: 14px;
          line-height: 1;
          transition: transform 0.2s;
        }
        .bb-btn:hover .bb-btn-arrow {
          transform: translateX(-3px);
        }

        /* ─── Углы ─── */
        .bb-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: #ff4444;
          border-style: solid;
          border-width: 0;
          opacity: 0.7;
          pointer-events: none;
        }
        .bb-corner-tl { top: 6px;  left: 6px;  border-top-width: 1px; border-left-width: 1px; }
        .bb-corner-tr { top: 6px;  right: 6px; border-top-width: 1px; border-right-width: 1px; }
        .bb-corner-bl { bottom: 6px; left: 6px;  border-bottom-width: 1px; border-left-width: 1px; }
        .bb-corner-br { bottom: 6px; right: 6px; border-bottom-width: 1px; border-right-width: 1px; }

        /* ─── Анимация входа ─── */
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ─── Мобильная адаптация ─── */
        @media (max-width: 560px) {
          .ban-box { padding-bottom: 22px; }
          .bb-topstrip { padding: 7px 12px; font-size: 9px; letter-spacing: 1.8px; }
          .bb-icon-wrap { width: 76px; height: 76px; margin: 24px auto 18px; }
          .bb-icon { width: 36px; height: 36px; }
          .bb-title { font-size: 15px; letter-spacing: 2px; margin: 0 18px; }
          .bb-divider { margin: 16px 24px 18px; }
          .bb-reason-block,
          .bb-until-block,
          .bb-hint,
          .bb-btn {
            margin-left: 18px;
            margin-right: 18px;
          }
          .bb-btn { width: calc(100% - 36px); font-size: 10.5px; padding: 13px 16px; }
          .bb-reason { font-size: 13px; }
          .bb-hint-text { font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
