# 🚨 GUIA URGENTE: Resolver TUDO Agora!

## ✅ SIGA ESSA ORDEM (30 minutos no total)

---

## 🔥 **PASSO 1: Configurar RESEND (5 minutos)**

### Se você JÁ tem conta no Resend:
1. Vá em: https://resend.com/api-keys
2. Copie sua API Key (começa com `re_`)

### Se você NÃO tem conta:
1. Crie conta: https://resend.com/signup
2. Vá em: https://resend.com/api-keys
3. Clique em **"Create API Key"**
4. Nome: `JurisLink Production`
5. Copie a key

### Adicionar no Vercel:
1. https://vercel.com/dashboard
2. Selecione **jurislink-sigma**
3. **Settings** → **Environment Variables**
4. Adicione:
   ```
   RESEND_API_KEY = re_sua_chave_aqui
   ```
5. Clique em **"Save"**

---

## 🔥 **PASSO 2: Configurar SMTP no Supabase (5 minutos)** ⭐ MAIS IMPORTANTE

1. Vá em: https://supabase.com/dashboard
2. Selecione seu projeto
3. **"Project Settings"** (⚙️) → **"Auth"**
4. Role até **"SMTP Settings"**
5. Clique em **"Enable Custom SMTP"**
6. Preencha:

```
Host: smtp.resend.com
Port: 465
Username: resend
Password: [cole sua API key do Resend aqui - re_...]
Sender email: onboarding@resend.dev
Sender name: JurisLink
```

7. Clique em **"Save"**

✅ **PRONTO! Agora os emails vão funcionar!**

---

## 🔥 **PASSO 3: Copiar Callback URL do Supabase (2 minutos)**

1. Ainda no Supabase Dashboard
2. Vá em **"Authentication"** → **"Providers"**
3. Clique em **"Google"**
4. Copie a **"Callback URL (for OAuth)"**

Exemplo:
```
https://cmaoupgrltfusqucnqbw.supabase.co/auth/v1/callback
```

⚠️ **ANOTE ESSA URL!** Você vai usar no próximo passo.

---

## 🔥 **PASSO 4: Configurar OAuth Consent Screen (10 minutos)**

1. Vá em: https://console.cloud.google.com
2. Selecione seu projeto
3. **"APIs & Services"** → **"OAuth consent screen"**

### Se NUNCA configurou:
1. Clique em **"Configure Consent Screen"**
2. **User Type**: External
3. Clique em **"Create"**

### Configurar:
```
App name: JurisLink
User support email: seu-email@gmail.com
Application home page: https://jurislink-sigma.vercel.app
Application privacy policy: https://jurislink-sigma.vercel.app/privacidade
Application terms of service: https://jurislink-sigma.vercel.app/termos
Developer contact: seu-email@gmail.com
```

4. Clique em **"Save and Continue"**
5. Em **"Scopes"**, clique em **"Add or Remove Scopes"**
6. Selecione:
   - ✅ `userinfo.email`
   - ✅ `userinfo.profile`
   - ✅ `openid`
7. Clique em **"Update"** → **"Save and Continue"**
8. Clique em **"Back to Dashboard"**

---

## 🔥 **PASSO 5: Adicionar Redirect URI no Google (5 minutos)**

1. Ainda no Google Cloud Console
2. **"APIs & Services"** → **"Credentials"**
3. Clique no seu **OAuth 2.0 Client ID**
4. Role até **"Authorized redirect URIs"**
5. Clique em **"+ ADD URI"**
6. Cole a URL do Supabase que você copiou no passo 3:
   ```
   https://cmaoupgrltfusqucnqbw.supabase.co/auth/v1/callback
   ```
7. Clique em **"SAVE"**

---

## 🔥 **PASSO 6: Habilitar Google no Supabase (3 minutos)**

1. Volte no Supabase: https://supabase.com/dashboard
2. **"Authentication"** → **"Providers"**
3. Clique em **"Google"**
4. **Enable Sign in with Google**: ON (verde)
5. Cole as credenciais do Google:
   - **Client ID**: (copie do Google Cloud Console)
   - **Client Secret**: (copie do Google Cloud Console)
6. Clique em **"Save"**

---

## 🔥 **PASSO 7: Fazer Deploy (2 minutos)**

```bash
# Instalar dependências
npm install

# Fazer push
git add .
git commit -m "fix: Configurar OAuth e SMTP"
git push
```

---

## 🔥 **PASSO 8: Redeploy no Vercel (1 minuto)**

1. Vá em: https://vercel.com/dashboard
2. Selecione **jurislink-sigma**
3. Vá em **"Deployments"**
4. Clique nos **3 pontinhos** do último deploy
5. Clique em **"Redeploy"**

Aguarde o deploy terminar (2-3 minutos)

---

## 🧪 **PASSO 9: TESTAR TUDO! (5 minutos)**

### Teste 1: Email de Verificação
1. Acesse: https://jurislink-sigma.vercel.app/auth/cadastro
2. Crie uma conta com um email novo
3. Aguarde 30 segundos
4. **Verifique sua caixa de entrada e SPAM**
5. Email deve chegar! ✅

### Teste 2: Google OAuth
1. Acesse: https://jurislink-sigma.vercel.app/auth/login
2. Clique em **"Continuar com Google"**
3. Escolha sua conta
4. Deve fazer login com sucesso! ✅

---

## 📋 **CHECKLIST - Marque conforme fizer:**

### Resend:
- [ ] Conta criada
- [ ] API Key copiada
- [ ] `RESEND_API_KEY` adicionada no Vercel

### Supabase SMTP:
- [ ] Custom SMTP habilitado
- [ ] Host: `smtp.resend.com`
- [ ] Credentials do Resend configuradas
- [ ] Callback URL copiada

### Google Cloud:
- [ ] OAuth Consent Screen configurado
- [ ] Scopes adicionados
- [ ] Redirect URI adicionada
- [ ] Client ID e Secret copiados

### Supabase OAuth:
- [ ] Google provider habilitado
- [ ] Client ID e Secret colados
- [ ] Saved

### Deploy:
- [ ] `npm install` executado
- [ ] Código commitado e pushed
- [ ] Vercel fez redeploy

### Testes:
- [ ] Email de verificação chega
- [ ] Login com Google funciona

---

## 🎯 **TEMPO TOTAL: ~30 minutos**

Siga **na ordem** e não pule nenhum passo!

---

## 🐛 **Se algo não funcionar:**

1. Verifique os logs do Vercel
2. Verifique os logs do Supabase (Dashboard → Logs → Auth)
3. Abra o console do navegador (F12) e veja os erros
4. Me avise qual erro específico apareceu!

---

## ✅ **Após completar TUDO:**

- ✅ Emails chegam em segundos
- ✅ Google OAuth funciona perfeitamente
- ✅ Nome "JurisLink" aparece no login do Google
- ✅ Tudo funcionando! 🎉
