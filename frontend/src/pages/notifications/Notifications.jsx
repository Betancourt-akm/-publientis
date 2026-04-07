import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaEye, FaUserPlus, FaCheckCircle, FaEnvelope, FaStar, FaClipboardList, FaTrash, FaCheckDouble } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const unreadOnly = filter === 'unread' ? 'true' : 'false';
      const { data } = await axiosInstance.get(
        `/api/notifications?page=${page}&limit=20&unreadOnly=${unreadOnly}`
      );
      setNotifications(data.notifications);
      setTotalPages(data.pagination.pages);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/api/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('¿Eliminar esta notificación?')) return;
    
    try {
      await axiosInstance.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('¿Eliminar todas las notificaciones leídas?')) return;
    
    try {
      await axiosInstance.delete('/api/notifications/read');
      setNotifications(notifications.filter(n => !n.read));
    } catch (error) {
      console.error('Error al eliminar notificaciones:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      profile_view: <FaEye className="notification-type-icon view" />,
      new_applicant: <FaUserPlus className="notification-type-icon applicant" />,
      application_status: <FaCheckCircle className="notification-type-icon status" />,
      match_found: <FaStar className="notification-type-icon match" />,
      message: <FaEnvelope className="notification-type-icon message" />,
      saved_candidate: <FaClipboardList className="notification-type-icon saved" />,
      evaluation_pending: <FaClipboardList className="notification-type-icon evaluation" />,
      evaluation_received: <FaStar className="notification-type-icon evaluation" />
    };
    return icons[type] || <FaBell className="notification-type-icon default" />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-title">
            <FaBell className="page-icon" />
            <h1>Notificaciones</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} sin leer</span>
            )}
          </div>

          <div className="header-actions">
            {unreadCount > 0 && (
              <button 
                className="action-button primary"
                onClick={markAllAsRead}
              >
                <FaCheckDouble /> Marcar todas como leídas
              </button>
            )}
            {notifications.some(n => n.read) && (
              <button 
                className="action-button danger"
                onClick={deleteAllRead}
              >
                <FaTrash /> Eliminar leídas
              </button>
            )}
          </div>
        </div>

        <div className="notifications-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { setFilter('all'); setPage(1); }}
          >
            Todas
          </button>
          <button
            className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => { setFilter('unread'); setPage(1); }}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <FaBell className="empty-icon" />
              <h3>
                {filter === 'unread' 
                  ? 'No tienes notificaciones sin leer' 
                  : 'No tienes notificaciones'
                }
              </h3>
              <p>
                {filter === 'unread'
                  ? 'Todas tus notificaciones han sido leídas'
                  : 'Cuando recibas notificaciones aparecerán aquí'
                }
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${!notification.read ? 'unread' : ''}`}
              >
                <div className="notification-icon-container">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="notification-body">
                  <div className="notification-header-card">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-date">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <p className="notification-message">{notification.message}</p>

                  <div className="notification-actions">
                    {notification.actionUrl && (
                      <Link
                        to={notification.actionUrl}
                        className="action-link"
                        onClick={() => !notification.read && markAsRead(notification._id)}
                      >
                        Ver detalles →
                      </Link>
                    )}

                    <div className="notification-buttons">
                      {!notification.read && (
                        <button
                          className="icon-button"
                          onClick={() => markAsRead(notification._id)}
                          title="Marcar como leída"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button
                        className="icon-button delete"
                        onClick={() => deleteNotification(notification._id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Anterior
            </button>
            <span className="pagination-info">
              Página {page} de {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
