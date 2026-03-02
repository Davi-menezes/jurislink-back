# 🚀 Guia Completo de Deploy - JurisLink

Este guia explica como fazer deploy do JurisLink em diferentes plataformas.

## 📦 Arquitetura do Projeto

O JurisLink é um **monorepo fullstack** usando Next.js:
- **Frontend**: Páginas React (SSR)
- **Backend**: API Routes do Next.js (`/app/api/*`)
- **Tudo junto**: Deploy único, mesmo domínio

```
https://seu-dominio.com/          → Frontend (React)
https://seu-dominio.com/api/*     → Backend (API Routes)
```

---

## 🟢 Opção 1: Vercel (RECOMENDADO)

### Por que Vercel?
- ✅ Otimizado para Next.js (mesma empresa)
- ✅ Deploy automático no git push
- ✅ HTTPS gratuito
- ✅ Edge Network global
- ✅ Vercel Blob integrado
- ✅ Preview deployments automáticos
- ✅ 100% gratuito para hobby projects

### Passo a Passo

#### 1. Prepare o Repositório

```bash
# Se ainda não tem git
git init
git add .
git commit -m "Initial commit"

# Crie um repositório no GitHub e faça push
git remote add origin https://github.com/seu-usuario/jurislink.git
git branch -M main
git push -u origin main
```

#### 2. Deploy via Interface Web

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em "Import Git Repository"
3. Selecione seu repositório
4. A Vercel detecta automaticamente que é Next.js
5. Configure as variáveis de ambiente (veja seção abaixo)
6. Clique em **Deploy**

#### 3. Configure Variáveis de Ambiente

No painel da Vercel, vá em **Settings** → **Environment Variables** e adicione:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Upstash Redis
KV_REST_API_URL=https://seu-redis.upstash.io
KV_REST_API_TOKEN=seu-redis-token

# Mercado Pago (use TEST para sandbox, ou real para produção)
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token
MERCADO_PAGO_WEBHOOK_SECRET=seu-webhook-secret
MERCADO_PAGO_SANDBOX=true

# App (use o domínio da Vercel)
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app

# Vercel Blob (gerado automaticamente pela Vercel)
# Vá em Storage → Create → Blob → Copie o token
BLOB_READ_WRITE_TOKEN=seu-blob-token

# Security (GERE CHAVES FORTES!)
JWT_SECRET=seu-jwt-secret-super-seguro-minimo-32-chars
ENCRYPTION_KEY=sua-chave-de-32-caracteres-exatos!

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
SMTP_FROM=noreply@jurislink.com.br
```

#### 4. Configurar Vercel Blob Storage

1. No painel do projeto, vá em **Storage**
2. Clique em **Create Database** → **Blob**
3. Copie o `BLOB_READ_WRITE_TOKEN`
4. Adicione às variáveis de ambiente

#### 5. Deploy Automático

Agora, todo `git push` para a branch `main` faz deploy automático!

```bash
git add .
git commit -m "Update feature"
git push
# 🚀 Deploy automático!
```

#### 6. Configurar Domínio Customizado (Opcional)

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Atualize `NEXT_PUBLIC_APP_URL`

---

## 🔵 Opção 2: Render

### Por que Render?
- ✅ Plano gratuito disponível
- ✅ Suporta Docker
- ✅ PostgreSQL e Redis inclusos (pago)
- ⚠️ Mais complexo que Vercel
- ⚠️ Sem Vercel Blob (precisa AWS S3 ou alternativa)

### Passo a Passo

#### 1. Preparar Projeto

O arquivo `render-blueprint.yaml` já foi criado na raiz do projeto.

#### 2. Deploy via Interface Web

1. Acesse [render.com](https://render.com)
2. Clique em **New** → **Web Service**
3. Conecte seu repositório GitHub/GitLab
4. Configure:
   - **Name**: jurislink
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Free (ou pago)

#### 3. Configurar Variáveis de Ambiente

No painel do Render, vá em **Environment** e adicione todas as variáveis:

```env
NODE_VERSION=20.11.0
NODE_ENV=production

