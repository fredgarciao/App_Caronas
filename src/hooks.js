/**
 * @file hooks.js
 * Custom Hooks do App Caronas — useAuth, useTrips, useMessages, useNotifications
 * Convertidos para o padrão window.APP (sem import/export) para funcionar
 * diretamente no browser via <script src="...">, sem necessidade de bundler.
 */

window.APP = window.APP || {};

(function(APP) {
  const { useState, useEffect, useMemo, useRef, useCallback } = React;

  /* ═══════════════════════════════════════════════════════════
     useAuth — Autenticação (login, registo, logout, recuperação)
  ═══════════════════════════════════════════════════════════ */
  APP.useAuth = function(supabaseClient) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      if (!supabaseClient) return;
      APP.initAuthService(supabaseClient);
    }, [supabaseClient]);

    useEffect(() => {
      if (!supabaseClient) return;

      async function initAuth() {
        try {
          const { session } = await APP.getSession();
          if (session?.user?.id) {
            const profile = await APP.loadUserProfile(session.user.id);
            if (profile) {
              setUser(profile);
            }
          }
        } catch (err) {
          setError('Erro ao inicializar autenticação.');
        } finally {
          setLoading(false);
        }
      }

      initAuth();

      const { data: subscription } = APP.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          return;
        }
        if (session?.user?.id) {
          APP.loadUserProfile(session.user.id).then(profile => {
            if (profile) setUser(profile);
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription?.unsubscribe?.();
    }, [supabaseClient]);

    const login = useCallback(async (email, password) => {
      setLoading(true);
      setError('');
      const result = await APP.loginUser(email, password);
      setLoading(false);

      if (result.success) {
        setUser(result.user);
      } else {
        setError(result.message);
      }
      return result;
    }, []);

    const register = useCallback(async (name, email, username, password) => {
      setLoading(true);
      setError('');
      const result = await APP.registerUser(name, email, username, password);
      setLoading(false);

      if (result.success && !result.requiresEmailVerification) {
        setUser(result.user);
      } else if (!result.success) {
        setError(result.message);
      }
      return result;
    }, []);

    const logout = useCallback(async () => {
      setLoading(true);
      const result = await APP.logoutUser();
      setLoading(false);
      if (result.success) setUser(null);
      return result;
    }, []);

    const sendPasswordRecovery = useCallback(async (email) => {
      setLoading(true);
      setError('');
      const result = await APP.sendPasswordRecovery(email);
      setLoading(false);
      if (!result.success) setError(result.message);
      return result;
    }, []);

    const updatePassword = useCallback(async (newPassword) => {
      setLoading(true);
      setError('');
      const result = await APP.updateUserPassword(newPassword);
      setLoading(false);
      if (!result.success) setError(result.message);
      return result;
    }, []);

    return {
      user,
      loading,
      error,
      isAuthenticated: !!user,
      setCurrentUser: setUser,
      login,
      register,
      logout,
      sendPasswordRecovery,
      updatePassword,
      setError,
    };
  };

  /* ═══════════════════════════════════════════════════════════
     useTrips — CRUD de caronas + realtime
  ═══════════════════════════════════════════════════════════ */
  APP.useTrips = function(supabaseClient, userId) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDay, setSelectedDay] = useState(APP.todayIndex ? APP.todayIndex() : 0);

    const dayTrips = useMemo(
      () => APP.filterAndSortTripsByDay(trips, selectedDay),
      [trips, selectedDay]
    );

    const loadTrips = useCallback(async () => {
      setLoading(true);
      setError('');
      const result = await APP.fetchAllTrips();
      if (result.success) {
        setTrips(result.trips);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }, []);

    useEffect(() => {
      if (!supabaseClient) return;

      // Garante que o serviço está inicializado ANTES de qualquer chamada
      APP.initTripsService(supabaseClient);

      loadTrips();

      const channel = APP.subscribeToTripsChanges((eventType) => {
        loadTrips();
      });

      return () => supabaseClient.removeChannel(channel);
    }, [supabaseClient, loadTrips]);

    const create = useCallback(async (tripData, dayIndex, ownerName) => {
      setLoading(true);
      setError('');
      const result = await APP.createTrip(tripData, userId, ownerName, dayIndex);
      setLoading(false);
      if (!result.success) setError(result.message);
      else await loadTrips();
      return result;
    }, [userId, loadTrips]);

    const edit = useCallback(async (tripId, tripData) => {
      setLoading(true);
      setError('');
      const trip = trips.find(t => t.id === tripId);
      const occupied = trip ? trip.totalSeats - trip.seatsLeft : 0;

      const result = await APP.updateTrip(tripId, tripData, occupied);
      setLoading(false);
      if (!result.success) setError(result.message);
      else await loadTrips();
      return result;
    }, [trips, loadTrips]);

    const deleteTrip = useCallback(async (tripId) => {
      setLoading(true);
      setError('');
      const result = await APP.deleteTrip(tripId);
      setLoading(false);
      if (!result.success) setError(result.message);
      else await loadTrips();
      return result;
    }, [loadTrips]);

    const join = useCallback(async (tripId) => {
      setError('');
      const trip = trips.find(t => t.id === tripId);
      if (!trip) {
        setError('Carona não encontrada.');
        return { success: false };
      }
      const result = await APP.joinTrip(tripId, userId, trip.participants, trip.seatsLeft);
      if (!result.success) setError(result.message);
      else await loadTrips();
      return result;
    }, [trips, userId, loadTrips]);

    const leave = useCallback(async (tripId) => {
      setError('');
      const trip = trips.find(t => t.id === tripId);
      if (!trip) {
        setError('Carona não encontrada.');
        return { success: false };
      }
      const result = await APP.leaveTrip(tripId, userId, trip.participants, trip.seatsLeft);
      if (!result.success) setError(result.message);
      else await loadTrips();
      return result;
    }, [trips, userId, loadTrips]);

    return {
      trips,
      dayTrips,
      selectedDay,
      loading,
      error,
      setSelectedDay,
      setError,
      reload: loadTrips,
      create,
      edit,
      delete: deleteTrip,
      join,
      leave,
    };
  };

  /* ═══════════════════════════════════════════════════════════
     useMessages — Chat de uma carona + realtime
  ═══════════════════════════════════════════════════════════ */
  APP.useMessages = function(supabaseClient, userId) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const subscriptionRef = useRef(null);
    const activeTripRef = useRef(null);

    useEffect(() => {
      if (!supabaseClient) return;
      APP.initMessagesService(supabaseClient);
    }, [supabaseClient]);

    const loadMessages = useCallback(async (tripId) => {
      if (!tripId) return;

      activeTripRef.current = tripId;
      setLoading(true);
      setError('');

      if (subscriptionRef.current) {
        supabaseClient.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }

      const result = await APP.fetchMessagesByTrip(tripId);
      if (result.success) {
        setMessages(result.messages);
      } else {
        setError(result.message);
      }

      subscriptionRef.current = APP.subscribeToMessages((newMsg) => {
        if (newMsg.trip_id === activeTripRef.current) {
          setMessages(prev => [...prev, newMsg]);
        }
      });

      setLoading(false);
    }, [supabaseClient]);

    useEffect(() => {
      return () => {
        if (subscriptionRef.current) {
          supabaseClient?.removeChannel(subscriptionRef.current);
        }
      };
    }, [supabaseClient]);

    const send = useCallback(async (tripId, text, userName) => {
      setError('');
      const result = await APP.sendMessage(tripId, userId, userName, text);
      if (!result.success) setError(result.message);
      return result;
    }, [userId]);

    return {
      messages,
      loading,
      error,
      loadMessages,
      send,
      setError,
    };
  };

  /* ═══════════════════════════════════════════════════════════
     useNotifications — Notificações in-app
  ═══════════════════════════════════════════════════════════ */
  APP.useNotifications = function(userId) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
      const unsubscribe = APP.subscribeToNotifications((newNotif) => {
        setNotifications(prev => APP.trimOldNotifications([newNotif, ...prev]));
      });
      return unsubscribe;
    }, []);

    const unreadCount = APP.getUnreadCount(userId, notifications);
    const relevantNotifications = APP.getRelevantNotifications(userId, notifications);

    const push = useCallback((text, forUsers) => {
      return APP.createNotification(text, forUsers);
    }, []);

    const markAsRead = useCallback((notificationId) => {
      setNotifications(prev => APP.markNotificationAsRead(notificationId, prev));
    }, []);

    const markAllAsRead = useCallback(() => {
      setNotifications(prev => APP.markAllAsRead(prev));
    }, []);

    const clear = useCallback(() => {
      setNotifications(APP.clearAllNotifications());
    }, []);

    return {
      notifications,
      unreadCount,
      relevantNotifications,
      push,
      markAsRead,
      markAllAsRead,
      clear,
    };
  };
})(window.APP);
