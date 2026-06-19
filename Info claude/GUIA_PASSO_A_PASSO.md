# 📖 GUIA PASSO A PASSO PARA LEIGOS | Estruturar o Projeto

> **Está perdido?** Este guia foi feito especialmente para ti!  
> Não precisa de conhecimento técnico avançado. Vamos passo a passo. 🎯

---

## 🎯 OBJETIVO FINAL

Transformar isto:
```
index.html (um arquivo com tudo misturado - 340 linhas)
```

Nisto:
```
projeto/
├── index.html (agora com apenas 80 linhas, importando módulos)
├── src/
│   ├── constants.js
│   ├── utils.js
│   ├── types.js
│   ├── authService.js
│   ├── tripsService.js
│   ├── messagesService.js
│   ├── notificationService.js
│   └── hooks/
│       └── useAuth.js
└── (documentação em .md)
```

**Resultado**: Código limpo, organizado, fácil de manter. ✨

---

## 🚀 PASSO 0: Preparação (Antes de Começar)

### ✅ Coisas que Precisas

1. **Um editor de código** (VS Code, recomendado)
   - Download: https://code.visualstudio.com/
   - Instala e abre

2. **Os 8 arquivos JavaScript** que descarregaste
   - `constants.js`
   - `types.js`
   - `utils.js`
   - `authService.js`
   - `tripsService.js`
   - `messagesService.js`
   - `notificationService.js`
   - `useAuth.js`

3. **O teu ficheiro `index.html` atual** (onde está o código React)

4. **Uma pasta no computador** (vou chamar de `meu-projeto-caronas`)

---

## 📁 PASSO 1: Criar a Estrutura de Pastas

### O que vamos fazer:
Organizar os ficheiros em pastas, tipo um armário com gavetas.

### 🔧 INSTRUÇÕES (Windows)

**Opção 1: Pelo Windows Explorer**

```
1. Abre "Explorador de Ficheiros" (Win + E)
2. Vai para uma pasta onde queiras guardar o projeto
   (ex: C:\Users\TeuNome\Documentos)
3. Clica com botão direito → "Nova pasta"
4. Chama a pasta: meu-projeto-caronas
5. Entra nessa pasta
6. Clica com botão direito → "Nova pasta"
7. Chama a pasta: src
```

**Resultado:**
```
C:\Users\TeuNome\Documentos\
└── meu-projeto-caronas/
    └── src/
```

**Opção 2: Pelo VS Code (Mais Fácil)**

```
1. Abre VS Code
2. File → Open Folder
3. Clica em "Create New Folder" (ou cria manualmente)
4. Chama-a: meu-projeto-caronas
5. Seleciona a pasta e clica "Select Folder"
6. No VS Code, clica com botão direito no nome da pasta
7. "New Folder" → chama "src"
```

### 🔧 INSTRUÇÕES (Mac/Linux)

```bash
# Abre Terminal e executa:
mkdir -p meu-projeto-caronas/src
cd meu-projeto-caronas
```

### ✅ RESULTADO ESPERADO

```
meu-projeto-caronas/
├── index.html          (vais copiar aqui depois)
└── src/
    ├── constants.js
    ├── types.js
    ├── utils.js
    ├── authService.js
    ├── tripsService.js
    ├── messagesService.js
    ├── notificationService.js
    └── hooks/
        └── useAuth.js
```

---

## 📋 PASSO 2: Descarregar e Colocar os Arquivos JS

### O que vamos fazer:
Pegar nos 8 arquivos `.js` e colocá-los nas pastas certas.

### ✅ INSTRUÇÕES

**Se já descarregaste os arquivos:**

1. **Abre a pasta onde estão os 8 arquivos**
   - Geralmente em `Downloads/` ou `Desktop/`
   - Vê se estão: `constants.js`, `utils.js`, etc.

2. **Copia os arquivos para `src/`**
   - Seleciona todos os `.js` **exceto** `useAuth.js`
   - Copia (Ctrl+C no Windows, Cmd+C no Mac)
   - Abre VS Code
   - Clica na pasta `src/`
   - Cola aqui (Ctrl+V)

3. **Cria pasta `hooks/` dentro de `src/`**
   - Clica com botão direito em `src/`
   - "New Folder"
   - Chama: `hooks`

4. **Move `useAuth.js` para `src/hooks/`**
   - Arrasta `useAuth.js` para a pasta `hooks/`
   - Ou: copia e cola dentro de `hooks/`

### ✅ RESULTADO ESPERADO

```
meu-projeto-caronas/
└── src/
    ├── constants.js          ← aqui
    ├── types.js              ← aqui
    ├── utils.js              ← aqui
    ├── authService.js        ← aqui
    ├── tripsService.js       ← aqui
    ├── messagesService.js    ← aqui
    ├── notificationService.js ← aqui
    └── hooks/
        └── useAuth.js        ← aqui
```

