# 📊 Diagrama de Arquitetura | App Caronas Refatorizado

## 🏛️ Estrutura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    UI LAYER (React Components)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ AuthScreen   │  │  MainLayout  │  │  TripCard        │  │
│  │ ChatScreen   │  │  BellPanel   │  │  ProfileCard     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ consume
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              HOOKS LAYER (State + Effects)                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │ useAuth    │  │ useTrips   │  │ useNotifications   │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
│  ┌────────────┐  ┌─────────────────────────────────────┐   │
│  │useMessages │  │      useRealtimeSync                │   │
│  └────────────┘  │ (coordena todoscanais)              │   │
│                  └─────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ call
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         SERVICES LAYER (Lógica de Negócio)                  │
│  ┌────────────────┐  ┌────────────────┐ ┌───────────────┐  │
│  │ authService    │  │ tripsService   │ │messagesService│  │
│  └────────────────┘  └────────────────┘ └───────────────┘  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         notificationService (agregador)              │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ call
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           DATABASE & REALTIME (Supabase SDK)               │
│           ┌────────────────────────────────────────┐        │
│           │  PostgreSQL + Auth + Realtime (WS)    │        │
│           │  (profiles, trips, messages tables)   │        │
│           └────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependências entre Módulos

```
constants.js
    ├── COLORS, TYPOGRAPHY, WEEKDAYS
    ├── LIMITS, MESSAGES
    └── SUPABASE, TABLES

utils.js
    ├── imports: constants.js
    ├── formatting: formatTime, getInitials, getAvatarColor
    ├── validation: isValidEmail, validateTripData
    └── helpers: getWeekDates, calculateSeatsLeft

types.js
    └── JSDoc type definitions (sem imports)

authService.js
    ├── imports: constants.js, utils.js
    ├── requires: supabaseClient.init()
    └── exports: loginUser, registerUser, loadUserProfile, ...

tripsService.js
    ├── imports: constants.js, utils.js
    ├── requires: supabaseClient.init()
    └── exports: fetchAllTrips, createTrip, joinTrip, ...

messagesService.js
    ├── imports: constants.js
    ├── requires: supabaseClient.init()
    └── exports: sendMessage, fetchMessagesByTrip, ...

notificationService.js
    ├── imports: constants.js, utils.js
    ├── requires: supabaseClient.init() [OPCIONAL]
    └── exports: createNotification, subscribeToNotifications, ...

useAuth.js (CUSTOM HOOK)
    ├── imports: authService.js
    ├── requires: supabaseClient passed via props
    └── returns: { user, loading, error, login, register, logout }

useTrips.js (CUSTOM HOOK) [TODO]
    ├── imports: tripsService.js, utils.js, notificationService.js
    ├── requires: supabaseClient, userId
    └── returns: { trips, loading, dayTrips, create, edit, delete, join, leave }

useMessages.js (CUSTOM HOOK) [TODO]
    ├── imports: messagesService.js
    ├── requires: supabaseClient
    └── returns: { messages, loading, send, subscribe }

useNotifications.js (CUSTOM HOOK) [TODO]
    ├── imports: notificationService.js
    ├── requires: supabaseClient, userId
    └── returns: { notifications, unread, push, clear, markAsRead }

useRealtimeSync.js (CUSTOM HOOK) [TODO]
    ├── imports: tripsService.js, messagesService.js
    ├── requires: supabaseClient, currentUser
    └── returns: {} (apenas side effects)

App.jsx (ENTRY POINT)
    ├── imports: todos os hooks, constants
    ├── initializes: Supabase, services
    └── coordinates: navegação, estado global
```

---

## 🔄 Fluxo de Dados (Data Flow)

### Login User
```
AuthScreen (component)
    ↓ submit
useAuth.login(email, password)
    ↓
authService.loginUser(email, password)
    ↓
supabase.auth.signInWithPassword()
    ↓ response
supabase.from('profiles').select().single()
    ↓ response
useAuth setState(user)
    ↓ emit
App receives user via hook
    ↓ render
MainLayout mounted
```

