# 🔐 Guia Completo de Autenticação - JurisLink

## 📋 Funcionalidades Implementadas

✅ **Cadastro com Email**  
✅ **Login com Email**  
✅ **Verificação de Email**  
✅ **Reset de Senha**  
✅ **OAuth com Google**  
✅ **OAuth com GitHub**  

---

## 🚀 1. Configuração do Supabase

### Passo 1: Configurar Email Templates

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates**

#### Template: Confirm Signup

```html
<h2>Bem-vindo ao JurisLink!</h2>
<p>Clique no link abaixo para verificar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Verificar Email</a></p>
```

#### Template: Reset Password

```html
<h2>Redefinir Senha - JurisLink</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Este link expira em 1 hora.</p>
```

### Passo 2: Configurar Redirect URLs

Em **Authentication** → **URL Configuration**:

```
Site URL: https://seu-dominio.com
Redirect URLs:
  - http://localhost:3000/auth/callback
  - https://seu-dominio.com/auth/callback
  - http://localhost:3000/auth/verify
  - https://seu-dominio.com/auth/verify
  - http://localhost:3000/auth/reset-password
  - https://seu-dominio.com/auth/reset-password
```

---

## 🔑 2. Configurar Google OAuth

### Passo 1: Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto (ou selecione existente)
3. Ative **Google+ API**

### Passo 2: Criar OAuth Client ID

1. Vá em **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure:
   - **Application type**: Web application
   - **Name**: JurisLink
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://seu-dominio.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://seu-projeto.supabase.co/auth/v1/callback
     ```

4. Clique em **Create** e copie:
   - Client ID
   - Client Secret

### Passo 3: Configurar no Supabase

1. Vá em **Authentication** → **Providers**
2. Encontre **Google**
3. Habilite o provider
4. Cole:
   - **Client ID** (do Google)
   - **Client Secret** (do Google)
5. Salve

---

## 🐙 3. Configurar GitHub OAuth

### Passo 1: GitHub OAuth App

1. Acesse [github.com/settings/developers](https://github.com/settings/developers)
2. Clique em **New OAuth App**
3. Configure:
   - **Application name**: JurisLink
   - **Homepage URL**: `https://seu-dominio.com`
   - **Authorization callback URL**:
     ```
     https://seu-projeto.supabase.co/auth/v1/callback
     ```
4. Clique em **Register application**
5. Clique em **Generate a new client secret**
6. Copie:
   - Client ID
   - Client Secret

### Passo 2: Configurar no Supabase

1. Vá em **Authentication** → **Providers**
2. Encontre **GitHub**
3. Habilite o provider
4. Cole:
   - **Client ID** (do GitHub)
   - **Client Secret** (do GitHub)
5. Salve

---

## 📧 4. Configurar Email Customizado (Opcional)

### Opção A: Usar Email Padrão do Supabase

**Já funciona out-of-the-box!** Não precisa configurar nada.

Os emails vêm de: `noreply@mail.app.supabase.io`

### Opção B: SMTP Customizado (Seu Domínio)

#### Gmail:

1. Gere uma senha de aplicativo: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. No Supabase: **Settings** → **Authentication** → **SMTP Settings**
3. Configure:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: seu-email@gmail.com
   SMTP Password: senha-de-16-digitos
   Sender Email: noreply@jurislink.com.br
   Sender Name: JurisLink
   ```

#### Resend (Recomendado):

1. Crie conta em [resend.com](https://resend.com)
2. Gere API Key
3. No Supabase:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: re_sua_api_key
   Sender Email: noreply@jurislink.com.br
   Sender Name: JurisLink
   ```

---

## 🔧 5. Variáveis de Ambiente

### Arquivo `.env.local` (Desenvolvimento)

```env
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Redis (OBRIGATÓRIO)
KV_REST_API_URL=https://seu-redis.upstash.io
KV_REST_API_TOKEN=seu-token

# Mercado Pago (Sandbox)
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-key
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-token
MERCADO_PAGO_WEBHOOK_SECRET=seu-secret
MERCADO_PAGO_SANDBOX=true

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel Blob
BLOB_READ_WRITE_TOKEN=seu-token

# Security
JWT_SECRET=seu-jwt-secret-minimo-32-chars
ENCRYPTION_KEY=chave-de-exatos-32-chars!

# Node
NODE_ENV=development
```

