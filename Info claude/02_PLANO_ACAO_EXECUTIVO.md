# 🚀 PLANO DE AÇÃO EXECUTIVO - Fix & Deploy

**Objetivo:** Corrigir problemas estruturais e subir o site em hosting gratuito (1-2h)

---

## 📋 CHECKLIST DE EXECUÇÃO

- [ ] **PASSO 1:** Converter módulos ES6 → Global Namespace
- [ ] **PASSO 2:** Criar inicializador centralizado
- [ ] **PASSO 3:** Atualizar index.html
- [ ] **PASSO 4:** Criar package.json
- [ ] **PASSO 5:** Criar .gitignore
- [ ] **PASSO 6:** Testar localmente
- [ ] **PASSO 7:** Push para GitHub
- [ ] **PASSO 8:** Deploy em Netlify (automático)

---

## 🔧 PASSO 1: Converter Módulos ES6 → Global Namespace

**Por quê?** Browser não entende `import/export` sem módulos nativos. Vamos usar **IIFE + namespace global**.

### Exemplo: Converter `src/constants.js`

**ANTES (não funciona no browser):**
```javascript
export const SUPABASE = { ... };
export const COLORS = { ... };
```

**DEPOIS (funciona no browser):**
```javascript
// src/constants.js
window.APP = window.APP || {};

(function(APP) {
  APP.SUPABASE = {
    URL: 'https://tpyposwehfijibzhjuxk.supabase.co',
    KEY: 'sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i',
  };

  APP.COLORS = { /* ... */ };
  APP.TABLES = { /* ... */ };
  // ... resto das constantes
})(window.APP);
```

### Converter Todos os Ficheiros (Script)

Vou gerar os ficheiros corrigidos para você copiar/colar.

---

## ✨ FICHEIROS CORRIGIDOS PRONTOS (COPY-PASTE)

### 1. src/constants.js (CORRIGIDO)

```javascript
// src/constants.js
window.APP = window.APP || {};

(function(APP) {
  APP.SUPABASE = {
    URL: 'https://tpyposwehfijibzhjuxk.supabase.co',
    KEY: 'sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i',
  };

  APP.COLORS = {
    PRIMARY: '#5c6bc0',
    BACKGROUND: '#0d1117',
    SURFACE: '#141929',
    TEXT: '#e8eaf6',
    TEXT_SECONDARY: '#9fa8da',
    ERROR: '#ef5350',
    SUCCESS: '#43a047',
    BORDER: '#252d4a',
  };

  APP.TYPOGRAPHY = {
    FONT_SANS: "'DM Sans', sans-serif",
    FONT_MONO: "'DM Mono', monospace",
  };

  APP.WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  APP.WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  APP.TABLES = {
    PROFILES: 'profiles',
    TRIPS: 'trips',
    MESSAGES: 'messages',
  };

  APP.LIMITS = {
    MIN_PASSWORD: 6,
    MAX_SEATS: 8,
    MIN_SEATS: 1,
  };

  APP.MESSAGES = {
    AUTH: {
      LOGIN_REQUIRED: 'Preencha e-mail e senha.',
      INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
      PASSWORD_MIN_LENGTH: 'Senha mínimo 6 caracteres.',
      REGISTER_FAILED: 'Erro ao criar conta: ',
      PROFILE_CREATION_FAILED: 'Usuário criado, mas erro ao salvar perfil: ',
      EMAIL_VERIFICATION_REQUIRED: 'Verifique sua caixa de entrada.',
      PROFILE_NOT_FOUND: 'Erro ao buscar perfil.',
      PASSWORD_RECOVERY_SENT: 'Link de recuperação enviado.',
      PASSWORD_RECOVERY_FAILED: 'Erro ao recuperar senha: ',
      PASSWORD_UPDATE_SUCCESS: 'Senha atualizada com sucesso!',
      PASSWORD_UPDATE_FAILED: 'Erro ao atualizar senha: ',
    },
  };
})(window.APP);
```

---

### 2. src/utils.js (CORRIGIDO)

```javascript
// src/utils.js
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
```

---

### 3. src/authService.js (CORRIGIDO)

