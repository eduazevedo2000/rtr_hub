# Configuração de Administradores

Este documento explica como adicionar administradores ao sistema após a implementação do sistema de whitelist.

## Como Adicionar um Admin

Após executar a migration `20260213165239_add_admin_whitelist.sql`, você precisa adicionar o(s) email(s) do(s) administrador(es) autorizado(s) na tabela `admin_users`.

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá para **Table Editor**
3. Selecione a tabela `admin_users`
4. Clique em **Insert** → **Insert row**
5. Adicione o email do administrador no campo `email`
6. Clique em **Save**

### Opção 2: Via SQL Editor

Execute o seguinte SQL no SQL Editor do Supabase:

```sql
INSERT INTO public.admin_users (email)
VALUES ('admin@rtr.pt');
```

Substitua `admin@rtr.pt` pelo email do administrador que você deseja adicionar.

### Opção 3: Via Service Role (Para automação)

Se você precisar adicionar admins programaticamente, use a service role key do Supabase:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key, não a anon key
);

await supabaseAdmin
  .from('admin_users')
  .insert({ email: 'admin@rtr.pt' });
```

## Importante

- O email na tabela `admin_users` deve corresponder **exatamente** ao email usado no registro do Supabase Auth
- Apenas usuários com email na tabela `admin_users` podem:
  - Acessar a página `/admin`
  - Criar, modificar ou deletar dados no sistema
  - Fazer upload de imagens para os buckets de storage

## Verificar se um Usuário é Admin

Para verificar se um usuário é admin, você pode executar:

```sql
SELECT * FROM public.admin_users WHERE email = 'email@exemplo.com';
```

Ou usar a função helper:

```sql
SELECT public.is_admin();
```

Esta função retorna `true` se o usuário autenticado atual está na whitelist de admins.

## Remover um Admin

Para remover um admin, simplesmente delete o registro da tabela:

```sql
DELETE FROM public.admin_users WHERE email = 'email@exemplo.com';
```

## Segurança

- A tabela `admin_users` está protegida por RLS
- Apenas admins podem visualizar a lista de admins (para prevenir enumeração)
- Políticas explícitas negam INSERT/UPDATE/DELETE para usuários autenticados
- Apenas o service role pode inserir/atualizar/deletar registros diretamente
- O registro público está desabilitado no frontend
- Todas as operações de escrita requerem que o usuário seja admin

## ⚠️ IMPORTANTE: Desabilitar Registro Público no Supabase

**CRÍTICO:** Mesmo com o registro desabilitado no frontend, alguém pode ainda tentar criar contas via API do Supabase. Para prevenir isso completamente:

1. Acesse o Supabase Dashboard
2. Vá para **Authentication** → **Settings**
3. Desabilite **"Enable email signup"**
4. Salve as alterações

Sem este passo, alguém ainda pode criar contas via API (embora não consiga se tornar admin).

Veja `SECURITY.md` para mais detalhes sobre segurança.
