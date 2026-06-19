# 🏗️ Roadmap de Refatorização Arquitetural | App Caronas TRL 7→8

## 📋 Sumário Executivo

O código atual é **funcional e validado**, mas segue um padrão **monolítico com React inlined em HTML**, o que prejudica:
- ❌ Manutenibilidade (340+ linhas em um `<script>`)
- ❌ Testabilidade unitária
- ❌ Reutilização de componentes
- ❌ Type safety
- ❌ CI/CD & deploy estruturado

**Objetivo**: Elevar para **TRL 8** (Prototipagem Operacional) mantendo funcionalidade 100% intacta.

---

## 🎯 Estratégia de Transição (3 Fases)

### **Fase 1: Camadas Base (Semana 1)**
✅ **JÁ CRIADOS:**
- `constants.js` — Configurações centralizadas
- `types.js` — Type definitions (JSDoc)
- `utils.js` — Funções utilitárias puras
- `authService.js` — Autenticação desacoplada
- `tripsService.js` — Lógica de caronas
- `messagesService.js` — Chat & mensagens

**O que falta:**
- `notificationService.js` — Notificações centralizadas
- `hooks/useAuth.js`, `useTrips.js`, etc. — Custom hooks
- `components/*.jsx` — UI components decompostos

---

### **Fase 2: Custom Hooks (Semana 2)**
Encapsulam state + side effects, permitindo reutilização e testes.

**Hooks a criar:**
```
hooks/
├── useAuth.js          # (loading, user, login, register, logout)
├── useTrips.js         # (trips, loading, create, edit, delete, join, leave)
├── useMessages.js      # (messages, loading, send)
├── useNotifications.js # (notifications, push, clear)
└── useRealtimeSync.js  # (unifica realtime de todos os canais)
```

---

### **Fase 3: Componentes Decompostos (Semana 3)**
Quebrar o monolito em componentes isolados, testáveis.

**Estrutura final:**
```
src/components/
├── primitives/         # Atómicos (Avatar, Button, Input)
├── features/           # Compostos (TripCard, ChatScreen, AuthForm)
└── layouts/            # Rotas (MainLayout, AuthLayout)
```

---

## 🔧 Próximos Passos Imediatos

### **1. Criar `notificationService.js`**
Centraliza lógica de notificações (in-app, badges, realtime listeners).

```javascript
// notificationService.js
export function createNotification(text, forUsers) { ... }
export function subscribeToNotifications(callback) { ... }
export function markAsRead(notificationId) { ... }
```

### **2. Criar Custom Hooks**
Exemplo: `hooks/useAuth.js`

```javascript
// useAuth.js
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  async function login(email, password) {
    const result = await authService.loginUser(email, password);
    if (result.success) setUser(result.user);
    return result;
  }
  
  return { user, loading, login, logout, ... };
}
```

### **3. Integração Gradual no `index.html`**
Importar serviços e hooks via módulos ES6 no Babel:

```html
<script src="constants.js"></script>
<script src="utils.js"></script>
<script src="authService.js"></script>
<script src="hooks/useAuth.js"></script>
```

---

## 📁 Estrutura de Pastas Proposta

```
/
├── index.html              # Atual (com imports novos)
├── src/
│   ├── constants.js        # ✅ Criado
│   ├── types.js            # ✅ Criado
│   ├── utils.js            # ✅ Criado
│   ├── authService.js      # ✅ Criado
│   ├── tripsService.js     # ✅ Criado
│   ├── messagesService.js  # ✅ Criado
│   ├── notificationService.js # ⏳ TODO
│   ├── hooks/
│   │   ├── useAuth.js      # ⏳ TODO
│   │   ├── useTrips.js     # ⏳ TODO
│   │   ├── useMessages.js  # ⏳ TODO
│   │   ├── useNotifications.js # ⏳ TODO
│   │   └── useRealtimeSync.js  # ⏳ TODO
│   ├── components/
│   │   ├── primitives/
│   │   │   ├── Avatar.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── InputField.jsx
│   │   │   └── Modal.jsx
│   │   ├── features/
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── TripCard.jsx
│   │   │   ├── ChatScreen.jsx
│   │   │   └── BellPanel.jsx
│   │   └── layouts/
│   │       └── MainLayout.jsx
│   ├── store/
│   │   └── AppContext.js   # Context global (alternativa a Redux)
│   └── App.jsx             # Entry point
└── package.json            # (futuro: build tools)
```

---

## ✅ Benefícios da Refatorização

| Benefício | Antes | Depois |
|-----------|-------|--------|
| **Testabilidade** | Impossível | Testes unitários em cada função |
| **Reutilização** | Código duplicado | Componentes isolados |
| **Type Safety** | Erros runtime | JSDoc → TypeScript ready |
| **Deploy** | Push do HTML | Bundle otimizado (Webpack/Vite) |
| **Manutenção** | 340+ linhas | <100 linhas por arquivo |
| **Escalabilidade** | Difícil | Feature flags, A/B testing |

---

## 🚀 Implementação: Próximas Ações

### **Ação 1: Criar `notificationService.js`** (30 min)
Seguir o padrão de `authService.js` + `tripsService.js`.

### **Ação 2: Criar `hooks/useAuth.js`** (1 hora)
- Wrap `authService` em React hook
- Gerenciar estado local (loading, error, user)
- Exportar funções (login, register, logout)

### **Ação 3: Criar `hooks/useTrips.js`** (1.5 horas)
- Gerenciar lista de trips + seleção de dia
- Wrap `tripsService.fetchAllTrips()`, etc.
- Realtime listeners

### **Ação 4: Testar Integração no HTML**
Importar hooks no `<script>` e validar funcionamento.

---

## 📝 Checklist de Validação

- [ ] Todos os serviços funcionam offline (sem Supabase mock)
- [ ] Custom hooks podem ser usados em múltiplos componentes
- [ ] Notificações em tempo real funcionam
- [ ] Chat persiste e sincroniza
- [ ] Login/logout não quebram estado
- [ ] Deploy em produção sem erros

---

## 🔗 Referências de Código

### Padrão de Serviço (já implementado)
```javascript
// authService.js
export function initAuthService(client) { /* init */ }
export async function loginUser(email, password) { /* lógica */ }
export function onAuthStateChange(callback) { /* listener */ }
```

### Padrão de Hook (a implementar)
```javascript
// useAuth.js
export function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const sub = authService.onAuthStateChange((event, session) => {
      if (session) loadProfile(session.user.id);
    });
    return () => sub.unsubscribe();
  }, []);
  
  return { user, login: authService.loginUser, ... };
}
```

---

## 📞 Próximas Perguntas?

1. **Deve-se usar Context API ou Redux?** → Context para este MVP é suficiente
2. **Quando migrar para Next.js/TypeScript?** → Após Fase 3 validada
3. **E-2E tests com Cypress?** → Sim, após Fase 2

---

**Status**: 🟢 Fase 1 Completa | 🟡 Fase 2 Em Preparação | 🔴 Fase 3 Planeada
