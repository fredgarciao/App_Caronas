window.APP = window.APP || {};

(function(APP) {
  APP.formatTime = function(ts) {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  APP.getInitials = function(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  APP.getAvatarColor = function(str) {
    const palette = ['#5c6bc0', '#26a69a', '#ef5350', '#ab47bc', '#42a5f5', '#66bb6a', '#ffa726'];
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = str.charCodeAt(i) + ((h << 5) - h);
    }
    return palette[Math.abs(h) % palette.length];
  };

  APP.isValidEmail = function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  APP.isValidPassword = function(password) {
    return password && password.length >= APP.LIMITS.MIN_PASSWORD;
  };

  APP.normalizeString = function(str) {
    return str ? str.trim() : '';
  };

  APP.getWeekDates = function() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);

    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
  };

  APP.todayIndex = function() {
    const d = new Date().getDay();
    return d === 0 || d === 6 ? 0 : d - 1;
  };

  APP.nowTimestamp = function() {
    return Date.now();
  };
})(window.APP);