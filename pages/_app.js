import Head from 'next/head';
import { useEffect } from 'react';
import GlobalBackground from '../components/GlobalBackground';

// SERVER-SIDE FAIL-FAST
if (typeof window === 'undefined') {
  const required = [
    ['JWT_SECRET', 'аутентификация полностью сломана (все /api → 401)'],
    ['DISCORD_CLIENT_ID', 'OAuth-логин не работает'],
    ['DISCORD_CLIENT_SECRET', 'OAuth-логин не работает'],
    ['DISCORD_REDIRECT_URI', 'OAuth упадёт на обмене code → token'],
    ['REDIS_URL', 'все данные (профили/заявки/сессии) недоступны'],
  ];
  const missing = required.filter(([k]) => !process.env[k]);
  if (missing.length > 0) {
    console.error('[FIB] ❌ CRITICAL — missing env vars:');
    for (const [key, impact] of missing) {
      console.error(`   • ${key} — ${impact}`);
    }
  }
}

export default function App({ Component, pageProps }) {
  // Client health-check
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    const key = 'fib:healthchecked';
    try { if (sessionStorage.getItem(key)) return; } catch {}
    fetch('/api/me').then((r) => {
      if (r.status >= 500) {
        console.error('[FIB] ❌ /api/me вернул ' + r.status + ' — проверь env');
      }
      try { sessionStorage.setItem(key, '1'); } catch {}
    }).catch(() => {});
  }, []);

  // PWA Service Worker
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
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

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FIB" />
        <link rel="apple-touch-icon" href="/logo.png" />

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

      {/* ... ВЕСЬ <style jsx global> из текущего _app.js без изменений ... */}
      <style jsx global>{`
        /* (оставь как есть — весь CSS идентичен предыдущей версии) */
      `}</style>

      <Component {...pageProps} />
    </>
  );
}