### Criar Carona
```
MainLayout → TripForm (component)
    ↓ submit
useTrips.create(tripData, dayIndex)
    ↓
tripsService.createTrip(...)
    ↓
supabase.from('trips').insert()
    ↓ response
useTrips setState(trips)
    ↓ trigger
notificationService.createNotification("Nova carona criada")
    ↓
BellPanel updates
```

### Receber Mensagem (Realtime)
```
Chat aberto → useMessages.subscribe()
    ↓ listener
messagesService.subscribeToMessages(callback)
    ↓
supabase.channel('messages-realtime').on('INSERT')
    ↓ payload
notificationService.handleMessageNotification()
    ↓
useNotifications.push(notification)
    ↓
BellPanel updates, mensagem aparece
```

---

## 🧪 Testabilidade

### Antes (Monolito)
```javascript
// Impossível testar isoladamente
function App() {
  const [trips, setTrips] = useState([]);
  // 340+ linhas misturadas com UI
}
```

### Depois (Modular)
```javascript
// ✅ Testa puro
test('formatTime', () => {
  expect(formatTime(1234567890)).toBe('12:31');
});

// ✅ Testa lógica sem Supabase
test('validateTripData', () => {
  const valid = validateTripData({ origin: 'A', destination: 'B', ... });
  expect(valid.valid).toBe(true);
});

// ✅ Testa hook com mock
test('useAuth', async () => {
  const supabaseClient = mockSupabase();
  const { result } = renderHook(() => useAuth(supabaseClient));
  
  act(() => {
    result.current.login('user@test.com', 'password');
  });
  
  await waitFor(() => {
    expect(result.current.user).not.toBeNull();
  });
});
```

---

## 📈 Métrica de Maturidade

| Critério | TRL 7 (Atual) | TRL 8 (Target) |
|----------|---------------|----------------|
| **Estrutura** | Monolito HTML | Módulos ES6 |
| **Testes** | Nenhum | Unit + Integration |
| **Type Safety** | Nenhum | JSDoc + (TS futuro) |
| **Documentação** | Código apenas | JSDoc + README |
| **CI/CD** | Manual push | Automático |
| **Escalabilidade** | Baixa | Alta |
| **Manutenibilidade** | Baixa | Alta |

---

## 🚀 Próxima Fase: Componentes Decompostos

```
components/
├── primitives/ (atómicos, testáveis)
│   ├── Avatar.jsx
│   │   prop: name, size (defaults: F, 28)
│   │   render: <div style={{...}}>
│   │
│   ├── Button.jsx
│   │   props: variant, full, disabled, onClick
│   │   render: <button style={{...}}>
│   │
│   ├── InputField.jsx
│   │   props: label, error, type, value, onChange
│   │   render: <div><label><input></div>
│   │
│   └── Modal.jsx
│       props: title, onClose, children
│       render: <div className="slide-up">
│
├── features/ (compostos, usam hooks)
│   ├── AuthScreen.jsx
│   │   uses: useAuth
│   │   props: onAuth
│   │
│   ├── TripCard.jsx
│   │   uses: nenhum (puro)
│   │   props: trip, onJoin, onLeave, onEdit, onDelete
│   │
│   └── ChatScreen.jsx
│       uses: useMessages
│       props: tripId, currentUser
│
└── layouts/
    └── MainLayout.jsx
        uses: useAuth, useTrips, useNotifications
        children: todos os features
```

---

## ✅ Checklist de Validação (Fase 1 Completa)

- [x] `constants.js` — Cores, textos, limites
- [x] `types.js` — JSDoc type defs
- [x] `utils.js` — Funções puras testáveis
- [x] `authService.js` — Autenticação desacoplada
- [x] `tripsService.js` — CRUD de caronas
- [x] `messagesService.js` — Chat
- [x] `notificationService.js` — Notificações
- [x] `useAuth.js` — Exemplo de hook
- [ ] `useTrips.js` — TODO
- [ ] `useMessages.js` — TODO
- [ ] `useNotifications.js` — TODO
- [ ] Componentes primitivos — TODO
- [ ] Integração no HTML — TODO

---

**Responsável Próxima Fase**: Developer (criar useTrips, useMessages, componentizar UI)
