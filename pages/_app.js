import Head from 'next/head';
import GlobalBackground from '../components/GlobalBackground';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>FIB Forms</title>
        <meta name="description" content="Система подачи заявок FIB" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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

      <style jsx global>{`
        :root {
          --bg:        #0a0a0a;
          --bg-2:      #0f0f0f;
          --panel:     #0c0c0c;
          --panel-2:   #131313;
          --border:    #1f1f1f;
          --border-2:  #2a2a2a;
          --border-hi: #3a3a3a;
          --text:      #eaeaea;
          --text-2:    #b0b0b0;
          --text-dim:  #888;
          --text-mute: #555;
          --text-fade: #333;
          --white:     #ffffff;
          --black:     #000000;
          --danger:    #ff4444;
          --success:   #4caf50;
          --accent:    #ffffff;
          --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html, body {
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background 0.35s ease, color 0.35s ease;
        }

        ::selection { background: #fff; color: #000; }

        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: #262626; border: 2px solid var(--bg); }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        input, textarea, button, select { font-family: inherit; color: inherit; }
        a { color: inherit; }

        body::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background: repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.012) 0px,
            rgba(255,255,255,0.012) 1px,
            transparent 1px,
            transparent 3px
          );
        }

        /* ═══════════════════════════════════════════════
           ТЕМЫ
           ═══════════════════════════════════════════════ */

        /* ─── БЕЛАЯ ─── */
        [data-theme="white"] {
          --bg:        #f2f2f2;
          --bg-2:      #ffffff;
          --panel:     #ffffff;
          --panel-2:   #f8f8f8;
          --border:    #d8d8d8;
          --border-2:  #c0c0c0;
          --border-hi: #a0a0a0;
          --text:      #0a0a0a;
          --text-2:    #333333;
          --text-dim:  #666666;
          --text-mute: #999999;
          --text-fade: #cccccc;
          --white:     #000000;
          --black:     #ffffff;
          --accent:    #0a0a0a;
        }

        [data-theme="white"] body::after {
          background: repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.02) 0px,
            rgba(0,0,0,0.02) 1px,
            transparent 1px,
            transparent 3px
          );
        }

        /* Глобальные подмены для белой темы — точечно там, где хардкод */
        [data-theme="white"] .navbar,
        [data-theme="white"] .footer,
        [data-theme="white"] .topbar {
          background: rgba(255, 255, 255, 0.92) !important;
          border-color: #d8d8d8 !important;
          color: #0a0a0a !important;
        }
        [data-theme="white"] .topbar { background: #e8e8e8 !important; }

        [data-theme="white"] .panel,
        [data-theme="white"] .form-shell,
        [data-theme="white"] .folder,
        [data-theme="white"] .member,
        [data-theme="white"] .admin-card,
        [data-theme="white"] .auth-card,
        [data-theme="white"] .conditions,
        [data-theme="white"] .filters {
          background: #ffffff !important;
          border-color: #d8d8d8 !important;
          color: #0a0a0a !important;
        }

        [data-theme="white"] .panel-head,
        [data-theme="white"] .folder-tab,
        [data-theme="white"] .folder-foot,
        [data-theme="white"] .cond-head,
        [data-theme="white"] .top-strip {
          background: #f5f5f5 !important;
          border-color: #d8d8d8 !important;
        }

        [data-theme="white"] .field,
        [data-theme="white"] .search-input,
        [data-theme="white"] .filter-select,
        [data-theme="white"] input:not([type="checkbox"]),
        [data-theme="white"] textarea,
        [data-theme="white"] select {
          background: #f8f8f8 !important;
          border-color: #cccccc !important;
          color: #0a0a0a !important;
        }

        [data-theme="white"] .field:focus,
        [data-theme="white"] .search-input:focus {
          border-color: #0a0a0a !important;
          background: #ffffff !important;
        }

        [data-theme="white"] .folder:hover,
        [data-theme="white"] .folder:focus-visible,
        [data-theme="white"] .btn:hover,
        [data-theme="white"] .cat.active,
        [data-theme="white"] .submit-btn,
        [data-theme="white"] .btn-solid,
        [data-theme="white"] .nav-tab.active,
        [data-theme="white"] .p-tag-on {
          background: #0a0a0a !important;
          color: #ffffff !important;
          border-color: #0a0a0a !important;
        }

        [data-theme="white"] .folder:hover .folder-title,
        [data-theme="white"] .folder:hover .folder-desc,
        [data-theme="white"] .folder:hover .folder-icon,
        [data-theme="white"] .folder:hover .folder-code,
        [data-theme="white"] .folder:hover .folder-tag,
        [data-theme="white"] .folder:hover .folder-open,
        [data-theme="white"] .folder:hover .folder-arrow,
        [data-theme="white"] .folder:hover .corner {
          color: #ffffff !important;
          border-color: #ffffff !important;
        }

        [data-theme="white"] .p-num,
        [data-theme="white"] .ph-sub,
        [data-theme="white"] .lbl,
        [data-theme="white"] .folder-desc,
        [data-theme="white"] .member-user,
        [data-theme="white"] .f-link,
        [data-theme="white"] .side-btn,
        [data-theme="white"] .muted {
          color: #666666 !important;
        }

        [data-theme="white"] .folder-title,
        [data-theme="white"] .ph-title,
        [data-theme="white"] .p-title,
        [data-theme="white"] .member-nick,
        [data-theme="white"] .author-label {
          color: #0a0a0a !important;
        }

        [data-theme="white"] .folder-icon {
          background: #0a0a0a !important;
          color: #ffffff !important;
          border-color: #0a0a0a !important;
        }

        [data-theme="white"] .side-btn:hover,
        [data-theme="white"] .btn:hover,
        [data-theme="white"] .nav-exit:hover {
          background: #0a0a0a !important;
          color: #ffffff !important;
          border-color: #0a0a0a !important;
        }

        [data-theme="white"] .announce {
          background: repeating-linear-gradient(
            -45deg,
            #f0f0f0 0px, #f0f0f0 12px,
            #e0e0e0 12px, #e0e0e0 24px
          ) !important;
          border-color: #bbbbbb !important;
          color: #0a0a0a !important;
        }
        [data-theme="white"] .announce-tag {
          background: #0a0a0a !important;
          color: #ffffff !important;
        }
        [data-theme="white"] .announce-text { color: #0a0a0a !important; }

        [data-theme="white"] .loading-line,
        [data-theme="white"] .boot-text { color: #666 !important; }

        [data-theme="white"] .author {
          color: #0a0a0a !important;
        }

        [data-theme="white"] .global-bg-canvas {
          filter: invert(1) !important;
          opacity: 0.35 !important;
        }

        /* ─── ЦВЕТНЫЕ ТЕМЫ ─── */
        [data-theme="blue"] {
          --accent: #3b82f6;
        }
        [data-theme="blue"] body::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 15% 10%, rgba(59, 130, 246, 0.16), transparent 55%),
            radial-gradient(ellipse at 85% 90%, rgba(59, 130, 246, 0.10), transparent 55%);
        }

        [data-theme="green"] {
          --accent: #10b981;
        }
        [data-theme="green"] body::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 15% 10%, rgba(16, 185, 129, 0.16), transparent 55%),
            radial-gradient(ellipse at 85% 90%, rgba(16, 185, 129, 0.10), transparent 55%);
        }

        [data-theme="purple"] {
          --accent: #a855f7;
        }
        [data-theme="purple"] body::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 15% 10%, rgba(168, 85, 247, 0.16), transparent 55%),
            radial-gradient(ellipse at 85% 90%, rgba(168, 85, 247, 0.10), transparent 55%);
        }

        /* Для цветных тем — акцентная полоса сверху */
        [data-theme="blue"] .navbar,
        [data-theme="green"] .navbar,
        [data-theme="purple"] .navbar {
          border-bottom-color: var(--accent) !important;
          box-shadow: 0 0 30px -20px var(--accent);
        }

        [data-theme="blue"] .topbar,
        [data-theme="green"] .topbar,
        [data-theme="purple"] .topbar {
          border-bottom-color: var(--accent) !important;
          box-shadow: inset 0 -1px 0 var(--accent);
        }

        [data-theme="blue"] .nav-tab.active,
        [data-theme="green"] .nav-tab.active,
        [data-theme="purple"] .nav-tab.active {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #ffffff !important;
        }

        [data-theme="blue"] .cat.active,
        [data-theme="green"] .cat.active,
        [data-theme="purple"] .cat.active {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #ffffff !important;
        }

        [data-theme="blue"] .p-tag-on,
        [data-theme="green"] .p-tag-on,
        [data-theme="purple"] .p-tag-on {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #ffffff !important;
        }

        [data-theme="blue"] .submit-btn,
        [data-theme="green"] .submit-btn,
        [data-theme="purple"] .submit-btn,
        [data-theme="blue"] .btn-solid,
        [data-theme="green"] .btn-solid,
        [data-theme="purple"] .btn-solid {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #ffffff !important;
        }

        [data-theme="blue"] .folder:hover,
        [data-theme="green"] .folder:hover,
        [data-theme="purple"] .folder:hover {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
        }

        [data-theme="blue"] .side-btn:hover,
        [data-theme="green"] .side-btn:hover,
        [data-theme="purple"] .side-btn:hover {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #ffffff !important;
        }

        /* ─── УТИЛИТЫ ─── */
        .spinner {
          display: inline-block;
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        .success-check {
          display: inline-block;
          animation: pop 0.3s ease;
          font-size: 20px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pop {
          0%   { transform: scale(0);   opacity: 0; }
          80%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }

        /* ═══ FIB FORM SHELL ═══ */
        .form-page { max-width: 720px; margin: 0 auto; padding-bottom: 30px; }

        .back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px; background: transparent;
          border: 1px solid var(--border-2); color: var(--text-dim);
          cursor: pointer; font-family: var(--mono);
          font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase;
          margin-bottom: 20px; transition: all 0.2s;
        }
        .back-btn:hover { background: #fff; border-color: #fff; color: #000; }

        .form-shell {
          background: var(--panel); border: 1px solid var(--border);
          animation: formIn 0.45s ease; position: relative;
        }
        .form-shell::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: repeating-linear-gradient(
            90deg, #fff 0px, #fff 20px, var(--panel) 20px, var(--panel) 40px
          );
          opacity: 0.9;
        }

        .form-head { padding: 26px 30px 20px; border-bottom: 1px solid var(--border); }
        .fh-stamp {
          display: inline-block; padding: 3px 10px;
          border: 1px solid #333; color: #888;
          font-family: var(--mono); font-size: 10px;
          letter-spacing: 3px; text-transform: uppercase;
          margin-bottom: 14px; background: rgba(255,255,255,0.02);
        }
        .fh-title {
          font-size: 28px; font-weight: 900; letter-spacing: 2px;
          margin: 0; color: #fff; line-height: 1.1; text-transform: uppercase;
        }
        .fh-sub { color: #888; font-size: 13px; margin: 10px 0 0; line-height: 1.55; }
        .fh-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 0;
        }

        .form-body { padding: 24px 30px 28px; }
        .field-block { margin-bottom: 20px; }
        .field-block:last-of-type { margin-bottom: 24px; }

        .lbl {
          display: block; font-family: var(--mono); font-size: 10px;
          letter-spacing: 2px; color: #666; text-transform: uppercase;
          margin-bottom: 7px;
        }
        .lbl::before { content: '▸ '; color: #333; }

        .field {
          width: 100%; padding: 12px 14px;
          background: #060606; border: 1px solid #262626;
          color: #fff; border-radius: 0; font-size: 14px;
          font-family: inherit; box-sizing: border-box;
          outline: none; transition: border-color 0.2s, background 0.2s;
        }
        .field:focus { border-color: #fff; background: #0a0a0a; }
        .field::placeholder { color: #444; }
        textarea.field { resize: vertical; min-height: 80px; line-height: 1.55; }
        select.field {
          appearance: none;
          background-image:
            linear-gradient(45deg, transparent 50%, #666 50%),
            linear-gradient(135deg, #666 50%, transparent 50%);
          background-position: calc(100% - 18px) center, calc(100% - 13px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          padding-right: 36px; cursor: pointer;
        }
        select.field option { background: #0c0c0c; color: #fff; }

        .submit-btn {
          width: 100%; padding: 15px 20px;
          background: #fff; color: #000;
          border: 1px solid #fff; border-radius: 0;
          cursor: pointer; font-family: var(--mono);
          font-size: 12px; font-weight: 800;
          letter-spacing: 2.4px; text-transform: uppercase;
          transition: all 0.2s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #ccc; border-color: #ccc;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255,255,255,0.12);
        }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.2); border-top-color: #000;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .loading-line {
          text-align: center; padding: 60px 20px;
          color: #666; font-family: var(--mono);
          font-size: 11px; letter-spacing: 2.4px;
        }

        @keyframes formIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .form-head { padding: 20px 20px 16px; }
          .fh-title { font-size: 20px; letter-spacing: 1.5px; }
          .fh-sub { font-size: 12px; }
          .form-body { padding: 20px; }
        }
      `}</style>

      <Component {...pageProps} />
    </>
  );
}
