/**
 * @file HOOKS_TEMPLATES.md
 * Templates prontos para implementação dos custom hooks (FASE 2)
 * 
 * Copy-paste e adaptar para cada hook.
 */

# 🎣 Custom Hooks - Templates de Implementação

## 1️⃣ Template: useTrips.js

```javascript
/**
 * @file hooks/useTrips.js
 * Custom Hook: Caronas
 * 
 * Encapsula: fetch, create, edit, delete, join, leave
 * Estado: trips[], selectedDay, loading, error
 * Realtime: escuta mudanças em tempo real
 */

const { useState, useEffect, useMemo, useCallback } = React;
import { 
  fetchAllTrips, 
  createTrip, 
  updateTrip, 
  deleteTrip, 
  joinTrip, 
  leaveTrip,
  subscribeToTripsChanges 
} from '../tripsService.js';
import { filterAndSortTripsByDay } from '../utils.js';

export function useTrips(supabaseClient, userId) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  // Filtrar trips por dia selecionado
  const dayTrips = useMemo(() => 
    filterAndSortTripsByDay(trips, selectedDay), 
    [trips, selectedDay]
  );

  // Carregar caronas ao montar
  useEffect(() => {
    if (!supabaseClient) return;
    
    async function loadTrips() {
      setLoading(true);
      setError('');
      const result = await fetchAllTrips();
      if (result.success) {
        setTrips(result.trips);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }

    loadTrips();

    // Realtime listener
    const channel = subscribeToTripsChanges((eventType, payload) => {
      if (eventType === 'INSERT') {
        setTrips(prev => [...prev, payload.new]);
      } else if (eventType === 'UPDATE') {
        setTrips(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
      } else if (eventType === 'DELETE') {
        setTrips(prev => prev.filter(t => t.id !== payload.old.id));
      }
    });

    return () => supabaseClient.removeChannel(channel);
  }, [supabaseClient]);

  // Criar nova carona
  const handleCreate = useCallback(async (tripData, dayIndex) => {
    setLoading(true);
    setError('');
    const result = await createTrip(tripData, userId, 'User Name', dayIndex);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [userId]);

  // Editar carona
  const handleEdit = useCallback(async (tripId, tripData) => {
    setLoading(true);
    setError('');
    const trip = trips.find(t => t.id === tripId);
    const occupied = trip.totalSeats - trip.seatsLeft;
    
    const result = await updateTrip(tripId, tripData, occupied);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [trips]);

  // Deletar carona
  const handleDelete = useCallback(async (tripId) => {
    setLoading(true);
    setError('');
    const result = await deleteTrip(tripId);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, []);

  // Aderir a carona
  const handleJoin = useCallback(async (tripId) => {
    setLoading(true);
    setError('');
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) {
      setError('Carona não encontrada.');
      setLoading(false);
      return { success: false };
    }
    
    const result = await joinTrip(
      tripId, 
      userId, 
      trip.participants, 
      trip.seatsLeft
    );
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [trips, userId]);

  // Sair de carona
  const handleLeave = useCallback(async (tripId) => {
    setLoading(true);
    setError('');
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) {
      setError('Carona não encontrada.');
      setLoading(false);
      return { success: false };
    }
    
    const result = await leaveTrip(
      tripId, 
      userId, 
      trip.participants, 
      trip.seatsLeft
    );
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [trips, userId]);

  return {
    // Estado
    trips,
    dayTrips,
    selectedDay,
    loading,
    error,

    // Setters
    setSelectedDay,
    setError,

    // Métodos
    create: handleCreate,
    edit: handleEdit,
    delete: handleDelete,
    join: handleJoin,
    leave: handleLeave,
  };
}
```

---

## 2️⃣ Template: useMessages.js

