# Guia de Deployment - JurisLink

Este guia fornece instruções detalhadas para fazer o deploy do JurisLink em diferentes ambientes.

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. Conta no Supabase (PostgreSQL + Auth)
2. Conta no Upstash (Redis)
3. Conta no Mercado Pago (Sandbox ou Produção)
4. Conta no Vercel (Blob Storage + Deploy)
5. Domínio próprio (opcional, mas recomendado)

## 🚀 Deploy na Vercel (Recomendado)

### 1. Preparar o Repositório

```bash
# Certifique-se de que está no diretório do projeto
cd juris-link-saas-platform

# Inicialize o git se ainda não fez
git init
git add .
git commit -m "Initial commit"

# Faça push para o GitHub
git remote add origin https://github.com/seu-usuario/jurislink.git
git push -u origin main
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute os scripts SQL na ordem:
   - `scripts/001_create_tables.sql`
   - `scripts/002_triggers_and_functions.sql`
   - `scripts/003_seed_legal_areas.sql`
   - `scripts/004_indexes.sql`
   - `scripts/005_schema_updates.sql`
4. Configure a autenticação:
   - Habilite Email authentication
   - Configure redirect URLs
5. Copie as credenciais:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar Upstash Redis

1. Acesse [upstash.com](https://upstash.com)
2. Crie um novo database Redis
3. Copie as credenciais:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 4. Configurar Mercado Pago

1. Acesse [developers.mercadopago.com.br](https://developers.mercadopago.com.br)
2. Crie uma aplicação
3. Para testes, use as credenciais de teste:
   - `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` (TEST-...)
   - `MERCADO_PAGO_ACCESS_TOKEN` (TEST-...)
   - `MERCADO_PAGO_SANDBOX=true`
4. Configure o webhook URL: `https://seu-dominio.com/api/payments/webhook`

### 5. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Mercado Pago
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
MERCADO_PAGO_SANDBOX=true

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app

# Security
JWT_SECRET=gere-um-segredo-forte-aqui
ENCRYPTION_KEY=chave-de-32-caracteres-aqui!!
```

5. Clique em "Deploy"

### 6. Configurar Vercel Blob

1. No painel do projeto na Vercel
2. Vá em "Storage" → "Create Database" → "Blob"
3. Copie o token:
   - `BLOB_READ_WRITE_TOKEN`
4. Adicione às variáveis de ambiente

### 7. Configurar Domínio Customizado (Opcional)

1. Na Vercel, vá em "Settings" → "Domains"
2. Adicione seu domínio
3. Configure os DNS conforme instruções
4. Atualize a variável `NEXT_PUBLIC_APP_URL`

## 🐳 Deploy com Docker

### Docker Compose (Produção)

```bash
# Build e iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Docker em Servidor VPS

```bash
# 1. Conectar no servidor
ssh usuario@seu-servidor.com

# 2. Instalar Docker
curl -fsSL https://get.docker.com | sh

# 3. Clonar repositório
git clone https://github.com/seu-usuario/jurislink.git
cd jurislink

# 4. Configurar .env
cp .env.example .env
nano .env  # Editar com suas credenciais

# 5. Build e rodar
docker-compose up -d --build

# 6. Configurar Nginx (reverse proxy)
sudo apt install nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/jurislink
```

Exemplo de configuração Nginx:

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
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/jurislink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Instalar SSL com Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d jurislink.com.br -d www.jurislink.com.br
```

## 🔧 Configurações Pós-Deploy

### 1. Testar Webhooks do Mercado Pago

```bash
# Use ngrok para testes locais
ngrok http 3000

# Configure webhook URL no Mercado Pago
https://seu-ngrok-url.ngrok.io/api/payments/webhook
```

### 2. Configurar Email (Opcional)

Se quiser enviar emails transacionais:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
SMTP_FROM=noreply@jurislink.com.br
```

### 3. Configurar Backup do Banco

No Supabase:
1. Vá em "Settings" → "Database"
2. Configure backups automáticos
3. Considere Point-in-Time Recovery (PITR)

### 4. Monitoramento

Recomendações:
- **Sentry** - Tracking de erros
- **LogRocket** - Session replay
- **Google Analytics** - Análise de tráfego
- **Uptime Robot** - Monitoramento de uptime

## 🔒 Checklist de Segurança Pré-Produção

- [ ] Todas as variáveis de ambiente configuradas
- [ ] JWT_SECRET e ENCRYPTION_KEY fortes e únicos
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativado
- [ ] HTTPS habilitado
- [ ] Headers de segurança configurados
- [ ] Backups automáticos ativados
- [ ] Logs configurados
- [ ] Mercado Pago em modo produção (não sandbox)
- [ ] Políticas de privacidade e termos atualizados
- [ ] OAB sendo verificada manualmente

## 📊 Monitoramento de Performance

### Métricas Importantes

1. **Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

2. **API Response Times**
   - P95 < 500ms
   - P99 < 1s

3. **Cache Hit Rate**
   - Redis > 80%

### Ferramentas

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Bundle analyzer
npm run build
npm run analyze
```

## 🆘 Troubleshooting

### Problema: Build falha na Vercel

**Solução:**
```bash
# Teste o build localmente primeiro
pnpm build

# Verifique erros de TypeScript
pnpm tsc --noEmit
```

### Problema: Webhook não recebe notificações

**Solução:**
1. Verifique se a URL está acessível publicamente
2. Teste com ngrok localmente
3. Verifique logs da API: `/api/payments/webhook`

### Problema: Redis connection timeout

**Solução:**
- Verifique credenciais do Upstash
- Certifique-se que o IP está na whitelist (se aplicável)
- Use `try/catch` e fail-open no rate limiting

### Problema: Upload de imagens não funciona

**Solução:**
1. Verifique token do Vercel Blob
2. Confirme que `@vercel/blob` está instalado
3. Verifique limites de tamanho (5MB default)

## 📚 Recursos Adicionais

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Mercado Pago Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)

## 🎉 Parabéns!

Seu JurisLink está no ar! 🚀

Próximos passos:
1. Crie conta de admin no sistema
2. Cadastre alguns advogados de teste
3. Teste fluxo completo de pagamento
4. Configure monitoramento
5. Promova sua plataforma!
