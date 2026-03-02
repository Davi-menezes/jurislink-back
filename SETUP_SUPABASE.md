# ⚠️ ERRO: "seu-projeto.supabase.co" não existe

Esse erro acontece porque você está usando URLs de exemplo no `.env.local`.

## 🔧 SOLUÇÃO RÁPIDA (5 minutos):

### **1. Criar Projeto no Supabase (GRÁTIS)**

👉 Acesse: [supabase.com](https://supabase.com)

1. Clique em **"Start your project"**
2. Faça login com GitHub ou Email
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: `jurislink`
   - **Database Password**: (gere uma senha forte - guarde-a!)
   - **Region**: `South America (São Paulo)`
   - **Plan**: `Free` (grátis para sempre)
5. Clique em **"Create new project"**
6. ⏳ Aguarde 2-3 minutos (criação do banco de dados)

### **2. Copiar Credenciais**

Quando o projeto estiver pronto:

1. Vá em **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API**
3. Você verá:

```
Project URL: https://abcdefg123456.supabase.co
```

E mais abaixo:

```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (clique em "Reveal")
```

### **3. Atualizar .env.local**

Edite o arquivo:

```bash
nano .env.local
```

**Substitua** essas 3 linhas:

```env
# ANTES (exemplo):
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# DEPOIS (suas credenciais reais):
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg123456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJl...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJl...
```

**Salve**: `Ctrl + O` → `Enter` → `Ctrl + X`

### **4. Executar Scripts SQL**

No Supabase Dashboard:

1. Vá em **SQL Editor** (ícone `</>` no menu)
2. Clique em **"New query"**
3. Cole o conteúdo de cada script **EM ORDEM**:

```bash
# Script 1
cat scripts/001_create_tables.sql
# Copie tudo, cole no SQL Editor, clique em "Run"

# Script 2
cat scripts/002_triggers_and_functions.sql
# Copie, cole, Run

# Script 3
cat scripts/003_seed_legal_areas.sql
# Copie, cole, Run

# Script 4
cat scripts/004_indexes.sql
# Copie, cole, Run

# Script 5
cat scripts/005_schema_updates.sql
# Copie, cole, Run
```

### **5. Reiniciar Servidor**

```bash
# Parar (Ctrl + C no terminal)
# Rodar novamente:
npm run dev
```

### **6. Acessar**

Abra: **http://localhost:3002**

✅ **Pronto! Tudo funcionando!** 🎉

---

## 🎯 CHECKLIST

- [ ] Criar projeto no Supabase
- [ ] Copiar URL e Keys
- [ ] Colar no .env.local
- [ ] Executar 5 scripts SQL
- [ ] Reiniciar servidor
- [ ] Testar cadastro

---

## 💡 DICA

Se quiser testar apenas a UI **SEM** configurar Supabase agora:

```bash
# Renomear middleware temporariamente
mv middleware.ts middleware.ts.disabled

# Rodar
npm run dev
```

Isso desabilita autenticação e você pode ver o design funcionando!

(Mas para criar conta de verdade, precisa do Supabase configurado)

---

## 🆘 AINDA COM DÚVIDAS?

Me avise em qual passo você está travado! 😊