```javascript
/**
 * @file hooks/useMessages.js
 * Custom Hook: Mensagens de Chat
 * 
 * Encapsula: fetch, send, realtime listener
 * Estado: messages[], loading, error
 */

const { useState, useEffect, useRef, useCallback } = React;
import { 
  fetchMessagesByTrip, 
  sendMessage, 
  subscribeToMessages 
} from '../messagesService.js';

export function useMessages(supabaseClient, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const subscriptionRef = useRef(null);

  // Carregar mensagens quando trip muda
  const loadMessages = useCallback(async (tripId) => {
    if (!tripId) return;
    
    setLoading(true);
    setError('');
    
    // Limpar subscription anterior
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const result = await fetchMessagesByTrip(tripId);
    if (result.success) {
      setMessages(result.messages);
    } else {
      setError(result.message);
    }

    // Nova subscription para realtime
    subscriptionRef.current = subscribeToMessages((newMsg) => {
      if (newMsg.trip_id === tripId) {
        setMessages(prev => [...prev, newMsg]);
      }
    });

    setLoading(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Enviar mensagem
  const handleSend = useCallback(async (tripId, text, userName) => {
    setError('');
    const result = await sendMessage(tripId, userId, userName, text);
    
    if (!result.success) {
      setError(result.message);
    }
    
    return result;
  }, [userId]);

  return {
    // Estado
    messages,
    loading,
    error,

    // Métodos
    loadMessages,
    send: handleSend,
    setError,
  };
}
```

---

## 3️⃣ Template: useNotifications.js

```javascript
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
```

---

## 4️⃣ Template: useRealtimeSync.js (Avançado)

```javascript
/**
 * @file hooks/useRealtimeSync.js
 * Custom Hook: Sincronização Realtime
 * 
 * Coordena TODOS os canais: trips, messages, presença
 * Apenas side effects (sem estado próprio)
 * 
 * Uso:
 * useRealtimeSync(supabaseClient, { 
 *   userId, 
 *   onTripChange, 
 *   onNewMessage, 
 *   onUserJoined 
 * });
 */

const { useEffect } = React;

export function useRealtimeSync(supabaseClient, callbacks) {
  const { 
    userId, 
    onTripChange, 
    onNewMessage, 
    onUserJoined,
    onUserLeft 
  } = callbacks || {};

  useEffect(() => {
    if (!supabaseClient) return;

    // Channel 1: Mudanças em caronas
    const tripsChannel = supabaseClient
      .channel('trips-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        (payload) => onTripChange?.(payload)
      )
      .subscribe();

    // Channel 2: Novas mensagens
    const messagesChannel = supabaseClient
      .channel('messages-sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => onNewMessage?.(payload)
      )
      .subscribe();

    // Channel 3: Presença (optional, para "está digitando", etc)
    // const presenceChannel = supabaseClient
    //   .channel(`user-${userId}`)
    //   .on('presence', { event: 'sync' }, (state) => {
    //     console.log('Presença sync', state);
    //   })
    //   .subscribe();

    // Cleanup
    return () => {
      supabaseClient.removeChannel(tripsChannel);
      supabaseClient.removeChannel(messagesChannel);
      // supabaseClient.removeChannel(presenceChannel);
    };
  }, [supabaseClient, userId, onTripChange, onNewMessage]);

  return null; // Apenas side effects
}
```

---

## ✅ Checklist de Implementação

Para cada hook novo:

- [ ] Criar arquivo em `hooks/`
- [ ] Importar serviço correspondente
- [ ] Importar utils necessários
- [ ] Implementar `useEffect` para init/cleanup
- [ ] Implementar `useCallback` para cada método
- [ ] Adicionar `useState` para loading, error
- [ ] Retornar objeto com estado + métodos
- [ ] Testar isoladamente com `console.log`
- [ ] Integrar no `App.jsx`
- [ ] Validar realtime sync

---

## 🔗 Exemplo de Integração Completa

```javascript
// App.jsx - ANTES (monolito)
function App() {
  const [trips, setTrips] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // ... 340 linhas ...
}

// App.jsx - DEPOIS (hooks)
function App() {
  const supabase = window.supabase.createClient(...);
  
  const auth = useAuth(supabase);
  const trips = useTrips(supabase, auth.user?.id);
  const messages = useMessages(supabase, auth.user?.id);
  const notifs = useNotifications(auth.user?.id);
  
  // Sincronização em tempo real
  useRealtimeSync(supabase, {
    userId: auth.user?.id,
    onTripChange: (payload) => trips.loadTrips(),
    onNewMessage: (payload) => messages.loadMessages(selectedTrip.id),
    onUserJoined: (user) => notifs.push(`${user.name} entrou`),
  });

  if (auth.loading) return <LoadingScreen />;
  if (!auth.user) return <AuthScreen onAuth={auth.login} />;
  
  return (
    <MainLayout
      auth={auth}
      trips={trips}
      messages={messages}
      notifs={notifs}
    />
  );
}
```

---

**Próximo Passo**: Implementar `useTrips.js` e testar no HTML com console.log
