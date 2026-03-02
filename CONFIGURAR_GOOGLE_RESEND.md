# 🚀 GUIA COMPLETO: Configurar Google OAuth + Resend

## 📧 PARTE 1: Configurar Resend (Envio de Emails)

### ✅ Por que usar Resend?

O Supabase envia emails **muito devagar** e tem **rate limits** agressivos. O **Resend** é:
- ⚡ Mais rápido
- 🎯 Mais confiável
- 💰 Gratuito (3.000 emails/mês)
- 🔧 Fácil de configurar

---

### 1️⃣ Criar conta no Resend

1. Acesse: https://resend.com/signup
2. Crie sua conta (pode usar GitHub)
3. Confirme seu email

---

### 2️⃣ Obter API Key do Resend

1. No dashboard do Resend: https://resend.com/api-keys
2. Clique em **"Create API Key"**
3. Dê um nome: `JurisLink Production`
4. Selecione permissão: **"Sending access"**
5. Copie a API Key (só mostra uma vez!)

Exemplo: `re_123abc456def789ghi012jkl345mno678`

---

### 3️⃣ Adicionar Domínio no Resend (IMPORTANTE!)

⚠️ **Por padrão, o Resend só envia de `onboarding@resend.dev`** (limitado a 100 emails/dia).

Para enviar de `noreply@jurislink.com.br`, você precisa:

1. No Resend, vá em **"Domains"** → **"Add Domain"**
2. Digite seu domínio: `jurislink.com.br`
3. Adicione os **registros DNS** no seu provedor de domínio:
   - **TXT** para verificação
   - **MX** para recebimento
   - **DKIM** para autenticação
4. Aguarde verificação (pode demorar até 24h)

**Enquanto não verificar o domínio**, use temporariamente:
```typescript
from: 'JurisLink <onboarding@resend.dev>',
```

---

### 4️⃣ Configurar Variáveis de Ambiente

**Local (.env.local):**
```bash
RESEND_API_KEY=re_sua_chave_aqui
```

**Vercel:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione: `RESEND_API_KEY` = `re_sua_chave_aqui`
3. Clique em **Save**

---

### 5️⃣ Integrar Resend com Supabase Auth via SMTP

⚠️ **SOLUÇÃO DEFINITIVA**: Configure o Supabase para enviar emails via SMTP do Resend!

**No Supabase Dashboard:**

1. Vá em **"Project Settings"** → **"Auth"**
2. Role até **"SMTP Settings"**
3. Clique em **"Enable Custom SMTP"**
4. Configure:
   ```
   Host: smtp.resend.com
   Port: 465 (SSL) ou 587 (TLS)
   Username: resend
   Password: re_sua_api_key_aqui
   Sender email: noreply@jurislink.com.br
   Sender name: JurisLink
   ```
5. Clique em **"Save"**

⚠️ **IMPORTANTE**: Use `onboarding@resend.dev` como "Sender email" se ainda não verificou seu domínio!

Agora **TODOS** os emails do Supabase (verificação, recuperação de senha, etc.) serão enviados via Resend! 🎉

**Arquivo já existe**: `lib/email.ts` ✅ (para emails customizados adicionais)

---

## 🔐 PARTE 2: Configurar Google OAuth no Supabase

### Por que o erro aparece?

O erro `"Unsupported provider: provider is not enabled"` significa que o **Google OAuth NÃO está habilitado** no Supabase.

---

### 1️⃣ Obter Credenciais do Google Cloud

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Vá em **"APIs & Services"** → **"Credentials"**
4. Clique em **"Create Credentials"** → **"OAuth 2.0 Client ID"**

**Se pedir para configurar "OAuth consent screen" primeiro:**
1. Clique em **"Configure Consent Screen"**
2. Escolha **"External"**
3. Preencha:
   - **App name**: JurisLink
   - **User support email**: seu email
   - **Developer contact**: seu email
4. Em **"Scopes"**, adicione:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. Salve e volte para criar as credenciais

**Configurar OAuth Client ID:**
1. **Application type**: Web application
2. **Name**: JurisLink Production
3. **Authorized redirect URIs**: 
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```
   ⚠️ Substitua `seu-projeto` pelo ID do seu projeto Supabase (ex: `abcdefghijklmnop`)

4. Clique em **"Create"**
5. Copie:
   - **Client ID** (ex: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (ex: `GOCSPX-abc123def456`)

---

### 2️⃣ Habilitar Google OAuth no Supabase

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **"Authentication"** → **"Providers"**
4. Role até **"Google"** e clique para expandir
5. **Habilite** o toggle "Enable Sign in with Google"
6. Cole as credenciais:
   - **Client ID**: `123456789-abc.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-abc123def456`
7. Clique em **"Save"**

---

### 3️⃣ Adicionar Redirect URI no Google

**IMPORTANTE**: Copie a **Callback URL** que o Supabase gerou (ela aparece quando você habilita o Google):

Formato: `https://seu-projeto.supabase.co/auth/v1/callback`

Volte no **Google Cloud Console**:
1. **APIs & Services** → **Credentials**
2. Clique no seu **OAuth 2.0 Client ID**
3. Em **"Authorized redirect URIs"**, adicione:
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```
4. Salve

---

### 4️⃣ Testar Google OAuth

Agora você pode testar o login com Google no seu site!

1. Acesse: https://jurislink-sigma.vercel.app/auth/login
2. Clique em **"Continuar com Google"**
3. Faça login com sua conta Google
4. Você será redirecionado de volta para o site ✅

---

## 🎯 RESUMO RÁPIDO

### ✅ Checklist Resend:
- [ ] Conta criada no Resend
- [ ] API Key gerada
- [ ] `RESEND_API_KEY` adicionada no `.env.local`
- [ ] `RESEND_API_KEY` adicionada no Vercel
- [ ] Domínio verificado (opcional, mas recomendado)

### ✅ Checklist Google OAuth:
- [ ] Projeto criado no Google Cloud Console
- [ ] OAuth consent screen configurado
- [ ] Client ID e Secret gerados
- [ ] Redirect URI adicionada no Google
- [ ] Google OAuth habilitado no Supabase
- [ ] Credenciais coladas no Supabase

---

## 🧪 Teste Final

1. Acesse o site
2. Tente criar uma conta com email
3. Verifique se o email chega (Resend)
4. Tente logar com Google (OAuth)

---

## 🐛 Problemas Comuns

### "Invalid redirect URI"
**Solução**: Verifique se a redirect URI no Google é **exatamente igual** à do Supabase (incluindo https://)

### "Access blocked: This app's request is invalid"
**Solução**: Configure o OAuth consent screen no Google Cloud

### "Emails não chegam mesmo com Resend"
**Solução**: 
1. Verifique se a API Key está correta
2. Confirme que o domínio está verificado
3. Use temporariamente `onboarding@resend.dev`

---

## 📞 Precisa de Ajuda?

Me avise se:
- ❌ O Google OAuth ainda não funciona
- ❌ Os emails do Resend não chegam
- ❌ Algum erro aparece no console

Vou te ajudar! 🚀
