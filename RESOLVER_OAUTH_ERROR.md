# 🔧 RESOLVER: Erro "requested path is invalid" no Google OAuth

## ❌ Erro
Após clicar em "Continuar com Google" e escolher uma conta, aparece:
```json
{
  "error": "requested path is invalid"
}
```

## 🔍 Causa
A **Redirect URI** não está configurada corretamente no Google Cloud Console.

---

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ Descobrir a Redirect URI Correta do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **"Authentication"** → **"Providers"**
4. Clique em **"Google"** para expandir
5. Copie a **"Callback URL (for OAuth)"**

Ela será algo como:
```
https://cmaoupgrltfusqucnqbw.supabase.co/auth/v1/callback
```

⚠️ **COPIE EXATAMENTE COMO ESTÁ!**

---

### 2️⃣ Adicionar no Google Cloud Console

1. Vá em: https://console.cloud.google.com
2. Selecione seu projeto
3. **"APIs & Services"** → **"Credentials"**
4. Clique no seu **OAuth 2.0 Client ID** (o que você criou)
5. Role até **"Authorized redirect URIs"**
6. Clique em **"+ ADD URI"**
7. Cole a URL do Supabase:
   ```
   https://cmaoupgrltfusqucnqbw.supabase.co/auth/v1/callback
   ```
8. Clique em **"SAVE"**

---

### 3️⃣ Adicionar TAMBÉM a URL do Vercel (opcional, mas recomendado)

Adicione também a URL do seu site:
```
https://jurislink-sigma.vercel.app/auth/callback
```

**Total de URIs que você deve ter:**
```
✅ https://cmaoupgrltfusqucnqbw.supabase.co/auth/v1/callback
✅ https://jurislink-sigma.vercel.app/auth/callback
```

---

### 4️⃣ Verificar Variável de Ambiente

Certifique-se de que está configurado no Vercel:
```
NEXT_PUBLIC_APP_URL=https://jurislink-sigma.vercel.app
```

---

### 5️⃣ Aguardar Propagação (1-2 minutos)

As mudanças no Google Cloud podem demorar alguns minutos para propagar.

Aguarde **2 minutos** e teste novamente.

---

## 🧪 Teste Final

1. Acesse: https://jurislink-sigma.vercel.app/auth/login
2. Clique em **"Continuar com Google"**
3. Escolha sua conta
4. Deve funcionar agora! ✅

---

## 🐛 Se AINDA não funcionar

### Verifique no Console do Navegador:

1. Abra o site
2. Abra DevTools (F12)
3. Vá na aba **"Network"**
4. Clique em "Continuar com Google"
5. Procure pela requisição que deu erro
6. Veja qual é a **redirect_uri** que está sendo enviada

**A redirect_uri DEVE SER:**
```
https://cmaoupgrltfusqucnqbw.supabase.co/auth/v1/callback
```

Se estiver diferente, o problema está na configuração do Supabase ou do código.

---

## 📋 Checklist Final

- [ ] Copiei a Callback URL do Supabase
- [ ] Adicionei no Google Cloud Console (Authorized redirect URIs)
- [ ] Salvei no Google Cloud
- [ ] Aguardei 2 minutos
- [ ] `NEXT_PUBLIC_APP_URL` configurado no Vercel
- [ ] Testei novamente

---

## 💡 Dica Pro

Para ver TODOS os detalhes do erro:

1. Abra o console do navegador (F12)
2. Vá na aba **"Console"**
3. Tente logar novamente
4. Veja o erro completo que aparecer

Isso ajuda a identificar se o problema é:
- ❌ Redirect URI incorreta
- ❌ Client ID/Secret incorretos
- ❌ Provider não habilitado
- ❌ OAuth Consent Screen não configurado
