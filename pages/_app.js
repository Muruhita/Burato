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

        /* Тонкий монохромный скроллбар */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #262626; border: 2px solid #0a0a0a; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }

        input, textarea, button, select {
          font-family: inherit;
          color: inherit;
        }

        a { color: inherit; }

        /* Единый монохромный спиннер */
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
      `}</style>

      <Component {...pageProps} />
    </>
  );
}
