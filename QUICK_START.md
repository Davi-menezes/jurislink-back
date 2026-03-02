# 🚀 GUIA RÁPIDO - Configurar e Rodar o Projeto

## ⚠️ ERRO: "Your project's URL and Key are required"

Esse erro significa que você precisa configurar as variáveis de ambiente!

---

## ✅ SOLUÇÃO (5 minutos):

### **Passo 1: Criar Conta no Supabase (GRÁTIS)**

1. Acesse: [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Crie uma conta (GitHub ou Email)
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: jurislink
   - **Database Password**: (gere uma senha forte)
   - **Region**: South America (São Paulo)
   - **Plan**: Free
6. Clique em **"Create new project"**
7. Aguarde 2 minutos (criação do projeto)

### **Passo 2: Copiar Credenciais do Supabase**

1. No dashboard, vá em **Settings** (canto inferior esquerdo)
2. Clique em **API**
3. Copie:
   - **URL**: (algo como `https://xxxxx.supabase.co`)
   - **anon public**: (chave longa começando com `eyJ...`)
   - **service_role**: (clique em "Reveal" e copie)

### **Passo 3: Configurar .env.local**

Já criei o arquivo `.env.local` para você!

Agora edite-o:

```bash
nano .env.local
```

**Substitua:**

```env
# Cole as credenciais do Supabase aqui:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Por enquanto, deixe o resto como está
# Você pode configurar Redis e Mercado Pago depois
```

**Salve**: `Ctrl + O` → `Enter` → `Ctrl + X`

### **Passo 4: Executar Scripts SQL no Supabase**

1. No Supabase, vá em **SQL Editor** (ícone de código)
2. Clique em **"New query"**
3. Execute os scripts **EM ORDEM**:

**Script 1:** `scripts/001_create_tables.sql`
```bash
# Copie o conteúdo do arquivo e cole no SQL Editor
cat scripts/001_create_tables.sql
```

**Script 2:** `scripts/002_triggers_and_functions.sql`

**Script 3:** `scripts/003_seed_legal_areas.sql`

**Script 4:** `scripts/004_indexes.sql`

**Script 5:** `scripts/005_schema_updates.sql`

### **Passo 5: Gerar Chaves de Segurança**

```bash
node scripts/generate-keys.js
```

Copie o output e cole no `.env.local`

### **Passo 6: Reiniciar o Servidor**

```bash
# Pare o servidor (Ctrl + C no terminal)
# Rode novamente:
npm run dev
```

---

## 🎉 PRONTO!

Acesse: **http://localhost:3002**

O site deve carregar sem erros! 🚀

---

## 📋 CONFIGURAÇÃO MÍNIMA (Apenas Supabase):

Para testar rapidamente, você só precisa:

✅ **Supabase** (URL + Keys)  
⚠️ Redis - pode comentar no código por enquanto  
⚠️ Mercado Pago - só precisa para pagamentos  
⚠️ Vercel Blob - só precisa para upload de fotos  

---

## 🆘 AINDA COM ERRO?

### Opção 1: Desabilitar temporariamente o middleware

```bash
# Renomeie o middleware:
mv middleware.ts middleware.ts.bak

# Rode o projeto
npm run dev
```

### Opção 2: Use variáveis fake para testar a UI

No `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fake.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake
```

(Não vai funcionar de verdade, mas carrega a UI)

---

## 📞 PRECISA DE AJUDA?

Me avise qual passo está com dificuldade! 😊

**Próximos passos:**
1. Configure Supabase ← **VOCÊ ESTÁ AQUI**
2. Execute scripts SQL
3. Configure Redis (opcional)
4. Configure Mercado Pago (opcional)
5. Deploy na Vercel