```javascript
// src/authService.js
window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  APP.initAuthService = function(client) {
    supabaseClient = client;
  };

  APP.registerUser = async function(name, email, username, password) {
    if (!APP.isValidEmail(email)) {
      return { success: false, message: 'E-mail inválido.' };
    }
    if (!APP.isValidPassword(password)) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_MIN_LENGTH };
    }

    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      return { success: false, message: APP.MESSAGES.AUTH.REGISTER_FAILED + authError.message };
    }

    const profileData = {
      id: authData.user.id,
      name: APP.normalizeString(name),
      email: email.trim().toLowerCase(),
      username: APP.normalizeString(username).toLowerCase(),
    };

    const { error: profileError } = await supabaseClient
      .from(APP.TABLES.PROFILES)
      .insert([profileData]);

    if (profileError) {
      return {
        success: false,
        message: APP.MESSAGES.AUTH.PROFILE_CREATION_FAILED + profileError.message,
      };
    }

    return {
      success: true,
      message: !authData.session
        ? APP.MESSAGES.AUTH.EMAIL_VERIFICATION_REQUIRED
        : 'Usuário registado com sucesso!',
      user: profileData,
      requiresEmailVerification: !authData.session,
    };
  };

  APP.loginUser = async function(email, password) {
    if (!email.trim() || !password) {
      return { success: false, message: APP.MESSAGES.AUTH.LOGIN_REQUIRED };
    }

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      return {
        success: false,
        message:
          authError.message === 'Invalid login credentials'
            ? APP.MESSAGES.AUTH.INVALID_CREDENTIALS
            : APP.MESSAGES.AUTH.LOGIN_REQUIRED,
      };
    }

    const { data: profile } = await supabaseClient
      .from(APP.TABLES.PROFILES)
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!profile) {
      return { success: false, message: APP.MESSAGES.AUTH.PROFILE_NOT_FOUND };
    }

    return {
      success: true,
      user: { id: authData.user.id, ...profile },
    };
  };

  APP.logoutUser = async function() {
    const { error } = await supabaseClient.auth.signOut();
    return { success: !error };
  };

  APP.sendPasswordRecovery = async function(email) {
    if (!APP.isValidEmail(email)) {
      return { success: false, message: 'E-mail inválido.' };
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase());

    if (error) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_RECOVERY_FAILED + error.message };
    }

    return { success: true, message: APP.MESSAGES.AUTH.PASSWORD_RECOVERY_SENT };
  };

  APP.updateUserPassword = async function(newPassword) {
    if (!APP.isValidPassword(newPassword)) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_MIN_LENGTH };
    }

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_UPDATE_FAILED + error.message };
    }

    return { success: true, message: APP.MESSAGES.AUTH.PASSWORD_UPDATE_SUCCESS };
  };

  APP.getSession = async function() {
    const { data } = await supabaseClient.auth.getSession();
    return data || {};
  };

  APP.loadUserProfile = async function(userId) {
    const { data: profile } = await supabaseClient
      .from(APP.TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single();

    return profile || null;
  };

  APP.onAuthStateChange = function(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  };
})(window.APP);
```

---

### 4. src/tripsService.js (CORRIGIDO)

```javascript
// src/tripsService.js
window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  APP.initTripsService = function(client) {
    supabaseClient = client;
  };

  APP.fetchTrips = async function(dayIndex = null) {
    let query = supabaseClient.from(APP.TABLES.TRIPS).select('*').order('created_at', { ascending: true });

    if (dayIndex !== null) {
      query = query.eq('day_index', dayIndex);
    }

    const { data, error } = await query;
    return { data: data || [], error };
  };

  APP.createTrip = async function(tripData) {
    const { error } = await supabaseClient.from(APP.TABLES.TRIPS).insert([tripData]);
    return { success: !error, error };
  };

  APP.updateTrip = async function(tripId, updates) {
    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .update(updates)
      .eq('id', tripId);
    return { success: !error, error };
  };

  APP.deleteTrip = async function(tripId) {
    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .delete()
      .eq('id', tripId);
    return { success: !error, error };
  };

  APP.joinTrip = async function(tripId, userId) {
    const trip = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .select('*')
      .eq('id', tripId)
      .single();

    if (!trip.data) return { success: false };

    const updated = {
      seats_left: trip.data.seats_left - 1,
      participants: [...(trip.data.participants || []), userId],
    };

    return APP.updateTrip(tripId, updated);
  };

  APP.leaveTrip = async function(tripId, userId) {
    const trip = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .select('*')
      .eq('id', tripId)
      .single();

    if (!trip.data) return { success: false };

    const updated = {
      seats_left: trip.data.seats_left + 1,
      participants: (trip.data.participants || []).filter(id => id !== userId),
    };

    return APP.updateTrip(tripId, updated);
  };
})(window.APP);
```

---

### 5. src/messagesService.js (CORRIGIDO)

```javascript
// src/messagesService.js
window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  APP.initMessagesService = function(client) {
    supabaseClient = client;
  };

  APP.fetchMessages = async function(tripId) {
    const { data, error } = await supabaseClient
      .from(APP.TABLES.MESSAGES)
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  };

  APP.sendMessage = async function(tripId, userId, userName, text) {
    const { data, error } = await supabaseClient
      .from(APP.TABLES.MESSAGES)
      .insert([
        {
          trip_id: tripId,
          user_id: userId,
          user_name: userName,
          text,
        },
      ])
      .select();

    return { data: data?.[0] || null, error };
  };

  APP.subscribeToMessages = function(tripId, callback) {
    return supabaseClient
      .channel(`messages:${tripId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
      .subscribe();
  };
})(window.APP);
```

---

### 6. src/notificationService.js (CORRIGIDO)

```javascript
// src/notificationService.js
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
```

---

### 7. src/types.js (CORRIGIDO)

```javascript
// src/types.js - Apenas JSDoc, não precisa de namespace
/**
 * @typedef {Object} User
 * @property {string} id - UUID
 * @property {string} name - Nome completo
 * @property {string} email - E-mail
 * @property {string} username - Nome de usuário
 */