**Se vir isto, está CORRETO! ✅**

---

## 🌐 PASSO 3: Copiar o `index.html` Atual

### O que vamos fazer:
Pegar no teu HTML atual e colocá-lo na raiz da pasta.

### ✅ INSTRUÇÕES

1. **Localiza o teu `index.html` atual**
   - Onde está guardado agora?
   - Abre a pasta

2. **Copia o ficheiro**
   - Clica com botão direito em `index.html`
   - Seleciona "Copy" (ou Ctrl+C)

3. **Cola na pasta `meu-projeto-caronas/`**
   - Abre VS Code
   - Clica na pasta raiz (nome principal)
   - Clica com botão direito
   - "Paste" (ou Ctrl+V)

### ✅ RESULTADO ESPERADO

```
meu-projeto-caronas/
├── index.html          ← aqui (teu HTML atual)
└── src/
    ├── constants.js
    ├── types.js
    ├── utils.js
    ├── authService.js
    ├── tripsService.js
    ├── messagesService.js
    ├── notificationService.js
    └── hooks/
        └── useAuth.js
```

**Se vir isto, está CORRETO! ✅**

---

## 🔗 PASSO 4: Atualizar o `index.html` para Importar os Módulos

### O que vamos fazer:
Dizer ao HTML onde estão os novos arquivos.

### 📝 INSTRUÇÕES

**Abre `index.html` no VS Code**

Procura por isto no código HTML:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
```

**Logo ANTES deste bloco:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
```

**Adiciona isto (novos imports):**
```html
<!-- 🔹 Imports dos nossos módulos -->
<script src="./src/constants.js"></script>
<script src="./src/types.js"></script>
<script src="./src/utils.js"></script>
<script src="./src/authService.js"></script>
<script src="./src/tripsService.js"></script>
<script src="./src/messagesService.js"></script>
<script src="./src/notificationService.js"></script>
<script src="./src/hooks/useAuth.js"></script>
```

### 🎨 EXEMPLO COMPLETO

**ANTES:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <!-- ... outras metas ... -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/..."></script>
  <!-- ... -->
</head>
```

**DEPOIS:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <!-- ... outras metas ... -->
  
  <!-- 🔹 Imports dos nossos módulos -->
  <script src="./src/constants.js"></script>
  <script src="./src/types.js"></script>
  <script src="./src/utils.js"></script>
  <script src="./src/authService.js"></script>
  <script src="./src/tripsService.js"></script>
  <script src="./src/messagesService.js"></script>
  <script src="./src/notificationService.js"></script>
  <script src="./src/hooks/useAuth.js"></script>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/..."></script>
  <!-- ... -->
</head>
```

### ✅ SALVEI? PRONTO! ✅

Pressiona `Ctrl+S` (ou Cmd+S no Mac) para guardar.

---

## 🧪 PASSO 5: Testar se Funciona

### O que vamos fazer:
Abrir o HTML no navegador e ver se há erros.

### ✅ INSTRUÇÕES

**Opção 1: Via VS Code (Recomendado)**

1. Clica com botão direito em `index.html`
2. Seleciona **"Open with Live Server"**
3. Deve abrir o navegador automaticamente

**Se não tem "Live Server":**
1. No VS Code, clica em Extensions (lado esquerdo, icon com 4 quadrados)
2. Procura: `Live Server`
3. Clica no primeiro resultado
4. Clica em "Install"
5. Agora repete os passos acima

**Opção 2: Arrasta para o Navegador**

1. Abre VS Code
2. Clica com botão direito em `index.html`
3. "Show in File Explorer"
4. Arrasta `index.html` para o Chrome/Firefox/Safari

### 🔍 VERIFICAR SE FUNCIONA

Quando abrir o navegador:

**✅ SUCESSO:**
- Vê a aplicação normal
- Sem erros na consola (F12 → Console)

**❌ ERRO:**
- Ver mensagem vermelha na consola
- Isto é normal! Vamos corrigir agora.

---

## 🐛 PASSO 6: Se Houver Erros (Debugging)

### O que fazer:

**1. Abre a Consola do Navegador**
```
Windows: F12 ou Ctrl+Shift+I
Mac: Cmd+Option+I
```

**2. Procura por erros VERMELHOS**
```
Exemplo:
⚠️ Failed to fetch ./src/constants.js
```

**3. Causas Comuns:**

| Erro | Solução |
|------|---------|
| `Failed to fetch ./src/constants.js` | Os arquivos não estão na pasta correta. Verifica se estão em `src/` |
| `CORS error` | Precisa de um servidor. Usa "Live Server" (Passo 5) |
| `Uncaught ReferenceError: constants is not defined` | Verifica se os imports estão na ordem correta |

**4. Se ainda tiver erros:**
- Verifica o nome das pastas (case-sensitive em Mac/Linux)
- Verifica se não há espaços nos nomes
- Reinicia o Live Server

