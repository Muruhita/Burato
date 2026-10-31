import redis from '../../../lib/redis';
import { verifyToken } from '../../../lib/discord';
import { ADMIN_IDS } from '../../../lib/admins';
import { 
  createTicket, getTicket, listTickets, addMessage, 
  closeTicket, deleteTicket, getUnreadForUser, markUserRead, markAdminRead 
} from '../../../lib/support';

export default async function handler(req, res) {
  const user = verifyToken(req.cookies.token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const isAdmin = ADMIN_IDS.includes(user.id);

  if (req.method === 'GET') {
    if (req.query.id) {
      const ticket = await getTicket(req.query.id);
      if (!ticket) return res.status(404).json({ error: 'Не найден' });
      if (!isAdmin && ticket.userId !== user.id) return res.status(403).json({ error: 'Нет доступа' });
      
      // Помечаем прочитанным
      if (isAdmin) await markAdminRead();
      else await markUserRead(user.id);
      
      return res.status(200).json({ ticket });
    }
    
    // Список тикетов
    const tickets = await listTickets({ userId: isAdmin ? null : user.id });
    const unread = isAdmin ? await getUnreadForAdmin() : await getUnreadForUser(user.id);
    return res.status(200).json({ tickets, unread });
  }

  if (req.method === 'POST') {
    const { subject, message } = req.body;
    if (!message) return res.status(400).json({ error: 'Сообщение пустое' });
    const ticket = await createTicket(user.id, user.username, subject, message);
    return res.status(200).json({ ticket });
  }

  if (req.method === 'PUT') {
    const { id, action, text } = req.body;
    if (!id) return res.status(400).json({ error: 'Нет ID тикета' });
    
    const ticket = await getTicket(id);
    if (!ticket) return res.status(404).json({ error: 'Не найден' });
    if (!isAdmin && ticket.userId !== user.id) return res.status(403).json({ error: 'Нет доступа' });

    if (action === 'reply') {
      if (!text) return res.status(400).json({ error: 'Текст пуст' });
      const updated = await addMessage(id, isAdmin ? 'admin' : 'user', user, text);
      return res.status(200).json({ ticket: updated });
    }
    
    if (action === 'close') {
      const updated = await closeTicket(id);
      return res.status(200).json({ ticket: updated });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