/**
 * @typedef {Object} Trip
 * @property {string} id - UUID
 * @property {string} owner_id - ID do criador
 * @property {string} owner_name - Nome do criador
 * @property {string} origin - Local de partida
 * @property {string} destination - Local de chegada
 * @property {string} time - Hora (HH:MM)
 * @property {number} total_seats - Total de vagas
 * @property {number} seats_left - Vagas disponíveis
 * @property {string} contact - Telefone do responsável
 * @property {number} day_index - Dia da semana (0-4)
 * @property {string[]} participants - IDs dos participantes
 */

/**
 * @typedef {Object} Message
 * @property {string} id - UUID
 * @property {string} trip_id - ID da carona
 * @property {string} user_id - ID do usuário
 * @property {string} user_name - Nome do usuário
 * @property {string} text - Conteúdo da mensagem
 * @property {string} created_at - Timestamp
 */
```

---

## 🔗 PASSO 2: Criar Inicializador Centralizado

### Novo ficheiro: `src/app.js`

```javascript
// src/app.js - INICIALIZADOR CENTRALIZADO
window.APP = window.APP || {};

(function(APP) {
  APP.supabaseClient = null;
  APP.currentUser = null;

  /**
   * Inicializa toda a aplicação
   * Deve ser chamado no HTML após todos os scripts serem carregados
   */
  APP.init = async function() {
    // 1. Cria cliente Supabase
    APP.supabaseClient = window.supabase.createClient(
      APP.SUPABASE.URL,
      APP.SUPABASE.KEY
    );

    // 2. Inicializa serviços
    APP.initAuthService(APP.supabaseClient);
    APP.initTripsService(APP.supabaseClient);
    APP.initMessagesService(APP.supabaseClient);

    // 3. Verifica sessão existente
    const { session } = await APP.getSession();
    if (session) {
      APP.currentUser = await APP.loadUserProfile(session.user.id);
    }

    return { success: true, user: APP.currentUser };
  };

  /**
   * Dispara quando documento está pronto
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      APP.init();
    });
  } else {
    APP.init();
  }
})(window.APP);
```

---

## 📝 PASSO 3: Atualizar index.html

**Localização:** Linhas 20-31 do seu `index.html`

**ANTES:**
```html
<!-- 🔹 IMPORTS DOS MÓDULOS REFATORADOS -->
<script src="./src/constants.js"></script>
<script src="./src/types.js"></script>
<script src="./src/utils.js"></script>
<script src="./src/authService.js"></script>
<script src="./src/tripsService.js"></script>
<script src="./src/messagesService.js"></script>
<script src="./src/notificationService.js"></script>
<script src="./src/hooks/useAuth.js"></script>
<script src="./src/hooks/useTrips.js"></script>
<script src="./src/hooks/useMessages.js"></script>
<script src="./src/hooks/useNotifications.js"></script>
```

**DEPOIS:**
```html
<!-- 🔹 MÓDULOS REFATORADOS (Namespace Global) -->
<script src="./src/constants.js"></script>
<script src="./src/types.js"></script>
<script src="./src/utils.js"></script>
<script src="./src/authService.js"></script>
<script src="./src/tripsService.js"></script>
<script src="./src/messagesService.js"></script>
<script src="./src/notificationService.js"></script>

<!-- 🔹 INICIALIZADOR -->
<script src="./src/app.js"></script>

<!-- 🔹 APP PRINCIPAL (Hooks e React) -->
<script type="text/babel" src="./src/app-main.jsx"></script>
```

> ⚠️ **Nota:** Você precisa mover o React code atual para `src/app-main.jsx` ou deixar tudo inline como `<script type="text/babel">` no final do HTML (próxima seção).

---

## 📦 PASSO 4: Criar package.json

**Novo ficheiro:** `package.json` (raiz do projeto)

```json
{
  "name": "app-caronas",
  "version": "1.0.0",
  "description": "Aplicação Web de Gestão de Caronas Corporativas",
  "author": "Frederico Garcia",
  "license": "MIT",
  "private": true,
  "scripts": {
    "dev": "npx http-server -p 8080 -c-1",
    "build": "echo 'No build needed - static files only'",
    "test": "echo 'Tests placeholder'"
  },
  "keywords": [
    "caronas",
    "corporativo",
    "react",
    "supabase"
  ],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.x"
  },
  "devDependencies": {},
  "repository": {
    "type": "git",
    "url": "https://github.com/fredgarciao/App_Caronas.git"
  }
}
```

---

## 🔐 PASSO 5: Criar .gitignore

**Novo ficheiro:** `.gitignore` (raiz do projeto)

```
# Variáveis de ambiente
.env
.env.local
.env.*.local

# Node
node_modules/
package-lock.json
yarn.lock
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
*.log
npm-debug.log*

# Temp
.cache/
temp/
tmp/

# Supabase local
.supabase/
```

---

## 🌍 PASSO 6: Criar .env.example

**Novo ficheiro:** `.env.example` (raiz do projeto)

```
# Supabase Configuration
VITE_SUPABASE_URL=https://tpyposwehfijibzhjuxk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i

# App Configuration
VITE_APP_NAME=App Caronas
VITE_APP_VERSION=1.0.0
```

**Para desenvolvimento local, crie `.env`:**
```
VITE_SUPABASE_URL=https://tpyposwehfijibzhjuxk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i
```

> ⚠️ **IMPORTANTE:** Nunca commite `.env` para Git!

---

## ✅ PASSO 7: Testar Localmente

```bash
# Terminal no diretório do projeto

# Opção 1: Usar servidor HTTP simples (Python)
python -m http.server 8000

# Opção 2: Usar Node http-server
npx http-server -p 8080

# Abrir browser
# http://localhost:8000 (ou 8080)
```

**Checklist de Teste:**
- [ ] Página carrega sem erros no console
- [ ] Login funciona
- [ ] Registo funciona
- [ ] Pode ver caronas
- [ ] Pode criar carona
- [ ] Chat funciona
- [ ] Notificações funcionam

---

## 🚀 PASSO 8: Deploy em Netlify (Grátis)

### Método A: Via Netlify UI (Recomendado - 2 min)

1. **Aceda a:** https://netlify.com/drop
2. **Arraste a pasta do projeto** (ou clique para selecionar)
3. **Aguarde deploy automático**
4. **Seu site está ao vivo!**

### Método B: Via CLI (Mais profissional)

```bash
# 1. Instale Netlify CLI
npm install -g netlify-cli

# 2. Faça login
netlify login

# 3. Deploy
netlify deploy --prod

# 4. Siga as instruções (escolha pasta raiz)
```

### Método C: Deploy contínuo a partir de GitHub

1. **Aceda a:** https://app.netlify.com
2. **Clique em "New site from Git"**
3. **Selecione seu repositório GitHub**
4. **Configurações:**
   - Build command: (deixe vazio - é estático)
   - Publish directory: `.` (raiz)
5. **Deploy automático cada push**

---

## 📊 RESUMO DE FICHEIROS A CRIAR/ALTERAR

| Ação | Ficheiro | Tempo |
|------|----------|-------|
| Converter | `src/constants.js` | 5 min |
| Converter | `src/utils.js` | 5 min |
| Converter | `src/authService.js` | 5 min |
| Converter | `src/tripsService.js` | 5 min |
| Converter | `src/messagesService.js` | 3 min |
| Converter | `src/notificationService.js` | 3 min |
| Criar | `src/app.js` | 5 min |
| Editar | `index.html` (linhas 20-31) | 3 min |
| Criar | `package.json` | 2 min |
| Criar | `.gitignore` | 2 min |
| Criar | `.env.example` | 2 min |
| Push | Git commit + push | 2 min |
| Deploy | Netlify (automático) | 2 min |
| **Total** | | **45 min** |

---

## 🎯 PRÓXIMA FASE (APÓS DEPLOY)

Após o site estar ao vivo, considere:

1. **Next.js Migration** (melhora performance, SEO)
2. **Testes unitários** (com Jest)
3. **PWA** (offline support)
4. **Análise de performance** (Lighthouse)
5. **Monitoramento** (Sentry, LogRocket)

---

## 💡 TROUBLESHOOTING

### Erro: "ReferenceError: APP is not defined"
- ✅ Verifique que `src/constants.js` é carregado **primeiro**
- ✅ Abra DevTools (F12) e verifique se os scripts carregam em ordem

### Erro: "Cannot find module 'something'"
- ✅ Verifique se conversão ES6→Namespace foi feita em **todos os ficheiros**

### Deploy não funciona em Netlify
- ✅ Verifique se `.gitignore` está correto (não tem `.git` ignorado)
- ✅ Verifique variáveis de ambiente (se usar `.env`, adicione no Netlify Dashboard)

---

## 📞 SUPORTE

Se encontrar problemas:
1. Consulte `Info claude/` para documentação detalhada
2. Verifique DevTools Console (F12)
3. Revise este documento passo-a-passo

**Boa sorte! 🚀**

