window.APP = window.APP || {};

(function(APP) {
  // Lista de listeners (callbacks) que querem ser avisados quando uma notificação nova é criada
  const listeners = [];

  /**
   * Cria uma nova notificação e avisa os listeners ativos (ex: hooks montados)
   * @param {string} text - Texto da notificação
   * @param {Array<string>|null} forUserIds - IDs dos utilizadores alvo (null = todos)
   * @returns {Object} a notificação criada
   */
  APP.createNotification = function(text, forUserIds = null) {
    const notif = {
      id: 'n' + Date.now() + Math.random(),
      text,
      ts: Date.now(),
      read: false,
      forUsers: forUserIds,
    };
    listeners.forEach(cb => cb(notif));
    return notif;
  };

  /**
   * Subscreve a novas notificações criadas localmente
   * @param {Function} callback - (notif) => void
   * @returns {Function} unsubscribe
   */
  APP.subscribeToNotifications = function(callback) {
    listeners.push(callback);
    return function unsubscribe() {
      const idx = listeners.indexOf(callback);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  };

  /**
   * Conta notificações não lidas relevantes para um utilizador
   */
  APP.getUnreadCount = function(userId, notifications) {
    return notifications.filter(n => !n.read && (!n.forUsers || n.forUsers.includes(userId))).length;
  };

  /**
   * Filtra notificações relevantes para um utilizador
   */
  APP.getRelevantNotifications = function(userId, notifications) {
    return notifications.filter(n => !n.forUsers || n.forUsers.includes(userId));
  };

  /**
   * Marca uma notificação específica como lida
   */
  APP.markNotificationAsRead = function(notificationId, notifications) {
    return notifications.map(n => (n.id === notificationId ? { ...n, read: true } : n));
  };

  /**
   * Marca todas as notificações como lidas
   */
  APP.markAllAsRead = function(notifications) {
    return notifications.map(n => ({ ...n, read: true }));
  };

  /**
   * Limpa todas as notificações (retorna lista vazia)
   */
  APP.clearAllNotifications = function() {
    return [];
  };

  /**
   * Mantém só as últimas 50 notificações
   */
  APP.trimOldNotifications = function(notifications) {
    return notifications.slice(0, 50);
  };
})(window.APP);