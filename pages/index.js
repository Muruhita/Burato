import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CloudBackground from '../components/CloudBackground';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1543995099292106772';
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || 'https://fib-bt-check-sus.vercel.app/api/auth';;

const TOS_URL = 'https://docs.google.com/document/d/1GOFZ0kCdL2WNg85YRgi07BRHd-uQuOQKeqX4m0Ru7Zs/edit?usp=sharing';
const PRIVACY_URL = 'https://docs.google.com/document/d/1kG7hH5jsf1ItOQwsnvGMs_drvssIeJ_vbZQ9_hG7PuE/edit?usp=sharing';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push('/dashboard');
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDiscordLogin = async () => {
    const res = await fetch('/api/start-auth');
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Ошибка при создании ссылки авторизации');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a', color: 'white', fontSize: '18px' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div className="auth-page">
      <CloudBackground />

      <div className={`auth-content ${visible ? 'show' : ''}`}>
        <div className="logo-container">
          <img src="/logo.png" alt="FIB Logo" className="logo" />
        </div>
        <h1 className="title">FIB Forms</h1>
        <p className="subtitle">Система подачи заявок FIB</p>

        <button className="discord-btn" onClick={handleDiscordLogin}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '10px' }}>
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.33-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.31.61.67 1.19 1.07 1.74.02.02.06.03.07.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" fill="white"/>
          </svg>
          Войти через Discord
        </button>

        <button className="info-btn" onClick={() => setShowInfo(!showInfo)}>
          Что получает бот?
        </button>

        {showInfo && (
          <div className="info-box">
            <p>Бот Discord при авторизации получает только:</p>
            <ul>
              <li>ID аккаунта</li>
              <li>@username (ваш юзер)</li>
              <li>Аватар</li>
              <li>Баннер</li>
            </ul>
            <p>Больше никакие данные не запрашиваются и не передаются.</p>
          </div>
        )}

        {/* 👤 Кликабельный автор — серый */}
        <button
          className="author-btn"
          onClick={() => router.push('/author')}
          title="Об авторе"
        >
          <span className="author-dot" />
          <span>Автор: @muruh1ta</span>
        </button>

        {/* 📜 Мелкие текстовые ссылки внизу */}
        <div className="legal-links">
          <a href={TOS_URL} target="_blank" rel="noopener noreferrer" className="legal-link">
            ToS
          </a>
          <span className="legal-sep">·</span>
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="legal-link">
            Privacy
          </a>
        </div>
      </div>

      <style jsx>{`
        .auth-page { position: relative; min-height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #0a0a0a; }
        .auth-content { position: relative; z-index: 10; text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .auth-content.show { opacity: 1; transform: translateY(0); }
        .logo-container { margin-bottom: 20px; }
        .logo { width: 80px; height: 80px; border-radius: 50%; box-shadow: 0 0 30px rgba(88, 101, 242, 0.6); }
        .title { font-size: 36px; font-weight: 800; color: white; margin-bottom: 8px; text-shadow: 0 4px 30px rgba(88, 101, 242, 0.5); animation: titleGlow 2s ease-in-out infinite alternate; }
        @keyframes titleGlow { from { text-shadow: 0 4px 30px rgba(88, 101, 242, 0.5); } to { text-shadow: 0 4px 30px rgba(255, 105, 180, 0.7); } }
        .subtitle { font-size: 18px; color: #aaa; margin-bottom: 30px; }
        .discord-btn { display: inline-flex; align-items: center; justify-content: center; background: #5865F2; color: white; padding: 15px 30px; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(88, 101, 242, 0.4); }
        .discord-btn:hover { background: #4752C4; transform: translateY(-3px); box-shadow: 0 8px 30px rgba(88, 101, 242, 0.6); }

        .info-btn { display: block; margin: 20px auto 0; background: transparent; border: 1px solid rgba(255, 255, 255, 0.2); color: #aaa; padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .info-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: white; color: white; }
        .info-box { margin-top: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 10px 15px; text-align: left; color: #aaa; font-size: 13px; }
        .info-box ul { margin: 5px 0 5px 20px; padding: 0; }
        .info-box li { margin-bottom: 2px; }

        /* 👤 Кнопка автора — серая */
        .author-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          padding: 6px 14px 6px 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          color: #aaa;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: inherit;
        }
        .author-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          color: #fff;
          transform: translateY(-1px);
        }
        .author-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #888;
          flex-shrink: 0;
          transition: background 0.25s;
        }
        .author-btn:hover .author-dot {
          background: #ccc;
        }

        /* 📜 Мелкие текстовые ссылки внизу */
        .legal-links {
          margin-top: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          opacity: 0.6;
          transition: opacity 0.25s;
        }
        .legal-links:hover {
          opacity: 1;
        }
        .legal-link {
          color: #888;
          text-decoration: none;
          letter-spacing: 0.3px;
          transition: color 0.2s;
          border-bottom: 1px dotted transparent;
        }
        .legal-link:hover {
          color: #ccc;
          border-bottom-color: #666;
        }
        .legal-sep {
          color: #444;
          user-select: none;
        }

        @media (max-width: 500px) {
          .auth-content { padding: 28px 22px; }
          .title { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}
