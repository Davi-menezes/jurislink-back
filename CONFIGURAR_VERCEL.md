# 🚀 CHECKLIST RÁPIDO: Configuração Vercel

## ⚠️ IMPORTANTE: Variáveis de Ambiente no Vercel

Para que o projeto funcione corretamente no **Vercel**, você precisa configurar as seguintes variáveis de ambiente:

### 1. **Acessar Configurações do Projeto no Vercel**

1. Acesse https://vercel.com
2. Selecione seu projeto **jurislink-sigma**
3. Vá em **Settings** → **Environment Variables**

### 2. **Adicionar Variáveis OBRIGATÓRIAS**

Adicione as seguintes variáveis (copie do seu `.env.local`):

```bash
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui

# URL da Aplicação (OBRIGATÓRIO)
NEXT_PUBLIC_APP_URL=https://jurislink-sigma.vercel.app

# Segurança (OBRIGATÓRIO)
JWT_SECRET=sua-chave-secreta-aqui
ENCRYPTION_KEY=sua-chave-de-criptografia-aqui
```

### 3. **Variáveis Opcionais (para funcionalidades completas)**

```bash
# Redis (para rate limiting e cache)
REDIS_URL=redis://usuario:senha@host:porta

# Mercado Pago (para pagamentos)
MERCADOPAGO_PUBLIC_KEY=sua-chave-publica
MERCADOPAGO_ACCESS_TOKEN=seu-token-de-acesso

# Upload de imagens (Vercel Blob)
BLOB_READ_WRITE_TOKEN=seu-token-vercel-blob
```

---

## 📋 Checklist de Verificação

### ✅ Antes de fazer o Deploy

- [ ] `.env.local` configurado localmente
- [ ] `npm run dev` funciona sem erros
- [ ] Emails de verificação estão chegando (localmente)
- [ ] Login com email e senha funciona
- [ ] Cadastro funciona

### ✅ Configuração no Vercel

- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] `NEXT_PUBLIC_APP_URL` aponta para `https://jurislink-sigma.vercel.app`
- [ ] Supabase configurado com a URL correta de callback

### ✅ Após o Deploy

- [ ] Site carrega sem erro 500
- [ ] Áreas do Direito aparecem na homepage
- [ ] Botão "Ver Planos" está visível
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Emails de verificação chegam com link correto

---

## 🔧 Como Configurar o NEXT_PUBLIC_APP_URL

1. No Vercel, adicione a variável:
   ```
   NEXT_PUBLIC_APP_URL=https://jurislink-sigma.vercel.app
   ```

2. **Redeploy** o projeto para aplicar as mudanças:
   - Vá em **Deployments**
   - Clique nos 3 pontos do último deploy
   - Clique em **Redeploy**

---

## 🐛 Problemas Comuns

### Erro: "Failed to fetch" no cadastro

**Causa**: `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` não configurados

**Solução**: Adicione as variáveis no Vercel e redeploy

---

### Erro: "Your project's URL and Key are required"

**Causa**: Variáveis de ambiente do Supabase ausentes

**Solução**: 
1. Copie do `.env.local` local
2. Cole no Vercel → Environment Variables
3. Redeploy

---

### Email de verificação aponta para localhost

**Causa**: `NEXT_PUBLIC_APP_URL` não configurado

**Solução**:
1. Adicione `NEXT_PUBLIC_APP_URL=https://jurislink-sigma.vercel.app` no Vercel
2. Redeploy
3. ⚠️ **IMPORTANTE**: Configure também no Supabase:
   - Dashboard → Authentication → Email Templates
   - Substitua `{{ .SiteURL }}` por `{{ .ConfirmationURL }}`

---

### Google OAuth não funciona

**Causa**: Provider não habilitado no Supabase

**Solução**: Veja o arquivo `VERIFICAR_EMAIL.md` para instruções completas

---

## 🎯 Resumo Rápido

1. ✅ Configure variáveis de ambiente no Vercel
2. ✅ Adicione `NEXT_PUBLIC_APP_URL=https://jurislink-sigma.vercel.app`
3. ✅ Configure Supabase Email Templates
4. ✅ Habilite Google OAuth no Supabase (opcional)
5. ✅ Faça redeploy no Vercel

---

## 📞 Precisa de Ajuda?

Se ainda estiver com problemas:

1. Verifique os **Logs do Vercel**:
   - Dashboard → Deployments → [seu deploy] → Logs

2. Verifique os **Logs do Supabase**:
   - Dashboard → Logs → Auth

3. Me avise qual erro específico está aparecendo!
