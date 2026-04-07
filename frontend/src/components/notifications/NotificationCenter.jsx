import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaEye, FaUserPlus, FaCheckCircle, FaEnvelope, FaStar, FaClipboardList } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axiosInstance.get('/api/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error al obtener contador:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/notifications?limit=5');
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
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

  const getNotificationIcon = (type) => {
    const icons = {
      profile_view: <FaEye className="notification-icon view" />,
      new_applicant: <FaUserPlus className="notification-icon applicant" />,
      application_status: <FaCheckCircle className="notification-icon status" />,
      match_found: <FaStar className="notification-icon match" />,
      message: <FaEnvelope className="notification-icon message" />,
      saved_candidate: <FaClipboardList className="notification-icon saved" />,
      evaluation_pending: <FaClipboardList className="notification-icon evaluation" />,
      evaluation_received: <FaStar className="notification-icon evaluation" />
    };
    return icons[type] || <FaBell className="notification-icon default" />;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                <p>Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <FaBell className="empty-icon" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification._id}
                  to={notification.actionUrl || '/notificaciones'}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                  </div>
                  {!notification.read && <div className="unread-dot"></div>}
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <Link 
              to="/notificaciones" 
              className="notification-footer"
              onClick={() => setIsOpen(false)}
            >
              Ver todas las notificaciones
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
