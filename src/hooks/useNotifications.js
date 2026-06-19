
/**
 * @file hooks/useNotifications.js
 * Custom Hook: Notificações
 * 
 * Encapsula: criar, marcar lida, contar não-lidas, limpar
 * Estado: notifications[], unreadCount
 */

const { useState, useCallback, useEffect } = React;
import { 
  createNotification, 
  getUnreadCount, 
  getRelevantNotifications,
  markNotificationAsRead,
  markAllAsRead,
  clearAllNotifications,
  trimOldNotifications,
  subscribeToNotifications
} from '../notificationService.js';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  // Listener para novas notificações
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotif) => {
      setNotifications(prev => trimOldNotifications([newNotif, ...prev]));
    });

    return unsubscribe;
  }, []);

  // Contar não-lidas
  const unreadCount = useCallback(() => {
    return getUnreadCount(userId, notifications);
  }, [userId, notifications]);

  // Obter relevantes para este user
  const relevantNotifications = useCallback(() => {
    return getRelevantNotifications(userId, notifications);
  }, [userId, notifications]);

  // Push nova notificação
  const handlePush = useCallback((text, forUsers) => {
    return createNotification(text, forUsers);
  }, []);

  // Marcar como lida
  const handleMarkAsRead = useCallback((notificationId) => {
    setNotifications(prev => markNotificationAsRead(notificationId, prev));
  }, []);

  // Marcar todas como lidas
  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => markAllAsRead(prev));
  }, []);

  // Limpar tudo
  const handleClear = useCallback(() => {
    setNotifications(clearAllNotifications());
  }, []);

  return {
    // Estado
    notifications,
    unreadCount: unreadCount(),
    relevantNotifications: relevantNotifications(),

    // Métodos
    push: handlePush,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    clear: handleClear,
  };
}