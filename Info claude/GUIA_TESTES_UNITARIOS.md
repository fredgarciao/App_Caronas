# 🧪 GUIA COMPLETO: Testar Hooks Unitariamente

> Este guia mostra como testar cada hook isoladamente, sem precisar do HTML inteiro.

---

## 🎯 OBJETIVO

Validar que cada hook funciona corretamente **sem dependências** do resto da aplicação.

---

## 📋 PRÉ-REQUISITOS

- VS Code ou editor similar
- Node.js instalado (opcional, mas recomendado)
- Um arquivo HTML simples para cada teste

---

## 🧪 TESTE 1: Hook useAuth

### Passo 1: Criar arquivo de teste

```
seu-projeto/
├── src/
└── test-useAuth.html (CRIAR ESTE)
```

### Passo 2: Conteúdo do `test-useAuth.html`

Copia e cola isto num arquivo chamado `test-useAuth.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Teste useAuth Hook</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <!-- Imports dos módulos -->
  <script src="./src/constants.js"></script>
  <script src="./src/utils.js"></script>
  <script src="./src/authService.js"></script>
  <script src="./src/hooks/useAuth.js"></script>

  <style>
    body { font-family: 'DM Sans', sans-serif; background: #0d1117; color: #e8eaf6; padding: 20px; }
    .test-box { background: #141929; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #252d4a; }
    .result { margin: 10px 0; padding: 10px; border-left: 3px solid #5c6bc0; }
    .success { border-left-color: #43a047; background: #1a2f1a; }
    .error { border-left-color: #ef5350; background: #2f1a1a; }
    button { background: #3f51b5; color: #fff; padding: 10px 15px; border: none; border-radius: 6px; cursor: pointer; margin: 5px; }
    input { background: #0d1117; color: #e8eaf6; padding: 8px; border: 1px solid #252d4a; border-radius: 6px; margin: 5px; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    function TestApp() {
      const supabase = window.supabase.createClient(
        'https://tpyposwehfijibzhjuxk.supabase.co',
        'sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i'
      );

      // Inicializar serviço
      window.initAuthService?.(supabase);

      const auth = window.useAuth?.(supabase);

      const [testResults, setTestResults] = useState([]);

      // Teste 1: Verificar se hook foi carregado
      useEffect(() => {
        const test1 = {
          name: "Hook useAuth carregado?",
          result: !!window.useAuth,
          details: window.useAuth ? "✓ Hook importado corretamente" : "✗ Hook não encontrado"
        };
        setTestResults(prev => [...prev, test1]);
      }, []);

      // Teste 2: Verificar estado inicial
      useEffect(() => {
        if (!auth) return;
        const test2 = {
          name: "Estado inicial correto?",
          result: auth.user === null && auth.loading === false,
          details: `user: ${auth.user}, loading: ${auth.loading}, error: "${auth.error}"`
        };
        setTestResults(prev => [...prev, test2]);
      }, [auth]);

      const handleTestLogin = async () => {
        if (!auth?.login) {
          console.error("auth.login não disponível");
          return;
        }
        
        const result = await auth.login("test@example.com", "password123");
        
        const test = {
          name: `Login com credenciais inválidas (esperado falhar)`,
          result: result.success === false,
          details: `Mensagem: ${result.message}`
        };
        setTestResults(prev => [...prev, test]);
      };

      return (
        <div>
          <h1>🧪 Teste do Hook useAuth</h1>
          
          <div className="test-box">
            <h2>Testes Automáticos</h2>
            {testResults.map((test, i) => (
              <div key={i} className={`result ${test.result ? 'success' : 'error'}`}>
                <strong>{test.name}:</strong> {test.result ? '✓ PASSOU' : '✗ FALHOU'}<br />
                <small>{test.details}</small>
              </div>
            ))}
          </div>

          <div className="test-box">
            <h2>Testes Manuais</h2>
            <div>
              <button onClick={handleTestLogin}>Testar Login (com credenciais inválidas)</button>
            </div>
            <div>
              <label>Estado do Hook:</label><br />
              <textarea readOnly rows="5" style={{ width: '100%', background: '#0d1117', color: '#e8eaf6' }}>
{JSON.stringify({
  user: auth?.user,
  loading: auth?.loading,
  error: auth?.error,
  isAuthenticated: auth?.isAuthenticated,
  methods: ['login', 'register', 'logout', 'sendPasswordRecovery', 'updatePassword']
}, null, 2)}
              </textarea>
            </div>
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<TestApp />);
  </script>
</body>
</html>
```

### Passo 3: Testar

1. Abre `test-useAuth.html` no navegador
2. Clica em "Testar Login"
3. Verifica a consola (F12) para erros
4. Todos os testes devem passar (verde) ✓

