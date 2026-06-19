# ✅ CHECKLIST DE CONFIGURAÇÃO — Novo Projeto Supabase (Produção)

**Projeto:** `erdexlbzqdvsvsybropv`
**URL:** `https://erdexlbzqdvsvsybropv.supabase.co`

Este checklist cobre tudo que **não** dá para fazer via SQL — são ajustes feitos diretamente na interface do Supabase.

---

## 1️⃣ Correr o Script SQL (5 min)

- [ ] Abra: https://app.supabase.com/project/erdexlbzqdvsvsybropv
- [ ] Menu lateral → **SQL Editor**
- [ ] Clique **"New query"**
- [ ] Abra o ficheiro `setup_novo_projeto.sql` (fornecido)
- [ ] Copie TODO o conteúdo e cole no editor
- [ ] Clique **"Run"** (ou Ctrl+Enter)
- [ ] Verifique que aparece "Success" sem erros vermelhos

> ⚠️ Se der erro na parte do `pg_cron`, não tem problema — pode ignorar essa secção e correr o resto. O `pg_cron` é só para limpeza automática, não é essencial para o app funcionar.

---

## 2️⃣ Configurar Autenticação (Auth Settings)

### A. Confirmação de E-mail

- [ ] Menu lateral → **Authentication** → **Sign In / Providers**
- [ ] Verifique que **Email** está ativado
- [ ] Decida: queres exigir confirmação de e-mail antes do login funcionar?
  - **Sim (recomendado para produção):** Mantém "Confirm email" ativado
  - **Não (mais rápido para testar):** Em **Authentication → Settings**, desativa "Enable email confirmations"

### B. URL de Redirecionamento (para recuperação de senha)

- [ ] Menu lateral → **Authentication** → **URL Configuration**
- [ ] Em **Site URL**, coloque o URL onde o site está/vai estar publicado
  - Exemplo: `https://teu-site.netlify.app`
  - Se ainda não tens (vais testar local primeiro): `http://localhost:8000`
- [ ] Em **Redirect URLs**, adicione também essa mesma URL (clique "Add URL")

> 💡 Isto é importante: sem isto, o link de "Esqueci a senha" do e-mail não vai funcionar corretamente.

---

## 3️⃣ Configurar E-mails (Opcional mas recomendado)

- [ ] Menu lateral → **Authentication** → **Email Templates**
- [ ] Reveja o template **"Confirm signup"** e **"Reset Password"**
- [ ] Pode personalizar texto/assunto se quiser (opcional)

> ℹ️ Por padrão, o Supabase usa um servidor de e-mail próprio com limites baixos (poucos e-mails/hora). Para um app real com vários colegas, considera configurar SMTP próprio depois (Settings → Auth → SMTP Settings). Não é urgente para começar.

---

## 4️⃣ Verificar Tabelas Criadas

- [ ] Menu lateral → **Table Editor**
- [ ] Confirme que aparecem 3 tabelas:
  - [ ] `profiles`
  - [ ] `trips`
  - [ ] `messages`

---

## 5️⃣ Verificar Realtime Ativo

- [ ] Menu lateral → **Database** → **Replication**
- [ ] Confirme que `trips` e `messages` aparecem **ativadas** na lista de tabelas com realtime

> Se o SQL não tiver ativado automaticamente, ative manualmente clicando no toggle ao lado de cada tabela.

---

## 6️⃣ Verificar Row Level Security (RLS)

- [ ] Menu lateral → **Authentication** → **Policies**
- [ ] Confirme que aparecem políticas para as 3 tabelas (profiles, trips, messages)
- [ ] Cada tabela deve ter o ícone de cadeado **fechado** (RLS ativo) — não aberto

---

## 7️⃣ Logo / Imagem (se aplicável)

O teu `index.html` carrega uma imagem local (`image_8885dd.png`). Isso **não depende do Supabase** — continua a vir do teu repositório GitHub, então não precisa de nenhuma ação aqui.

---

## ✅ Quando Tudo Estiver Marcado

O projeto novo está pronto para receber o código atualizado. Próximo passo: atualizar o `index.html` (ou `constants.js`) com a nova URL e chave — código fornecido em separado.

