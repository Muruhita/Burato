import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Support() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => {
    fetch('/api/support/tickets')
      .then(r => r.json())
      .then(d => { setTickets(d.tickets || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openTicket = (id) => {
    setOpenId(id);
    fetch(`/api/support/tickets?id=${id}`)
      .then(r => r.json())
      .then(d => { if (d.ticket) setTicket(d.ticket); });
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setCreating(true);
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: newSubject.trim() || '(без темы)', message: newMessage.trim() })
    });
    const d = await res.json();
    setCreating(false);
    if (d.ticket) {
      setNewSubject('');
      setNewMessage('');
      load();
      openTicket(d.ticket.id);
    } else {
      alert('❌ ' + (d.error || 'Ошибка'));
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !openId) return;
    const res = await fetch('/api/support/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: openId, action: 'reply', text: replyText.trim() })
    });
    const d = await res.json();
    if (d.ticket) { setTicket(d.ticket); setReplyText(''); load(); }
  };

  const closeTicket = async () => {
    if (!openId || !confirm('Закрыть тикет?')) return;
    await fetch('/api/support/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: openId, action: 'close' })
    });
    setOpenId(null);
    setTicket(null);
    load();
  };

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">SUPPORT · TICKETS</div>
          <h1 className="ph-title">ПОДДЕРЖКА<span className="ph-dot">.</span></h1>
          <p className="ph-sub">Обращения к администрации · {tickets.length} тикетов</p>
          <div className="ph-rule" />
        </header>

        {/* Создание */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">НОВЫЙ ТИКЕТ</h2>
            <span className="p-tag">NEW</span>
          </div>
          <form onSubmit={createTicket} className="panel-body">
            <label className="lbl">ТЕМА (опционально)</label>
            <input
              className="field" type="text" value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Например: Проблема с формой hiring"
            />
            <label className="lbl">СООБЩЕНИЕ</label>
            <textarea
              className="field" rows="4" value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
              placeholder="Опишите проблему подробно..."
            />
            <button className="btn btn-solid" type="submit" disabled={creating}>
              {creating ? '⏳ СОЗДАНИЕ...' : '+ СОЗДАТЬ ТИКЕТ'}
            </button>
          </form>
        </section>

        {/* Список */}
        <section className="panel">
          <div className="panel-head">
            <span className="p-num">02</span>
            <h2 className="p-title">МОИ ТИКЕТЫ</h2>
            <span className="p-tag">{tickets.length}</span>
          </div>
          <div className="panel-body no-pad">
            {loading ? (
              <p className="muted center">ЗАГРУЗКА...</p>
            ) : tickets.length === 0 ? (
              <p className="muted center">У ВАС НЕТ ТИКЕТОВ</p>
            ) : (
              tickets.map(t => (
                <div key={t.id} className={`ticket-row ${openId === t.id ? 'active' : ''}`} onClick={() => openTicket(t.id)}>
                  <span className={`t-status t-${t.status}`}>
                    {t.status === 'open' ? '●' : t.status === 'answered' ? '◐' : '✓'}
                  </span>
                  <div className="t-main">
                    <div className="t-subject">{t.subject}</div>
                    <div className="t-meta">{t.messages.length} сообщений · {new Date(t.updatedAt).toLocaleString('ru-RU')}</div>
                  </div>
                  <span className="t-arrow">{openId === t.id ? '▼' : '→'}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Открытый тикет */}
        {ticket && (
          <section className="panel">
            <div className="panel-head">
              <span className="p-num">03</span>
              <h2 className="p-title">{ticket.subject}</h2>
              <span className={`p-tag p-tag-${ticket.status}`}>{ticket.status.toUpperCase()}</span>
            </div>
            <div className="panel-body chat">
              {ticket.messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.from}`}>
                  <div className="msg-head">
                    <strong>{m.username}</strong>
                    <span className="msg-at">{new Date(m.at).toLocaleString('ru-RU')}</span>
                  </div>
                  <div className="msg-text">{m.text}</div>
                </div>
              ))}
            </div>
            {ticket.status !== 'closed' && (
              <div className="panel-body reply-box">
                <textarea
                  className="field" rows="3" value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ваш ответ..."
                />
                <div className="reply-actions">
                  <button className="btn btn-solid" onClick={sendReply} disabled={!replyText.trim()}>→ ОТПРАВИТЬ</button>
                  <button className="btn btn-danger" onClick={closeTicket}>✕ ЗАКРЫТЬ ТИКЕТ</button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <style jsx>{`
        .info { max-width: 860px; margin: 0 auto; }
        .page-head { margin-bottom: 22px; }
        .ph-stamp {
          display: inline-block; padding: 3px 10px; border: 1px solid #333;
          color: #888; font-family: ui-monospace, monospace; font-size: 10px;
          letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px;
        }
        .ph-title {
          font-size: 42px; font-weight: 900; letter-spacing: 3px; margin: 0;
          color: #fff; line-height: 1; text-transform: uppercase;
        }
        .ph-dot { animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0.15; } }
        .ph-sub { color: #888; font-size: 13px; margin: 12px 0 0; }
        .ph-rule { height: 1px; background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%); margin: 18px 0 0; }

        .panel { background: #0c0c0c; border: 1px solid #1f1f1f; margin-bottom: 12px; }
        .panel-head {
          display: flex; align-items: center; gap: 12px; padding: 11px 18px;
          border-bottom: 1px solid #1f1f1f; background: #0a0a0a;
        }
        .p-num { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2px; color: #666; font-weight: 700; }
        .p-title { font-size: 12px; font-weight: 800; letter-spacing: 2.4px; color: #fff; margin: 0; text-transform: uppercase; flex: 1; }
        .p-tag { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 2px; color: #666; border: 1px solid #2a2a2a; padding: 2px 8px; }
        .p-tag-open { color: #88ddff; border-color: #2a5a7a; }
        .p-tag-answered { color: #8ee08e; border-color: #2a5a2a; }
        .p-tag-closed { color: #888; border-color: #2a2a2a; }
        .panel-body { padding: 18px; }
        .panel-body.no-pad { padding: 0; }
        .muted { color: #666; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 2.4px; text-transform: uppercase; }
        .muted.center { padding: 40px 20px; text-align: center; margin: 0; }

        .lbl { display: block; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 2px; color: #666; text-transform: uppercase; margin: 0 0 7px; }
        .lbl:not(:first-child) { margin-top: 14px; }
        .field {
          width: 100%; padding: 11px 14px; background: #060606; border: 1px solid #262626;
          color: #fff; font-size: 13.5px; outline: none; box-sizing: border-box;
          font-family: inherit; margin-bottom: 12px; resize: vertical;
        }
        .field:focus { border-color: #fff; }
        .btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px;
          background: transparent; border: 1px solid #333; color: #ccc;
          cursor: pointer; font-family: ui-monospace, monospace;
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.2s;
        }
        .btn:hover:not(:disabled) { background: #fff; border-color: #fff; color: #000; }
        .btn:disabled { opacity: 0.5; cursor: wait; }
        .btn-solid { background: #fff; color: #000; border-color: #fff; font-weight: 800; }
        .btn-danger { border-color: #553030; color: #ff8080; }
        .btn-danger:hover { background: #ff4444; border-color: #ff4444; color: #fff; }

        .ticket-row {
          display: flex; align-items: center; gap: 14px; padding: 14px 20px;
          border-bottom: 1px solid #1a1a1a; cursor: pointer; transition: background 0.15s;
        }
        .ticket-row:last-child { border-bottom: none; }
        .ticket-row:hover, .ticket-row.active { background: #131313; }
        .t-status { font-size: 14px; flex-shrink: 0; width: 16px; text-align: center; }
        .t-open { color: #88ddff; }
        .t-answered { color: #8ee08e; }
        .t-closed { color: #555; }
        .t-main { flex: 1; min-width: 0; }
        .t-subject { color: #fff; font-weight: 700; font-size: 14px; margin-bottom: 3px; }
        .t-meta { color: #666; font-family: ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.5px; }
        .t-arrow { color: #fff; font-size: 12px; }

        .chat { max-height: 400px; overflow-y: auto; }
        .msg { margin-bottom: 12px; padding: 10px 14px; border-left: 3px solid #333; background: #080808; }
        .msg-admin { border-left-color: #fff; background: #0f0f0f; }
        .msg-user { border-left-color: #666; }
        .msg-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 6px; }
        .msg-head strong { color: #fff; font-size: 12px; }
        .msg-admin .msg-head strong { color: #fff; }
        .msg-at { font-family: ui-monospace, monospace; font-size: 10px; color: #666; }
        .msg-text { color: #ccc; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; }

        .reply-box { border-top: 1px solid #1f1f1f; }
        .reply-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        @media (max-width: 640px) {
          .ph-title { font-size: 28px; letter-spacing: 2px; }
          .panel-body { padding: 14px; }
        }
      `}</style>
    </Layout>
  );
}
