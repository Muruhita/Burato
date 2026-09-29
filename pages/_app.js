import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>FIB Forms</title>
        <meta name="description" content="Система подачи заявок FIB" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
          --mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html, body {
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        ::selection { background: #fff; color: #000; }

        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border: 2px solid #0a0a0a; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        input, textarea, button, select { font-family: inherit; color: inherit; }
        a { color: inherit; }

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

        /* ═══════════════════════════════════════════════
           FIB FORM SHELL — общий каркас для всех форм
           ═══════════════════════════════════════════════ */
        .form-page {
          max-width: 720px;
          margin: 0 auto;
          padding-bottom: 30px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: transparent;
          border: 1px solid var(--border-2);
          color: var(--text-dim);
          cursor: pointer;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          margin-bottom: 20px;
          transition: all 0.2s;
        }
        .back-btn:hover {
          background: #fff;
          border-color: #fff;
          color: #000;
        }

        .form-shell {
          background: #0c0c0c;
          border: 1px solid var(--border);
          animation: formIn 0.45s ease;
          position: relative;
        }
        .form-shell::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: repeating-linear-gradient(
            90deg,
            #fff 0px, #fff 20px,
            #0c0c0c 20px, #0c0c0c 40px
          );
          opacity: 0.9;
        }

        .form-head {
          padding: 26px 30px 20px;
          border-bottom: 1px solid var(--border);
        }
        .fh-stamp {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid #333;
          color: #888;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
          background: rgba(255,255,255,0.02);
        }
        .fh-title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
          color: #fff;
          line-height: 1.1;
          text-transform: uppercase;
        }
        .fh-sub {
          color: #888;
          font-size: 13px;
          margin: 10px 0 0;
          line-height: 1.55;
        }
        .fh-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 0;
        }

        .form-body {
          padding: 24px 30px 28px;
        }

        .field-block {
          margin-bottom: 20px;
        }
        .field-block:last-of-type {
          margin-bottom: 24px;
        }

        .lbl {
          display: block;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .lbl::before {
          content: '▸ ';
          color: #333;
        }

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
          transition: border-color 0.2s, background 0.2s;
        }
        .field:focus {
          border-color: #fff;
          background: #0a0a0a;
        }
        .field::placeholder {
          color: #444;
        }
        textarea.field {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
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
        select.field option {
          background: #0c0c0c;
          color: #fff;
        }

        .submit-btn {
          width: 100%;
          padding: 15px 20px;
          background: #fff;
          color: #000;
          border: 1px solid #fff;
          border-radius: 0;
          cursor: pointer;
          font-family: var(--mono);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #ccc;
          border-color: #ccc;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255,255,255,0.12);
        }
        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
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