# Adicione todas as mesmas variáveis da Vercel
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# ... etc
```

⚠️ **IMPORTANTE**: No Render, você precisa usar **AWS S3** ou **Cloudinary** ao invés do Vercel Blob para upload de imagens.

#### 4. Configurar Upload (Alternativa ao Vercel Blob)

Como o Render não tem Blob Storage integrado, você tem 3 opções:

**Opção A: AWS S3**
```bash
npm install @aws-sdk/client-s3
```

**Opção B: Cloudinary**
```bash
npm install cloudinary
```

**Opção C: Supabase Storage**
```bash
# Já tem Supabase, pode usar o Storage deles!
# Edite: app/api/upload/avatar/route.ts
```

#### 5. Deploy

```bash
git add .
git commit -m "Configure for Render"
git push
# Deploy automático no Render
```

---

## 🐳 Opção 3: Deploy com Docker (Qualquer VPS)

Use isso para **DigitalOcean, AWS EC2, Google Cloud, Hetzner**, etc.

### Passo a Passo

#### 1. Servidor (Exemplo: Ubuntu 22.04)

```bash
# Conectar ao servidor
ssh root@seu-servidor.com

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
apt install docker-compose-plugin

# Clonar projeto
git clone https://github.com/seu-usuario/jurislink.git
cd jurislink
```

#### 2. Configurar Variáveis

```bash
# Criar .env
cp .env.example .env
nano .env
# Cole todas as variáveis
```

#### 3. Build e Deploy

```bash
# Build da imagem
docker-compose build

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

#### 4. Configurar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
apt install nginx

# Criar configuração
nano /etc/nginx/sites-available/jurislink
```

Cole:
```nginx
server {
    listen 80;
    server_name jurislink.com.br www.jurislink.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/jurislink /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Instalar SSL
apt install certbot python3-certbot-nginx
certbot --nginx -d jurislink.com.br -d www.jurislink.com.br
```

---

## 📊 Comparação de Plataformas

| Feature | Vercel | Render | Docker VPS |
|---------|--------|--------|------------|
| **Dificuldade** | ⭐ Fácil | ⭐⭐ Médio | ⭐⭐⭐ Difícil |
| **Custo (hobby)** | Grátis | Grátis* | $5-20/mês |
| **Perfeito para Next.js** | ✅ Sim | ⚠️ Ok | ⚠️ Manual |
| **Deploy automático** | ✅ Sim | ✅ Sim | ❌ Não |
| **HTTPS automático** | ✅ Sim | ✅ Sim | ⚠️ Manual |
| **Edge Network** | ✅ Sim | ❌ Não | ❌ Não |
| **Blob Storage** | ✅ Integrado | ❌ Não | ⚠️ S3/Cloudinary |
| **Controle total** | ❌ Não | ⚠️ Parcial | ✅ Sim |

*Render free tem limitações (sleep após inatividade)

---

## ✅ Recomendação Final

### Para Desenvolvimento/MVP:
**→ Use Vercel** (mais rápido e fácil)

### Para Produção com Budget:
**→ Use Vercel** (confiável e escalável)

### Para Controle Total:
**→ Use Docker em VPS** (mais flexível)

---

## 🆘 Troubleshooting

### Erro: "Module not found"
```bash
# Deletar node_modules e reinstalar
rm -rf node_modules .next
pnpm install
pnpm build
```

### Erro: "Environment variables not defined"
- Verifique se todas as vars estão configuradas
- Reinicie o deploy após adicionar vars

### Erro no build: "Type error"
- O projeto tem `typescript.ignoreBuildErrors: true`
- Mas é bom corrigir os erros antes de produção

### Upload não funciona no Render
- Use AWS S3 ou Cloudinary
- Ou use Supabase Storage
- Atualize `app/api/upload/avatar/route.ts`

---

## 📞 Suporte

Dúvidas sobre deploy?
- Email: dev@jurislink.com.br
- Documentação: Ver `DEPLOYMENT.md`
- Issues: GitHub

---

**Próximo passo**: Escolha a plataforma e comece o deploy! 🚀
