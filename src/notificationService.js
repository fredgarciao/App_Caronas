window.APP = window.APP || {};

(function(APP) {
  const notifications = [];

  APP.addNotification = function(text, forUserIds = null) {
    const notif = {
      id: 'n' + Date.now() + Math.random(),
      text,
      ts: Date.now(),
      read: false,
      forUsers: forUserIds,
    };
    notifications.unshift(notif);
    return notifications.slice(0, 50);
  };

  APP.getNotifications = function() {
    return [...notifications];
  };

  APP.clearNotifications = function() {
    notifications.length = 0;
  };

  APP.markAllAsRead = function() {
    notifications.forEach(n => (n.read = true));
  };
})(window.APP);