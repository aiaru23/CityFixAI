import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { onlineUsers, user } = useAuthStore();
  const [eventsData, setEventsData] = useState(null);
  const [requestsData, setRequestsData] = useState(null);
  const [connectionsData, setConnectionsData] = useState(null);

  const fetchAll = useCallback(() => {
    api.get('/events/my').then(r => setEventsData(r.data)).catch(() => {});
    api.get('/connections/requests').then(r => setRequestsData(r.data)).catch(() => {});
    api.get('/connections').then(r => setConnectionsData(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/connections/${id}`, { status });
      toast.success(status === 'accepted' ? 'Запрос принят!' : 'Запрос отклонён');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const pendingReceived = requestsData?.received?.filter(r => r.status === 'pending') || [];

  const stats = [
    { label: 'Мои события', value: eventsData?.events?.length || 0, icon: '📅' },
    { label: 'Контакты', value: connectionsData?.connections?.length || 0, icon: '🤝' },
    { label: 'Входящие запросы', value: pendingReceived.length, icon: '📨' },
    { label: 'Исходящие запросы', value: requestsData?.sent?.filter(r => r.status === 'pending')?.length || 0, icon: '📤' },
  ];

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Дашборд</h1>
        <p className={styles.subtitle}>Ваши события, запросы и контакты</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(stat => (
          <div key={stat.label} className={`card ${styles.statCard}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {pendingReceived.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Входящие запросы</h2>
          <div className={styles.requestsList}>
            {pendingReceived.map(req => (
              <div key={req._id} className={`card ${styles.requestCard}`}>
                <Link to={`/people/${req.sender?._id}`} className={styles.reqAvatar}>
                  {req.sender?.avatar ? <img src={req.sender.avatar} /> : req.sender?.name?.[0]}
                </Link>
                <div className={styles.reqInfo}>
                  <p className={styles.reqName}>{req.sender?.name}</p>
                  <p className={styles.reqMeta}>{req.sender?.role} · {req.sender?.company || req.sender?.city}</p>
                  {req.message && <p className={styles.reqMessage}>"{req.message}"</p>}
                </div>
                <div className={styles.reqActions}>
                  <button onClick={() => handleRespond(req._id, 'accepted')} className={`btn-primary ${styles.acceptBtn}`}>Принять</button>
                  <button onClick={() => handleRespond(req._id, 'rejected')} className={`btn-ghost ${styles.rejectBtn}`}>Отклонить</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Мои события</h2>
          {user?.role === 'organizer' && <Link to="/events/create" className={`btn-primary ${styles.acceptBtn}`}>+ Создать</Link>}
        </div>
        {eventsData?.events?.length > 0 ? (
          <div className={styles.eventsList}>
            {eventsData.events.map(e => (
              <Link key={e._id} to={`/events/${e._id}`} className={styles.eventItem}>
                <div className={styles.eventThumb}>
                  {e.cover ? <img src={e.cover} /> : '🎪'}
                </div>
                <div className={styles.eventInfo}>
                  <p className={styles.eventName}>{e.title}</p>
                  <p className={styles.eventMeta}>{format(new Date(e.date), 'd MMM yyyy', { locale: ru })} · {e.location?.city}</p>
                </div>
                <span className={styles.eventCount}>👥 {e.attendees?.length}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`card ${styles.empty}`}>
            <p>У вас пока нет событий</p>
            <Link to="/events" className={styles.emptyLink} style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>Найти события →</Link>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Мои контакты</h2>
          <Link to="/messages" className={styles.sectionLink}>Сообщения →</Link>
        </div>
        {connectionsData?.connections?.length > 0 ? (
          <div className={styles.connectionsList}>
            {connectionsData.connections.map(c => (
              <Link key={c._id} to={`/people/${c._id}`} className={styles.connectionItem}>
                <div className={styles.connAvatar}>
                  {c.avatar ? <img src={c.avatar} /> : c.name?.[0]}
                </div>
                <div>
                  <p className={styles.connName}>{c.name}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`card ${styles.empty}`}>
            <p>Нет контактов. <Link to="/people" className={styles.emptyLink}>Найти людей →</Link></p>
          </div>
        )}
      </section>
    </div>
  );
}
