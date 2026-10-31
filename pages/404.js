import { useRouter } from 'next/router';
import Head from 'next/head';

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <Head><title>404 · FIB Forms</title></Head>
      <div className="nf">
        <div className="nf-scan" />
        <div className="nf-box">
          <div className="nf-top">
            <span className="nf-mark">■</span>
            <span className="nf-label">FILE NOT FOUND</span>
            <span className="nf-spacer" />
            <span className="nf-code">ERR-404</span>
          </div>
          <div className="nf-body">
            <h1 className="nf-err">404<span className="nf-dot">.</span></h1>
            <div className="nf-msg">ЗАПИСЬ ОТСУТСТВУЕТ В АРХИВЕ</div>
            <div className="nf-divider" />
            <p className="nf-hint">
              Запрошенный документ не найден, либо доступ к нему ограничен.
              Проверьте адрес или вернитесь в панель.
            </p>
            <div className="nf-actions">
              <button className="nf-btn nf-btn-solid" onClick={() => router.push('/dashboard')}>
                ← В ПАНЕЛЬ
              </button>
              <button className="nf-btn" onClick={() => router.push('/')}>
                НА ГЛАВНУЮ
              </button>
            </div>
          </div>
          <span className="nf-c nf-c-tl" />
          <span className="nf-c nf-c-tr" />
          <span className="nf-c nf-c-bl" />
          <span className="nf-c nf-c-br" />
        </div>
      </div>
      <style jsx>{`
        .nf {
          position: fixed; inset: 0;
          background: radial-gradient(ellipse at center, #151515 0%, #050505 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #eaeaea;
        }
        .nf-scan {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg,
            rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px,
            transparent 1px, transparent 3px);
          animation: scan 6s linear infinite;
        }
        @keyframes scan { 0% { background-position: 0 0; } 100% { background-position: 0 120px; } }
        .nf-box {
          position: relative;
          max-width: 520px; width: 100%;
          background: #0a0a0a; border: 1px solid #2a2a2a;
          animation: in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03);
        }
        @keyframes in { 0% { transform: scale(0.9) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .nf-top {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 16px; background: #050505; border-bottom: 1px solid #1f1f1f;
          font-family: ui-monospace, monospace; font-size: 10px;
          letter-spacing: 2.4px; text-transform: uppercase; color: #666;
        }
        .nf-mark { color: #fff; font-size: 11px; }
        .nf-label { color: #aaa; font-weight: 700; }
        .nf-spacer { flex: 1; }
        .nf-code { color: #444; font-weight: 700; }
        .nf-body { padding: 42px 36px 36px; text-align: center; }
        .nf-err {
          font-family: ui-monospace, monospace;
          font-size: 84px; font-weight: 900; letter-spacing: 4px;
          margin: 0; color: #fff; line-height: 1;
        }
        .nf-dot { animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0.15; } }
        .nf-msg {
          font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: #888; margin: 14px 0 22px;
        }
        .nf-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #333, transparent);
          margin: 0 20px 22px;
        }
        .nf-hint {
          color: #888; font-size: 13px; line-height: 1.7; margin: 0 0 26px;
        }
        .nf-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .nf-btn {
          padding: 11px 18px;
          background: transparent; border: 1px solid #333;
          color: #ccc; cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .nf-btn:hover { background: #fff; border-color: #fff; color: #000; }
        .nf-btn-solid { background: #fff; color: #000; border-color: #fff; font-weight: 800; }
        .nf-btn-solid:hover { background: #ccc; border-color: #ccc; }
        .nf-c {
          position: absolute; width: 10px; height: 10px;
          border-color: #fff; border-style: solid; border-width: 0;
          opacity: 0.5;
        }
        .nf-c-tl { top: 6px; left: 6px; border-top-width: 1px; border-left-width: 1px; }
        .nf-c-tr { top: 6px; right: 6px; border-top-width: 1px; border-right-width: 1px; }
        .nf-c-bl { bottom: 6px; left: 6px; border-bottom-width: 1px; border-left-width: 1px; }
        .nf-c-br { bottom: 6px; right: 6px; border-bottom-width: 1px; border-right-width: 1px; }
        @media (max-width: 500px) {
          .nf-err { font-size: 60px; }
          .nf-body { padding: 32px 22px 26px; }
        }
      `}</style>
    </>
  );
}