---

## 🧪 TESTE 2: Hook useTrips

### Passo 1: Criar `test-useTrips.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Teste useTrips Hook</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <script src="./src/constants.js"></script>
  <script src="./src/utils.js"></script>
  <script src="./src/tripsService.js"></script>
  <script src="./src/hooks/useTrips.js"></script>

  <style>
    body { font-family: 'DM Sans', sans-serif; background: #0d1117; color: #e8eaf6; padding: 20px; }
    .test-box { background: #141929; padding: 20px; border-radius: 8px; margin: 10px 0; border: 1px solid #252d4a; }
    .result { margin: 10px 0; padding: 10px; border-left: 3px solid #5c6bc0; }
    .success { border-left-color: #43a047; }
    .error { border-left-color: #ef5350; }
    button { background: #3f51b5; color: #fff; padding: 10px 15px; border: none; border-radius: 6px; cursor: pointer; margin: 5px; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    function TestApp() {
      const supabase = window.supabase.createClient(
        'https://tpyposwehfijibzhjuxk.supabase.co',
        'sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i'
      );

      window.initTripsService?.(supabase);

      // Mock userId
      const mockUserId = 'test-user-123';

      const trips = window.useTrips?.(supabase, mockUserId);

      const [testResults, setTestResults] = useState([]);

      useEffect(() => {
        // Teste 1
        const test1 = {
          name: "Hook useTrips carregado?",
          result: !!window.useTrips,
          details: window.useTrips ? "✓" : "✗"
        };

        // Teste 2
        const test2 = {
          name: "Retorna array de trips?",
          result: Array.isArray(trips?.trips),
          details: `Trips recebidas: ${trips?.trips?.length || 0}`
        };

        // Teste 3
        const test3 = {
          name: "Retorna dayTrips filtrados?",
          result: Array.isArray(trips?.dayTrips),
          details: `Day trips: ${trips?.dayTrips?.length || 0}`
        };

        // Teste 4
        const test4 = {
          name: "Tem métodos necessários?",
          result: !!trips?.create && !!trips?.edit && !!trips?.delete && !!trips?.join && !!trips?.leave,
          details: "create, edit, delete, join, leave"
        };

        setTestResults([test1, test2, test3, test4]);
      }, [trips]);

      return (
        <div>
          <h1>🧪 Teste do Hook useTrips</h1>
          
          <div className="test-box">
            {testResults.map((test, i) => (
              <div key={i} className={`result ${test.result ? 'success' : 'error'}`}>
                <strong>{test.name}:</strong> {test.result ? '✓ PASSOU' : '✗ FALHOU'}<br />
                <small>{test.details}</small>
              </div>
            ))}
          </div>

          <div className="test-box">
            <h2>Estado do Hook:</h2>
            <pre style={{ background: '#0d1117', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
{JSON.stringify({
  trips: trips?.trips?.length || 0,
  dayTrips: trips?.dayTrips?.length || 0,
  selectedDay: trips?.selectedDay,
  loading: trips?.loading,
  error: trips?.error,
  hasCreateMethod: !!trips?.create,
  hasEditMethod: !!trips?.edit,
  hasDeleteMethod: !!trips?.delete,
  hasJoinMethod: !!trips?.join,
  hasLeaveMethod: !!trips?.leave
}, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<TestApp />);
  </script>
</body>
</html>
```

---

## 🧪 TESTE 3: Hook useMessages

### Passo 1: Criar `test-useMessages.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Teste useMessages Hook</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <script src="./src/constants.js"></script>
  <script src="./src/utils.js"></script>
  <script src="./src/messagesService.js"></script>
  <script src="./src/hooks/useMessages.js"></script>

  <style>
    body { font-family: 'DM Sans', sans-serif; background: #0d1117; color: #e8eaf6; padding: 20px; }
    .test-box { background: #141929; padding: 20px; border-radius: 8px; margin: 10px 0; }
    .result { margin: 10px 0; padding: 10px; border-left: 3px solid #5c6bc0; }
    .success { border-left-color: #43a047; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    function TestApp() {
      const supabase = window.supabase.createClient(
        'https://tpyposwehfijibzhjuxk.supabase.co',
        'sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i'
      );

      window.initMessagesService?.(supabase);

      const mockUserId = 'test-user-123';
      const messages = window.useMessages?.(supabase, mockUserId);

      const [testResults, setTestResults] = useState([]);

      useEffect(() => {
        const test1 = {
          name: "Hook useMessages carregado?",
          result: !!window.useMessages,
          details: "✓"
        };

        const test2 = {
          name: "Retorna array de messages?",
          result: Array.isArray(messages?.messages),
          details: `Messages: ${messages?.messages?.length || 0}`
        };

        const test3 = {
          name: "Tem métodos (loadMessages, send)?",
          result: !!messages?.loadMessages && !!messages?.send,
          details: "✓"
        };

        setTestResults([test1, test2, test3]);
      }, [messages]);

      return (
        <div>
          <h1>🧪 Teste do Hook useMessages</h1>
          
          <div className="test-box">
            {testResults.map((test, i) => (
              <div key={i} className={`result ${test.result ? 'success' : ''}`}>
                <strong>{test.name}:</strong> {test.result ? '✓ PASSOU' : '✗ FALHOU'}<br />
              </div>
            ))}
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<TestApp />);
  </script>
</body>
</html>
```

---

## 🧪 TESTE 4: Hook useNotifications

### Passo 1: Criar `test-useNotifications.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Teste useNotifications Hook</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
  
  <script src="./src/constants.js"></script>
  <script src="./src/utils.js"></script>
  <script src="./src/notificationService.js"></script>
  <script src="./src/hooks/useNotifications.js"></script>

  <style>
    body { font-family: 'DM Sans', sans-serif; background: #0d1117; color: #e8eaf6; padding: 20px; }
    .test-box { background: #141929; padding: 20px; border-radius: 8px; margin: 10px 0; }
    .result { margin: 10px 0; padding: 10px; border-left: 3px solid #5c6bc0; }
    button { background: #3f51b5; color: #fff; padding: 10px 15px; border: none; border-radius: 6px; cursor: pointer; margin: 5px; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    function TestApp() {
      window.initNotificationService?.();

      const mockUserId = 'test-user-123';
      const notifs = window.useNotifications?.(mockUserId);

      const [testResults, setTestResults] = useState([]);

      useEffect(() => {
        const test1 = {
          name: "Hook carregado?",
          result: !!window.useNotifications
        };

        const test2 = {
          name: "Retorna array de notificações?",
          result: Array.isArray(notifs?.notifications)
        };

        const test3 = {
          name: "Tem métodos (push, clear, markAsRead)?",
          result: !!notifs?.push && !!notifs?.clear && !!notifs?.markAsRead
        };

        setTestResults([test1, test2, test3]);
      }, [notifs]);

      const handlePushNotif = () => {
        notifs?.push?.('Notificação de teste!', [mockUserId]);
      };

      return (
        <div>
          <h1>🧪 Teste do Hook useNotifications</h1>
          
          <div className="test-box">
            {testResults.map((test, i) => (
              <div key={i} className={`result`}>
                <strong>{test.name}:</strong> {test.result ? '✓' : '✗'}<br />
              </div>
            ))}
          </div>

          <div className="test-box">
            <button onClick={handlePushNotif}>Enviar notificação de teste</button>
            <p>Notificações: {notifs?.notifications?.length || 0}</p>
            <pre>{JSON.stringify(notifs?.notifications?.slice(0, 3), null, 2)}</pre>
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<TestApp />);
  </script>
</body>
</html>
```

---

## 📊 CHECKLIST DE TESTES

### Para cada hook, valida:

- [ ] Hook foi carregado (existe no window)
- [ ] Retorna estado inicial correto
- [ ] Tem todos os métodos esperados
- [ ] Métodos são funções (typeof === 'function')
- [ ] Sem erros na consola (F12)
- [ ] Realtime listeners registados (se aplicável)

---

## 🐛 DEBUGGING: Como Ler a Consola

### Abre Ferramentas de Desenvolvimento:
```
Windows: F12 ou Ctrl+Shift+I
Mac: Cmd+Option+I
```

### Procura por:

**✓ Sucesso:**
```
Hook loaded successfully
User authenticated
Messages updated
```

**✗ Erros:**
```
ReferenceError: useAuth is not defined
TypeError: cannot read property 'login' of undefined
Failed to fetch from Supabase
```

---

## 🎯 RESUMO: Como Testar

| Hook | Ficheiro | Teste Principal |
|------|----------|-----------------|
| useAuth | test-useAuth.html | Fazer login (vai falhar, é normal) |
| useTrips | test-useTrips.html | Verificar se trips carregam |
| useMessages | test-useMessages.html | Verificar métodos |
| useNotifications | test-useNotifications.html | Enviar notificação de teste |

---

## ✅ TUDO OK?

Se todos os testes passarem (verde ✓), significa:

1. ✓ Hooks estão carregados
2. ✓ Retornam estado correto
3. ✓ Têm todos os métodos
4. ✓ Sem erros de sintaxe
5. ✓ Pronto para integrar no HTML principal!

---

**Próximo Passo**: Usa o novo `index-novo.html` que já incorpora todos os hooks!

