import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Leh() {
  const router = useRouter();

  const sections = [
    {
      num: '1',
      title: 'ОБЩИЕ ПОЛОЖЕНИЯ',
      paragraphs: [
        <>Настоящие Условия Пользования регулируют использование Discord-бота <strong>FIB Forms</strong> и связанного с ним сайта. Используя бота или сайт, вы подтверждаете, что ознакомились с условиями и согласны их соблюдать.</>,
        <>Если вы не согласны с любым пунктом — пожалуйста, прекратите использование.</>
      ]
    },
    {
      num: '2',
      title: 'КТО МОЖЕТ ПОЛЬЗОВАТЬСЯ',
      paragraphs: [
        { list: [
          'Игроки игрового сервера Boston Majestic RP',
          'Пользователи с действующим Discord-аккаунтом'
        ]}
      ]
    },
    {
      num: '3',
      title: 'ЧТО МОЖНО ДЕЛАТЬ',
      paragraphs: [
        { list: [
          'Подавать заявки через формы (повышение, отпуск, перевод и т.д.)',
          'Заполнять профиль — ник и отдел',
          'Просматривать справку, правила и общую информацию',
          'Общаться с администрацией через тех. поддержку',
          'Участвовать в мини-игре и других активностях бота'
        ]}
      ]
    },
    {
      num: '4',
      title: 'ЧТО ЗАПРЕЩЕНО',
      paragraphs: [
        <>При использовании бота и сайта <strong>запрещается</strong>:</>,
        { list: [
          'Отправлять спам, дублировать заявки, флудить формами',
          'Использовать нецензурную лексику, оскорбления, угрозы',
          'Пытаться взломать, обойти защиту или автоматизировать отправку',
          'Выдавать себя за другого человека или администратора',
          'Загружать файлы с запрещённым контентом, NSFW',
          'Нарушать правила Discord и правила сервера Majestic RP',
          'Использовать бота для любых целей, не связанных с фракцией'
        ]},
        <>За нарушение — блокировка доступа <strong>на 7 дней</strong> или <strong>навсегда</strong>, без предварительного уведомления.</>
      ]
    },
    {
      num: '5',
      title: 'ОТВЕТСТВЕННОСТЬ ПОЛЬЗОВАТЕЛЯ',
      paragraphs: [
        'Вы несёте ответственность за:',
        { list: [
          'Правильность данных, которые вы указываете в формах',
          'Действия, совершённые с вашего Discord-аккаунта',
          'Содержимое текстов и скриншотов, которые вы загружаете',
          'Соблюдение правил фракции и сервера'
        ]}
      ]
    },
    {
      num: '6',
      title: 'ОТВЕТСТВЕННОСТЬ АДМИНИСТРАЦИИ',
      paragraphs: [
        <>Администрация бота <strong>не несёт ответственности</strong> за:</>,
        { list: [
          'Возможные технические сбои или задержки',
          'Решения, принятые по вашим заявкам',
          'Действия третьих сервисов (Discord, Vercel, imgbb, Redis)',
          'Ущерб, возникший из-за неправильно указанных данных'
        ]},
        <>Бот предоставляется <strong>«как есть»</strong>. Мы стараемся поддерживать его работу стабильной, но не гарантируем 100% доступность.</>
      ]
    },
    {
      num: '7',
      title: 'ОТПРАВКА ЗАЯВОК',
      paragraphs: [
        { list: [
          'Заявки уходят в Discord-каналы сервера фракции',
          'Сроки рассмотрения определяет администрация/вышестоящие фракции и не гарантируется'
        ]}
      ]
    },
    {
      num: '8',
      title: 'БЛОКИРОВКА И СНЯТИЕ',
      paragraphs: [
        <>Администрация вправе заблокировать доступ пользователю за нарушение условий. Срок блокировки — от 7 дней до бессрочной. Снятие возможно через обращение в тех. поддержку или Discord.</>
      ]
    },
    {
      num: '9',
      title: 'ИЗМЕНЕНИЕ УСЛОВИЙ',
      paragraphs: [
        <>Мы можем обновлять эти Условия. Продолжение использования бота после изменений означает согласие с новой редакцией. Актуальная версия всегда доступна на этой странице.</>
      ]
    },
    {
      num: '10',
      title: 'КОНТАКТЫ',
      paragraphs: [
        'По всем вопросам обращайтесь:',
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
          <div className="ph-stamp">DOC · TERMS OF SERVICE · OFFICIAL</div>
          <h1 className="ph-title">УСЛОВИЯ ПОЛЬЗОВАНИЯ<span className="ph-dot">.</span></h1>
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
