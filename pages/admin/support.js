import Layout from '../../components/Layout';
import { useState, useEffect } from 'react';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = () => {
    fetch('/api/support/tickets')
      .then(r => r.json())
      .then(d => { setTickets(d.tickets || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openTicket = (id) => {
    setOpenId(id);
    fetch(`/api/support/tickets?id=${id}`)
      .then(r => r.json())
      .then(d => { if (d.ticket) setTicket(d.ticket); });
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
    setOpenId(null); setTicket(null); load();
  };

  const visible = tickets.filter(t => filter === 'all' || t.status === filter);

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">ADMIN · TICKETS</div>
          <h1 className="ph-title">ТИКЕТЫ<span className="ph-dot">.</span></h1>
          <div className="ph-rule" />
        </header>

        <div className="filters">
          <select className="field" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 200, margin: 0 }}>
            <option value="all">ВСЕ ТИКЕТЫ</option>
            <option value="open">ОТКРЫТЫЕ</option>
            <option value="answered">ОТВЕЧЕННЫЕ</option>
            <option value="closed">ЗАКРЫТЫЕ</option>
          </select>
        </div>

        <div className="split">
          <div className="panel tickets-list">
            {loading ? <p className="muted center">ЗАГРУЗКА...</p> : visible.map(t => (
              <div key={t.id} className={`t-row ${openId === t.id ? 'active' : ''}`} onClick={() => openTicket(t.id)}>
                <span className={`t-status t-${t.status}`}>{t.status === 'open' ? '●' : t.status === 'answered' ? '◐' : '✓'}</span>
                <div className="t-main">
                  <div className="t-subject">{t.subject}</div>
                  <div className="t-meta">@{t.username} · {new Date(t.updatedAt).toLocaleString('ru-RU')}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel chat-panel">
            {ticket ? (
              <>
                <div className="panel-head">
                  <h2 className="p-title">{ticket.subject}</h2>
                  <span className={`p-tag p-tag-${ticket.status}`}>{ticket.status.toUpperCase()}</span>
                  {ticket.status !== 'closed' && <button className="btn btn-danger" onClick={closeTicket}>ЗАКРЫТЬ</button>}
                </div>
                <div className="panel-body chat">
                  {ticket.messages.map((m, i) => (
                    <div key={i} className={`msg msg-${m.from}`}>
                      <div className="msg-head"><strong>{m.username}</strong><span>{new Date(m.at).toLocaleString('ru-RU')}</span></div>
                      <div className="msg-text">{m.text}</div>
                    </div>
                  ))}
                </div>
                {ticket.status !== 'closed' && (
                  <div className="panel-body reply-box">
                    <textarea className="field" rows="2" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Ответ..." />
                    <button className="btn btn-solid" onClick={sendReply} disabled={!replyText.trim()}>ОТПРАВИТЬ</button>
                  </div>
                )}
              </>
            ) : <p className="muted center">ВЫБЕРИТЕ ТИКЕТ</p>}
          </div>
        </div>
      </div>
      <style jsx>{`
        .info { max-width: 1100px; margin: 0 auto; }
        .page-head { margin-bottom: 22px; }
        .ph-stamp { display: inline-block; padding: 3px 10px; border: 1px solid #333; color: #888; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px; }
        .ph-title { font-size: 42px; font-weight: 900; letter-spacing: 3px; margin: 0; color: #fff; line-height: 1; text-transform: uppercase; }
        .ph-dot { animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0.15; } }
        .ph-rule { height: 1px; background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%); margin: 18px 0 0; }
        .filters { margin-bottom: 16px; }
        .field { width: 100%; padding: 11px 14px; background: #060606; border: 1px solid #262626; color: #fff; font-size: 13.5px; outline: none; box-sizing: border-box; }
        .split { display: flex; gap: 16px; align-items: flex-start; }
        .tickets-list { flex: 0 0 320px; background: #0c0c0c; border: 1px solid #1f1f1f; max-height: 70vh; overflow-y: auto; }
        .chat-panel { flex: 1; background: #0c0c0c; border: 1px solid #1f1f1f; min-height: 400px; display: flex; flex-direction: column; }
        .panel-head { display: flex; align-items: center; gap: 12px; padding: 11px 18px; border-bottom: 1px solid #1f1f1f; background: #0a0a0a; }
        .p-title { font-size: 12px; font-weight: 800; letter-spacing: 2.4px; color: #fff; margin: 0; text-transform: uppercase; flex: 1; }
        .p-tag { font-family: ui-monospace, monospace; font-size: 9px; letter-spacing: 2px; color: #666; border: 1px solid #2a2a2a; padding: 2px 8px; }
        .p-tag-open { color: #88ddff; border-color: #2a5a7a; }
        .p-tag-answered { color: #8ee08e; border-color: #2a5a2a; }
        .p-tag-closed { color: #888; border-color: #2a2a2a; }
        .t-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #1a1a1a; cursor: pointer; transition: background 0.15s; }
        .t-row:hover, .t-row.active { background: #131313; }
        .t-status { font-size: 12px; }
        .t-open { color: #88ddff; } .t-answered { color: #8ee08e; } .t-closed { color: #555; }
        .t-main { flex: 1; min-width: 0; }
        .t-subject { color: #fff; font-weight: 600; font-size: 13px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .t-meta { color: #666; font-size: 10px; }
        .chat { flex: 1; max-height: 400px; overflow-y: auto; padding: 18px; }
        .msg { margin-bottom: 10px; padding: 10px 12px; border-left: 3px solid #333; background: #080808; }
        .msg-admin { border-left-color: #fff; background: #0f0f0f; }
        .msg-user { border-left-color: #666; }
        .msg-head { display: flex; justify-content: space-between; font-size: 10.5px; color: #888; margin-bottom: 4px; }
        .msg-head strong { color: #fff; }
        .msg-text { color: #ccc; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
        .reply-box { border-top: 1px solid #1f1f1f; padding: 14px; }
        .btn { display: inline-flex; align-items: center; padding: 8px 14px; background: transparent; border: 1px solid #333; color: #ccc; cursor: pointer; font-family: ui-monospace, monospace; font-size: 10px; transition: all 0.2s; }
        .btn:hover { background: #fff; color: #000; }
        .btn-solid { background: #fff; color: #000; font-weight: 800; }
        .btn-danger { color: #ff8080; border-color: #553030; }
        .btn-danger:hover { background: #ff4444; color: #fff; }
        .muted { color: #666; font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 1px; text-align: center; padding: 20px; }
        @media (max-width: 768px) {
          .split { flex-direction: column; }
          .tickets-list { flex: none; width: 100%; max-height: 300px; }
        }
      `}</style>
    </Layout>
  );
}
