import Head from 'next/head';
import { useEffect } from 'react';
import GlobalBackground from '../components/GlobalBackground';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // PWA Service Worker
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      console.warn('[FIB] SW registration failed:', e.message);
    });
  }, []);

  return (
    <>
      <Head>
        <title>FIB Forms</title>
        <meta name="description" content="Система подачи заявок FIB" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FIB" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Инициализация темы */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('fib-theme') || 'default';
                  document.documentElement.setAttribute('data-theme', t);
                } catch(e) {}
              })();
            `
          }}
        />
      </Head>

      <GlobalBackground />

      {/* ОБЕРТКА ДЛЯ ЗАЩИТЫ ОТ ПАДЕНИЙ (ErrorBoundary) */}
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>

      <style jsx global>{`
        /* ═══ ПЕРЕМЕННЫЕ ТЕМ ═══ */
        :root {
          --text: #eaeaea;
          --text-2: #b0b0b0;
          --text-dim: #888;
          --text-mute: #555;
          --text-fade: #333;
          --border: #1f1f1f;
          --border-2: #2a2a2a;
          --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
          --bg: #0a0a0a;
        }

        [data-theme="white"] {
          --text: #0a0a0a;
          --text-2: #333;
          --text-dim: #555;
          --text-mute: #888;
          --text-fade: #ccc;
          --border: #d0d0d0;
          --border-2: #e0e0e0;
          --bg: #f2f2f2;
        }
        [data-theme="blue"] {
          --text: #e0e7ff;
          --text-2: #93c5fd;
          --text-dim: #3b82f6;
          --text-mute: #1e3a8a;
          --text-fade: #172554;
          --border: #1e3a8a;
          --border-2: #2563eb;
          --bg: #0a0f1c;
        }
        [data-theme="green"] {
          --text: #d1fae5;
          --text-2: #6ee7b7;
          --text-dim: #10b981;
          --text-mute: #065f46;
          --text-fade: #022c22;
          --border: #064e3b;
          --border-2: #047857;
          --bg: #06120e;
        }
        [data-theme="purple"] {
          --text: #f3e8ff;
          --text-2: #d8b4fe;
          --text-dim: #a855f7;
          --text-mute: #4c1d95;
          --text-fade: #2e1065;
          --border: #3b0764;
          --border-2: #6b21a8;
          --bg: #0f0616;
        }

        /* ═══ БАЗОВЫЕ СБРОСЫ ═══ */
        html, body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          background: #050505;
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        *, *:before, *:after { box-sizing: inherit; }
        
        /* Прячем скроллбар в стиле "терминала" */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        /* ═══ ОБЩИЕ СТИЛИ ДЛЯ ФОРМ ═══ */
        .form-page {
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 40px;
        }
        .back-btn {
          background: transparent;
          border: none;
          color: var(--text-dim, #888);
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 11px;
          letter-spacing: 2px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: color 0.2s;
          text-transform: uppercase;
        }
        .back-btn:hover { color: #fff; }

        .form-shell {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          animation: cardIn 0.45s ease;
        }
        .form-head { padding: 24px 24px 0; }
        
        .fh-stamp {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid #333;
          color: #888;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .fh-title {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
          color: #fff;
          line-height: 1.1;
          text-transform: uppercase;
        }
        .fh-sub {
          color: #888;
          font-size: 13.5px;
          margin: 12px 0 0;
          line-height: 1.5;
        }
        .fh-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 20px 0;
        }
        
        .form-body { padding: 24px; }
        
        .field-block { margin-bottom: 20px; }
        
        .lbl {
          display: block;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: 2px;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .lbl::before { content: '▸ '; color: #444; }
        
        .field {
          width: 100%;
          padding: 12px 14px;
          background: #060606;
          border: 1px solid #262626;
          color: #fff;
          border-radius: 0;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .field:focus { border-color: #fff; background: #0a0a0a; }
        .field::placeholder { color: #444; }
        
        textarea.field {
          resize: vertical;
          min-height: 80px;
          line-height: 1.55;
        }
        
        select.field {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #666 50%),
                            linear-gradient(135deg, #666 50%, transparent 50%);
          background-position: calc(100% - 18px) center, calc(100% - 13px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          padding-right: 36px;
          cursor: pointer;
        }
        select.field option { background: #0c0c0c; color: #fff; }
        
        .submit-btn {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          padding: 16px;
          background: #fff;
          color: #000;
          border: 1px solid #fff;
          cursor: pointer;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.2s;
          margin-top: 10px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #ccc;
          border-color: #ccc;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.1);
        }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        .loading-line {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-family: var(--mono, ui-monospace, monospace);
          font-size: 11px;
          letter-spacing: 2.4px;
        }

        /* Скрываем дефолтный белый фон у autofill в Chrome */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #060606 inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </>
  );
}
