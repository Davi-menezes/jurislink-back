# 🚀 Guia de Deploy - JurisLink Separado

## Visão Geral

Este projeto foi configurado para ser separado em:
- **Frontend**: Vercel (https://seu-app.vercel.app)
- **Backend**: Render (https://seu-backend.onrender.com)
- **Banco de Dados**: Supabase (apenas banco, sem OAuth)
- **Emails**: Resend

---

## 📋 Variáveis de Ambiente por Serviço

### RENDER (Backend)

```
# SUPABASE (Banco de Dados)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# RESEND (Emails)
RESEND_API_KEY=re_sua_api_key_aqui
SMTP_FROM=onboarding@resend.dev

# MERCADO PAGO
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_SECRET=seu-webhook-secret
MERCADO_PAGO_SANDBOX=true

# REDIS (Rate Limiting)
KV_REST_API_URL=https://seu-redis.upstash.io
KV_REST_API_TOKEN=seu-token-redis

# SECURITY
JWT_SECRET=sua-jwt-secret-minimo-32-caracteres
ENCRYPTION_KEY=chave-de-exatos-32-caracteres

# APP
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
NODE_ENV=production
ADMIN_EMAIL=admin@seu-dominio.com.br
```

### VERCEL (Frontend)

```
# SUPABASE (Banco de Dados)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# APP
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://seu-app.vercel.app/auth/callback

# MERCADO PAGO
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADO_PAGO_SANDBOX=true

# BLOB (opcional)
BLOB_READ_WRITE_TOKEN=seu-token-blob
```

**⚠️ IMPORTANTE**: `SUPABASE_SERVICE_ROLE_KEY` deve ficar APENAS no Render! Não exponha no Vercel!

---

## 🔧 Configuração no Supabase

### 1. Autenticação por Email
No Supabase Dashboard:
1. Vá em **Authentication** → **Providers** → **Email**
2. Habilite "Enable email signups"
3. **Não é necessário configurar SMTP** para este projeto no Modelo A.
   - Cadastro e recuperação de senha são enviados pelo backend via `Resend`.
   - O Supabase fica responsável pela autenticação e sessão.

### 2. URL de Redirect
Em **Authentication** → **URL Configuration**:
- Site URL: `https://seu-app.vercel.app`
- Redirect URLs: `https://seu-app.vercel.app/auth/callback`

---

## 📦 Deploy no Render

### 1. Preparar o projeto
```bash
# Certifique-se que está no diretório do projeto
cd jurislink-back
```

### 2. Criar arquivo render.yaml
O arquivo `render.yaml` já está configurado. Ele define:
- Build: `pnpm install && pnpm build`
- Start: `pnpm start`

### 3. Conectar ao Render
1. Acesse: https://dashboard.render.com
2. Clique em "New" → "Blueprint"
3. Conecte seu repositório GitHub
4. Selecione o arquivo `render.yaml`
5. Configure as variáveis de ambiente

### 4. Variáveis de Ambiente no Render
No dashboard do Render, vá em **Environment Variables** e adicione todas as variáveis listadas na seção "RENDER (Backend)" acima.

---

## 📦 Deploy no Vercel

### 1. Preparar o projeto
```bash
# Certifique-se que está no diretório do projeto
cd jurislink-back
```

### 2. Conectar ao Vercel
1. Acesse: https://vercel.com
2. Importe seu repositório
3. Configure as variáveis de ambiente (seção "VERCEL (Frontend)")

### 3. Framework Settings
- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`

---

## ✅ Checklist de Configuração

- [ ] Habilitar Email Signups no Supabase
- [ ] Configurar variáveis no Render
- [ ] Configurar variáveis no Vercel
- [ ] Verificar Redirect URLs no Supabase
- [ ] Testar cadastro de usuário
- [ ] Testar login
- [ ] Testar recuperação de senha

---

## 🔍 Solução de Problemas

### Emails não chegam
1. Verifique se `RESEND_API_KEY` está configurado
2. Verifique se `SMTP_FROM` está válido no Resend (ou use `onboarding@resend.dev`)
3. Use `onboarding@resend.dev` como remetente temporário

### Erro de autenticação
1. Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verifique `NEXT_PUBLIC_APP_URL` está correto

### Erro no callback
1. Verifique `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` no Vercel
2. Verifique as Redirect URLs no Supabase Dashboard
