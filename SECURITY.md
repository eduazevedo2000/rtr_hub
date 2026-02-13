# Segurança - Análise de Vulnerabilidades

## ✅ Proteções Implementadas

### 1. Registro no Frontend
- ✅ Função `signUp` removida do código frontend
- ✅ UI de criação de conta removida da página de login
- ✅ Apenas login é possível através da interface

### 2. Proteção da Tabela admin_users
- ✅ RLS (Row Level Security) ativado na tabela `admin_users`
- ✅ Políticas explícitas que **negam** INSERT/UPDATE/DELETE para usuários autenticados
- ✅ Apenas service role pode modificar a tabela (via dashboard ou service role key)
- ✅ Apenas admins podem visualizar a lista de admins (prevenção de enumeração)

### 3. Proteção de Dados
- ✅ Todas as políticas RLS verificam `is_admin()` antes de permitir operações
- ✅ Todas as políticas de storage verificam `is_admin()` antes de permitir uploads
- ✅ Função `is_admin()` usa `SECURITY DEFINER` para acesso seguro à tabela `auth.users`

### 4. Proteção no Frontend
- ✅ Hook `useIsAdmin` verifica se usuário está na whitelist
- ✅ Página `/admin` redireciona usuários não-admin
- ✅ Verificação dupla: autenticação + whitelist

## ⚠️ Riscos Residuais e Mitigações

### Risco 1: Registro via API do Supabase

**Problema:** Mesmo sem UI, alguém pode tentar se registrar diretamente via API do Supabase usando:
```javascript
await supabase.auth.signUp({ email: 'hacker@example.com', password: 'password123' })
```

**Mitigação:**
1. **Desabilitar registro público no Supabase Dashboard** (CRÍTICO):
   - Acesse: Supabase Dashboard → Authentication → Settings
   - Desabilite "Enable email signup"
   - Isso previne criação de contas mesmo via API

2. **Mesmo que alguém consiga criar uma conta:**
   - Não conseguirá acessar `/admin` (verificação de whitelist)
   - Não conseguirá modificar dados (políticas RLS verificam `is_admin()`)
   - Não conseguirá fazer upload de imagens (políticas de storage verificam `is_admin()`)
   - Não conseguirá adicionar-se à tabela `admin_users` (políticas negam INSERT)

### Risco 2: Modificação da Tabela admin_users

**Problema:** Alguém poderia tentar inserir seu próprio email na tabela `admin_users`.

**Mitigação:**
- ✅ Políticas RLS explícitas negam INSERT/UPDATE/DELETE para usuários autenticados
- ✅ Apenas service role pode modificar (requer acesso ao dashboard ou service role key)
- ✅ Service role key deve estar protegida e nunca exposta no frontend

### Risco 3: Bypass da Função is_admin()

**Problema:** Alguém poderia tentar modificar ou criar uma função SQL maliciosa.

**Mitigação:**
- ✅ Função usa `SECURITY DEFINER` que executa com privilégios do criador
- ✅ Função está protegida por RLS da tabela `admin_users`
- ✅ Apenas service role pode criar/modificar funções SQL

### Risco 4: Acesso Direto ao Banco de Dados

**Problema:** Se alguém tiver acesso direto ao banco de dados.

**Mitigação:**
- ⚠️ Se alguém tem acesso direto ao banco, todas as proteções podem ser contornadas
- ✅ Use senhas fortes para acesso ao Supabase Dashboard
- ✅ Ative 2FA no Supabase Dashboard
- ✅ Monitore logs de acesso suspeitos

## 🔒 Checklist de Segurança

Execute estes passos para garantir máxima segurança:

- [ ] **Desabilitar registro público no Supabase Dashboard**
  - Authentication → Settings → Desabilitar "Enable email signup"
  
- [ ] **Adicionar primeiro admin na tabela admin_users**
  ```sql
  INSERT INTO public.admin_users (email) VALUES ('seu-email@exemplo.com');
  ```

- [ ] **Verificar que service role key está protegida**
  - Nunca commitar no git
  - Usar apenas em ambiente seguro (backend/server)
  - Rotacionar periodicamente

- [ ] **Ativar 2FA no Supabase Dashboard**
  - Settings → Account → Two-Factor Authentication

- [ ] **Monitorar logs de autenticação**
  - Supabase Dashboard → Logs → Auth Logs
  - Verificar tentativas de registro suspeitas

- [ ] **Testar proteções**
  - Tentar criar conta via API (deve falhar se registro estiver desabilitado)
  - Tentar acessar `/admin` sem estar na whitelist (deve redirecionar)
  - Tentar inserir dados sem ser admin (deve falhar)

## 📝 Resumo

**Pergunta: "Não há forma de alguém se registrar no website, certo?"**

**Resposta:** 
- ✅ No frontend: **Não há forma** - código removido
- ⚠️ Via API: **Pode haver** se registro público não estiver desabilitado no Supabase Dashboard
- ✅ **Solução:** Desabilitar "Enable email signup" no Supabase Dashboard

**Pergunta: "Não há forma de alguém conseguir trocar a flag de admin?"**

**Resposta:**
- ✅ **Não há forma** - políticas RLS negam explicitamente INSERT/UPDATE/DELETE na tabela `admin_users`
- ✅ Apenas service role pode modificar (requer acesso ao dashboard)
- ✅ Mesmo que alguém consiga criar uma conta, não consegue adicionar-se à whitelist

## 🚨 Ação Imediata Necessária

**CRÍTICO:** Desabilite o registro público no Supabase Dashboard agora mesmo:

1. Acesse: https://supabase.com/dashboard/project/[seu-project-id]/auth/settings
2. Role até "Email Auth"
3. Desabilite "Enable email signup"
4. Salve as alterações

Sem este passo, alguém ainda pode criar contas via API, mesmo que não consiga se tornar admin.