---

## 📦 PASSO 7: Estrutura Final (Verificação)

### ✅ Checklist Visual

```
✓ Pasta criada: meu-projeto-caronas/
✓ Subpasta criada: meu-projeto-caronas/src/
✓ Subpasta criada: meu-projeto-caronas/src/hooks/
✓ Arquivo: meu-projeto-caronas/index.html
✓ 7 arquivos em src/: constants, types, utils, authService, tripsService, messagesService, notificationService
✓ 1 arquivo em src/hooks/: useAuth.js
✓ index.html importa todos os módulos
✓ Sem erros ao abrir no navegador
```

**Se marcou TUDO, está PRONTO! 🎉**

---

## 🎬 PASSO 8: Próximos Passos (Fase 2)

Agora que a estrutura está pronta, vamos:

### 1. Criar mais Custom Hooks (2-3 horas)

Cria novos arquivos em `src/hooks/`:
- `useTrips.js`
- `useMessages.js`
- `useNotifications.js`

(Usa os templates em `HOOKS_TEMPLATES.md`)

### 2. Integrar no React (1-2 horas)

Substitui os `useState` antigos pelos hooks novos.

### 3. Testar Tudo (1 hora)

Abre 2 abas, testa realtime sync, notificações, etc.

---

## 📸 PRINT SCREEN DO RESULTADO FINAL

### Visual esperado no VS Code:

```
EXPLORER
meu-projeto-caronas
  ├─ 📄 index.html
  ├─ 📁 src
  │  ├─ 📄 constants.js
  │  ├─ 📄 types.js
  │  ├─ 📄 utils.js
  │  ├─ 📄 authService.js
  │  ├─ 📄 tripsService.js
  │  ├─ 📄 messagesService.js
  │  ├─ 📄 notificationService.js
  │  └─ 📁 hooks
  │     └─ 📄 useAuth.js
  ├─ 📁 docs (ou docs de documentação)
  │  ├─ 📄 README.md
  │  ├─ 📄 RESUMO_EXECUTIVO.md
  │  └─ ...
```

---

## ⚠️ ERROS COMUNS

### Erro 1: "Cannot find module './src/constants.js'"

**Causa**: Os arquivos não estão em `src/`

**Solução**:
```
1. Verifica se constants.js está em src/
2. Se não estiver, move-o
3. Recarrega a página (F5)
```

### Erro 2: "Uncaught SyntaxError: Unexpected token"

**Causa**: Um dos arquivos tem erro de sintaxe

**Solução**:
1. Abre o arquivo mencionado no erro
2. Procura por linhas com `}` ou `{` incompletos
3. Se não vê nada, compara com o arquivo original

### Erro 3: "CORS error"

**Causa**: O navegador bloqueia os imports por segurança

**Solução**:
```
Usa Live Server (não simplesmente abre o HTML no disco)
File → Open with Live Server
```

---

## ✅ RESUMO FINAL

| Passo | Ação | Resultado |
|-------|------|-----------|
| 0 | Preparação | Tens VS Code, ficheiros, pasta |
| 1 | Criar pastas | `meu-projeto-caronas/src/hooks/` |
| 2 | Copiar arquivos JS | 8 arquivos nos sítios certos |
| 3 | Copiar HTML | `index.html` na raiz |
| 4 | Atualizar imports | HTML importa todos os módulos |
| 5 | Testar | Abre no navegador, sem erros |
| 6 | Debugar | Corrige erros se houver |
| 7 | Verificar | Tudo está no lugar certo |
| 8 | Próximos passos | Pronto para Fase 2! |

---

## 🎓 CONCEITOS-CHAVE EXPLICADOS

### O que é uma "pasta"?
É tipo um armário com gavetas. Dentro de `src/` guardamos código.

### O que é um "módulo"?
Um ficheiro JavaScript reutilizável. Ex: `constants.js` contém todas as cores.

### O que é "importar"?
Dizer ao HTML: "Preciso do ficheiro `constants.js`". A linha:
```html
<script src="./src/constants.js"></script>
```
significa: "Vai à pasta `src/`, pega no `constants.js` e carrega-o".

### Por que separar em pastas?
```
❌ 340 linhas tudo num ficheiro = confuso
✅ 40 linhas em cada ficheiro = claro, organizado
```

---

## 🚨 PRECISA DE AJUDA?

Se algo não funcionar:

1. **Verificar a consola** (F12 → Console)
2. **Copiar a mensagem de erro**
3. **Comparar com este guia**
4. **Verificar caminhos dos arquivos** (./src/ está correto?)

---

**Parabéns! Agora tens o projeto estruturado! 🎉**

Próximo passo: Ler `HOOKS_TEMPLATES.md` para criar os outros hooks.

---

*Criado para leigos. Sem jargão técnico desnecessário. Passo a passo visual.*
