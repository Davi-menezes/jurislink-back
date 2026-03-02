# 🔧 SOLUÇÃO: Corrigir Nome e Logo no Login com Google

## ❌ Problema
Quando você clica em "Continuar com Google", aparece:
- Nome estranho: `cmaoupgrltfusqucnqbw.supabase.co`
- Logo genérica
- Parece suspeito para o usuário

## ✅ Solução: Configurar OAuth Consent Screen

### 1️⃣ Acessar Google Cloud Console

1. Vá em: https://console.cloud.google.com
2. Selecione seu projeto
3. No menu lateral, vá em **"APIs & Services"** → **"OAuth consent screen"**

---

### 2️⃣ Configurar a Tela de Consentimento

#### **User Type:**
- Selecione: **External**
- Clique em **"Create"**

#### **App Information:**
```
App name: JurisLink
User support email: seu-email@gmail.com (seu email)
App logo: [Upload o arquivo public/icon.svg convertido para PNG]
```

**Como converter SVG para PNG para o logo:**
1. Acesse: https://cloudconvert.com/svg-to-png
2. Faça upload de `public/icon.svg`
3. Baixe o PNG (mínimo 120x120px)
4. Faça upload no Google Cloud Console

#### **App Domain:**
```
Application home page: https://jurislink-sigma.vercel.app
Application privacy policy: https://jurislink-sigma.vercel.app/privacidade
Application terms of service: https://jurislink-sigma.vercel.app/termos
```

#### **Authorized domains:**
```
jurislink-sigma.vercel.app
supabase.co
```

#### **Developer contact information:**
```
Email: seu-email@gmail.com
```

---

### 3️⃣ Scopes (Permissões)

Clique em **"Add or Remove Scopes"** e adicione:

```
✅ .../auth/userinfo.email
✅ .../auth/userinfo.profile
✅ openid
```

Clique em **"Update"** e depois **"Save and Continue"**

---

### 4️⃣ Test Users (opcional)

Se o app estiver em modo de teste, adicione seu email como test user.

**Melhor**: Publique o app (veja passo 5)

---

### 5️⃣ Publicar o App (Recomendado)

1. Volte em **"OAuth consent screen"**
2. Clique em **"Publish App"**
3. Confirme

⚠️ **Nota**: Para produção, você precisará submeter para verificação do Google (pode demorar dias). Mas para testes, o modo "In Production" já funciona bem.

---

## ✅ Resultado Esperado

Após configurar, o login com Google mostrará:
- ✅ Nome: **JurisLink**
- ✅ Logo: Balança da justiça
- ✅ Descrição clara
- ✅ Link para privacidade e termos
