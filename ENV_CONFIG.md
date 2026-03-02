# 🔐 Configuração de Variáveis de Ambiente

## 📋 Variáveis OBRIGATÓRIAS

### 1. Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```
**Onde obter**: https://supabase.com/dashboard → Project Settings → API

---

### 2. URL da Aplicação
```bash
# Desenvolvimento
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Produção
NEXT_PUBLIC_APP_URL=https://jurislink-sigma.vercel.app
```

---

### 3. Segurança (JWT e Criptografia)
```bash
JWT_SECRET=sua-chave-secreta-jwt-256-bits-aqui
ENCRYPTION_KEY=sua-chave-aes-256-aqui
```
**Como gerar**: 
```bash
npm run generate-keys
```

---

### 4. Resend (Envio de Emails) ⭐ NOVO!
```bash
RESEND_API_KEY=re_sua_chave_aqui
```
**Onde obter**: 
1. Crie conta em https://resend.com
2. Vá em https://resend.com/api-keys
3. Clique em "Create API Key"
4. Copie a chave gerada

⚠️ **SEM ISSO, EMAILS NÃO SERÃO ENVIADOS!**

---

## 📋 Variáveis OPCIONAIS

### 5. Redis (Cache e Rate Limiting)
```bash
REDIS_URL=redis://default:senha@host:porta
```
**Onde obter**: https://console.upstash.com

---

### 6. Mercado Pago (Pagamentos)
```bash
MERCADOPAGO_PUBLIC_KEY=sua-chave-publica
MERCADOPAGO_ACCESS_TOKEN=seu-token-de-acesso
```
**Onde obter**: https://www.mercadopago.com.br/developers

---

### 7. Vercel Blob (Upload de Imagens)
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_seu_token
```
**Onde obter**: Gerado automaticamente no Vercel ao ativar Blob Storage

---

## 🚀 Como Configurar

### Local (Desenvolvimento)
1. Copie o arquivo `.env.example.complete` para `.env.local`
2. Preencha as variáveis OBRIGATÓRIAS
3. Rode: `npm run dev`

### Vercel (Produção)
1. Vá em **Settings** → **Environment Variables**
2. Adicione TODAS as variáveis acima
3. Clique em **Save**
4. Faça **Redeploy**

---

## ✅ Checklist Final

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] `NEXT_PUBLIC_APP_URL` configurado
- [ ] `JWT_SECRET` gerado
- [ ] `ENCRYPTION_KEY` gerado
- [ ] `RESEND_API_KEY` configurado ⭐
- [ ] Google OAuth habilitado no Supabase
- [ ] SMTP do Resend configurado no Supabase

---

## 🐛 Problemas Comuns

### "Failed to fetch" no cadastro
**Causa**: Variáveis do Supabase não configuradas  
**Solução**: Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Emails não chegam
**Causa**: `RESEND_API_KEY` não configurado ou SMTP não habilitado no Supabase  
**Solução**: Configure ambos seguindo `CONFIGURAR_GOOGLE_RESEND.md`

### Google OAuth não funciona
**Causa**: Provider não habilitado no Supabase  
**Solução**: Siga o guia `CONFIGURAR_GOOGLE_RESEND.md`

---

## 📚 Guias Relacionados

- **CONFIGURAR_GOOGLE_RESEND.md**: Como configurar Google OAuth e Resend
- **CONFIGURAR_VERCEL.md**: Checklist completo para deploy no Vercel
- **VERIFICAR_EMAIL.md**: Troubleshooting de emails
