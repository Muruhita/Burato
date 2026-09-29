import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Geh() {
  const router = useRouter();

  const sections = [
    {
      num: '1',
      title: 'ОБЩЕЕ',
      paragraphs: [
        <>Настоящая Политика Конфиденциальности описывает, какие данные собирает Discord-бот <strong>FIB Forms</strong> и связанный с ним сайт, как они используются, хранятся и защищаются.</>,
        <>Пользуясь ботом и сайтом, вы соглашаетесь с условиями данной Политики.</>
      ]
    },
    {
      num: '2',
      title: 'КАКИЕ ДАННЫЕ МЫ СОБИРАЕМ',
      paragraphs: [
        <>При авторизации через Discord мы получаем и храним только:</>,
        { list: [
          <><strong>Discord ID</strong> — уникальный идентификатор аккаунта</>,
          <><strong>Username</strong> (@имя) и <strong>аватар</strong></>,
          <><strong>Игровой ник и отдел</strong>, которые вы указываете сами в профиле</>,
          <><strong>Текст заявок</strong>, которые вы отправляете через формы</>,
          <><strong>Загруженные скриншоты</strong> (через сервис imgbb)</>,
          <><strong>Технический лог</strong> — время и тип запросов (для защиты от спама)</>
        ]},
        <>Мы <strong>не собираем</strong>: пароли, email, номер телефона, IP-адрес в открытом виде, содержимое других ваших сообщений в Discord, доступ к личным чатам.</>
      ]
    },
    {
      num: '3',
      title: 'КАК ИСПОЛЬЗУЮТСЯ ДАННЫЕ',
      paragraphs: [
        { list: [
          'Для идентификации вас на сайте и в боте',
          'Для обработки ваших заявок и отправки их администрации в Discord',
          'Для защиты от спама, ботов и нарушений',
          'Для отображения вашего профиля в общих списках участников'
        ]},
        <>Мы <strong>никогда не продаём</strong> и не передаём ваши данные третьим лицам в коммерческих целях.</>
      ]
    },
    {
      num: '4',
      title: 'ГДЕ ХРАНЯТСЯ ДАННЫЕ',
      paragraphs: [
        { list: [
          <><strong>Redis (Upstash)</strong> — база данных с профилями, заявками и статистикой</>,
          <><strong>Vercel</strong> — хостинг сайта и API</>,
          <><strong>imgbb</strong> — хостинг загруженных скриншотов</>,
          <><strong>Discord</strong> — каналы, куда отправляются ваши заявки</>
        ]},
        <>Все данные передаются по защищённому протоколу <strong>HTTPS</strong> и хранятся в зашифрованном виде.</>
      ]
    },
    {
      num: '5',
      title: 'СРОК ХРАНЕНИЯ',
      paragraphs: [
        { list: [
          'Профиль — пока вы пользуетесь ботом',
          'Заявки — бессрочно, для истории решений',
          'Логи о спаме — до 7 дней',
          'Баны — на срок, указанный при блокировке (обычно 7 дней или навсегда)'
        ]}
      ]
    },
    {
      num: '6',
      title: 'ВАШИ ПРАВА',
      paragraphs: [
        'Вы вправе:',
        { list: [
          'Запросить копию своих данных',
          'Потребовать удаления профиля и всех связанных данных',
          'Исправить неточную информацию через профиль',
          'Отозвать согласие — просто перестать пользоваться ботом'
        ]},
        <>Для любого запроса — напишите на почту: <a href="mailto:murkilanki@gmail.com">murkilanki@gmail.com</a></>
      ]
    },
    {
      num: '7',
      title: 'БЕЗОПАСНОСТЬ',
      paragraphs: [
        <>Мы делаем всё возможное для защиты ваших данных: используем токены, ограничиваем доступ администраторов, шифруем трафик. Однако никакая система не даёт 100% гарантии, поэтому используйте бота осознанно.</>
      ]
    },
    {
      num: '8',
      title: 'ИЗМЕНЕНИЯ В ПОЛИТИКЕ',
      paragraphs: [
        <>Мы можем обновлять эту Политику. Актуальная версия всегда доступна на этой странице. Продолжая пользоваться ботом после обновления, вы соглашаетесь с новыми условиями.</>
      ]
    },
    {
      num: '9',
      title: 'КОНТАКТЫ',
      paragraphs: [
        'По всем вопросам, связанным с обработкой персональных данных:',
        { list: [
          <><strong>Разработчик:</strong> Mura Kiratu</>,
          <><strong>Discord:</strong> @muruh1ta</>,
          <><strong>Email:</strong> <a href="mailto:murkilanki@gmail.com">murkilanki@gmail.com</a></>
        ]}
      ]
    }
  ];

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">DOC · PRIVACY · OFFICIAL</div>
          <h1 className="ph-title">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Последнее обновление: 22:22 18/09/2026</p>
          <div className="ph-rule" />
        </header>

        {sections.map((s) => (
          <section key={s.num} className="panel">
            <div className="panel-head">
              <span className="p-num">§ {s.num}</span>
              <h2 className="p-title">{s.title}</h2>
            </div>
            <div className="panel-body doc-body">
              {s.paragraphs.map((p, i) => {
                if (typeof p === 'object' && p.list) {
                  return (
                    <ul key={i} className="doc-list">
                      {p.list.map((item, j) => (
                        <li key={j} className="doc-li">
                          <span className="doc-bullet">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i} className="doc-p">{p}</p>;
              })}
            </div>
          </section>
        ))}

        <div className="back-wrap">
          <button className="btn" onClick={() => router.push('/dashboard')}>← ВЕРНУТЬСЯ</button>
        </div>
      </div>

      <style jsx>{`
        .info { max-width: 860px; margin: 0 auto; }

        .page-head { margin-bottom: 26px; animation: fadeIn 0.45s ease; }
        .ph-stamp {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid #333;
          color: #888;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .ph-title {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 2.5px;
          margin: 0;
          color: #fff;
          line-height: 1.1;
          text-transform: uppercase;
        }
        .ph-dot { color: #fff; animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .ph-sub { color: #888; font-size: 13px; margin: 12px 0 0; font-family: ui-monospace, monospace; letter-spacing: 0.5px; }
        .ph-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 0;
        }

        .panel {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          margin-bottom: 12px;
          animation: cardIn 0.4s ease both;
        }
        .panel-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 18px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
        }
        .p-num {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: #666;
          font-weight: 700;
          flex-shrink: 0;
        }
        .p-title {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.2px;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
        }

        .panel-body.doc-body { padding: 20px 24px; }

        .doc-p {
          color: #d0d0d0;
          font-size: 14.5px;
          line-height: 1.75;
          margin: 0 0 12px;
        }
        .doc-p:last-child { margin-bottom: 0; }

        .doc-list {
          list-style: none;
          padding: 0;
          margin: 0 0 12px;
        }
        .doc-list:last-child { margin-bottom: 0; }

        .doc-li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #d0d0d0;
          font-size: 14.5px;
          line-height: 1.7;
          padding: 3px 0;
        }
        .doc-bullet {
          color: #fff;
          font-family: ui-monospace, monospace;
          font-size: 12px;
          line-height: 1.7;
          flex-shrink: 0;
        }

        .doc-p a,
        .doc-li a {
          color: #fff;
          text-decoration: none;
          border-bottom: 1px dashed #555;
          transition: all 0.18s;
        }
        .doc-p a:hover,
        .doc-li a:hover {
          border-bottom-style: solid;
          border-bottom-color: #fff;
        }

        strong { color: #fff; font-weight: 700; }

        .back-wrap { margin-top: 22px; }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          background: transparent;
          border: 1px solid #333;
          color: #eaeaea;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .btn:hover { background: #fff; border-color: #fff; color: #000; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 640px) {
          .ph-title { font-size: 22px; letter-spacing: 1.6px; }
          .panel-body.doc-body { padding: 16px; }
          .doc-p, .doc-li { font-size: 13.5px; }
        }
      `}</style>
    </Layout>
  );
}