### Vercel (Produção)

Adicione as mesmas variáveis em: **Settings** → **Environment Variables**

Lembre-se de marcar para todos os ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🧪 6. Testar Funcionalidades

### Teste 1: Cadastro com Email

1. Acesse `/auth/cadastro`
2. Preencha o formulário
3. Verifique o email recebido
4. Clique no link de verificação
5. Deve redirecionar para o painel

### Teste 2: Login com Email

1. Acesse `/auth/login`
2. Faça login
3. Deve redirecionar para o painel correto

### Teste 3: Esqueci a Senha

1. Acesse `/auth/login`
2. Clique em "Esqueceu a senha?"
3. Digite seu email
4. Verifique o email recebido
5. Clique no link
6. Defina nova senha
7. Faça login

### Teste 4: OAuth Google

1. Acesse `/auth/cadastro` ou `/auth/login`
2. Clique no botão "Google"
3. Autentique com sua conta Google
4. Deve criar perfil e redirecionar

### Teste 5: OAuth GitHub

1. Acesse `/auth/cadastro` ou `/auth/login`
2. Clique no botão "GitHub"
3. Autentique com sua conta GitHub
4. Deve criar perfil e redirecionar

---

## 🎯 7. Rotas Implementadas

| Rota | Descrição |
|------|-----------|
| `/auth/cadastro` | Criar conta (email ou OAuth) |
| `/auth/login` | Fazer login (email ou OAuth) |
| `/auth/esqueci-senha` | Solicitar reset de senha |
| `/auth/reset-password` | Redefinir senha |
| `/auth/verify` | Verificar email |
| `/auth/callback` | Callback OAuth/Email |
| `/auth/error` | Página de erro |
| `/auth/signout` | Fazer logout |

---

## 🔒 8. Fluxos de Autenticação

### Fluxo: Cadastro com Email

```
1. Usuário preenche formulário
2. Supabase envia email de verificação
3. Usuário clica no link
4. Email é verificado
5. Perfil é criado
6. Redirecionamento baseado no role
```

### Fluxo: Cadastro com OAuth

```
1. Usuário clica em "Google" ou "GitHub"
2. Autentica no provedor
3. Callback recebe os dados
4. Perfil é criado automaticamente
5. Redirecionamento baseado no role
```

### Fluxo: Reset de Senha

```
1. Usuário solicita reset
2. Supabase envia email
3. Usuário clica no link
4. Define nova senha
5. Senha é atualizada
6. Redirecionamento para login
```

---

## 🆘 Troubleshooting

### Email não chega

- Verifique pasta de spam
- Verifique se o email está verificado no Supabase
- Teste com diferentes provedores (Gmail, Outlook)

### OAuth não funciona

- Verifique Redirect URIs no Google/GitHub
- Confirme que o provider está habilitado no Supabase
- Verifique console do navegador para erros

### Erro: "Invalid redirect URL"

- Adicione a URL em Supabase → Authentication → URL Configuration

### Usuário não é redirecionado

- Verifique `/auth/callback/route.ts`
- Confirme que o perfil foi criado
- Verifique logs no Supabase

---

## ✅ Checklist Final

Antes de ir para produção:

- [ ] OAuth Google configurado
- [ ] OAuth GitHub configurado
- [ ] Templates de email customizados
- [ ] SMTP configurado (se customizado)
- [ ] Todas as redirect URLs adicionadas
- [ ] Variáveis de ambiente na Vercel
- [ ] Testado cadastro com email
- [ ] Testado login com email
- [ ] Testado reset de senha
- [ ] Testado OAuth Google
- [ ] Testado OAuth GitHub
- [ ] Verificado criação de perfis
- [ ] Verificado redirecionamentos

---

## 🎉 Pronto!

Seu sistema de autenticação completo está implementado e pronto para uso! 🚀

**Próximos passos:**
1. Configure OAuth no Supabase
2. Teste todas as funcionalidades
3. Customize os templates de email
4. Deploy na Vercel

**Dúvidas?** Consulte a documentação do Supabase: [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
