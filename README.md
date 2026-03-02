# 🏛️ JurisLink - Plataforma SaaS de Conexão Jurídica

JurisLink é uma plataforma marketplace que conecta clientes a advogados no Brasil, permitindo busca por área jurídica e localização, com sistema de avaliação, assinatura paga e boost de relevância.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-Payments-blue)

## 🎯 Objetivo do Produto

Marketplace jurídico onde:

- ✅ Advogados pagam assinatura mensal para aparecer nas buscas
- ✅ Clientes se cadastram gratuitamente
- ✅ Busca por área jurídica, estado e cidade
- ✅ Sistema de avaliações (1-5 estrelas + comentário)
- ✅ Ranking baseado em reputação + plano ativo + boost pago
- ⚖️ **A plataforma NÃO presta serviços jurídicos — apenas conecta partes**

## 🏗️ Stack Tecnológica

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **React Hook Form + Zod**
- **Shadcn/ui Components**

### Backend
- **Next.js API Routes**
- **Supabase** (PostgreSQL + Auth)
- **Prisma ORM** (opcional)
- **Redis** (Upstash - cache + rate limiting)
- **JWT** (Access + Refresh tokens)

### Pagamentos
- **Mercado Pago** (Assinatura + Boost)
- Modo Sandbox habilitado

### Infraestrutura
- **Vercel Blob** (Upload de imagens)
- **Docker** (Containerização)
- **GitHub Actions** (CI/CD)

## 📦 Estrutura do Projeto

```
juris-link-saas-platform/
├── app/
│   ├── (public)/          # Rotas públicas
│   │   ├── page.tsx       # Homepage
│   │   ├── buscar/        # Busca de advogados
│   │   ├── advogado/[slug]/  # Perfil público do advogado
│   │   ├── termos/        # Termos de uso
│   │   └── privacidade/   # Política de privacidade
│   ├── auth/              # Autenticação
│   │   ├── login/
│   │   ├── cadastro/
│   │   └── callback/
│   ├── painel/            # Dashboards
│   │   ├── cliente/
│   │   ├── advogado/
│   │   └── admin/
│   ├── api/               # API Routes
│   │   ├── lawyers/
│   │   ├── reviews/
│   │   ├── contacts/
│   │   ├── favorites/
│   │   ├── payments/
│   │   └── upload/
│   ├── sitemap.ts         # Sitemap dinâmico
│   └── robots.ts          # Robots.txt
├── components/            # Componentes React
│   ├── ui/               # Shadcn components
│   ├── hero-search.tsx
│   ├── lawyer-card.tsx
│   └── star-rating.tsx
├── lib/
│   ├── supabase/         # Cliente Supabase
│   ├── mercadopago/      # Cliente Mercado Pago
│   ├── redis.ts          # Cliente Redis
│   ├── rate-limit.ts     # Rate limiting
│   ├── security.ts       # Funções de segurança
│   ├── types.ts          # Tipos TypeScript
│   └── utils.ts          # Utilitários
├── scripts/              # Scripts SQL
│   ├── 001_create_tables.sql
│   ├── 002_triggers_and_functions.sql
│   ├── 003_seed_legal_areas.sql
│   ├── 004_indexes.sql
│   └── 005_schema_updates.sql
├── .env.example          # Exemplo de variáveis
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 20+
- pnpm (recomendado) ou npm
- Conta Supabase
- Conta Upstash Redis
- Conta Mercado Pago (sandbox)
- Conta Vercel (para Blob Storage)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/juris-link-saas-platform.git
cd juris-link-saas-platform
```

### 2. Instale as dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Upstash Redis
KV_REST_API_URL=https://seu-redis.upstash.io
KV_REST_API_TOKEN=seu-redis-token

# Mercado Pago (Sandbox)
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key
MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token
MERCADO_PAGO_WEBHOOK_SECRET=seu-webhook-secret
MERCADO_PAGO_SANDBOX=true

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

# Vercel Blob
BLOB_READ_WRITE_TOKEN=seu-blob-token

# Security
JWT_SECRET=seu-jwt-secret-super-seguro
ENCRYPTION_KEY=sua-chave-32-caracteres-aqui!
```

### 4. Configure o banco de dados

Execute os scripts SQL no Supabase na ordem:

1. Acesse o SQL Editor no painel do Supabase
2. Execute cada script da pasta `scripts/` em ordem:
   - `001_create_tables.sql`
   - `002_triggers_and_functions.sql`
   - `003_seed_legal_areas.sql`
   - `004_indexes.sql`
   - `005_schema_updates.sql`

### 5. Execute o projeto

```bash
pnpm dev
# ou
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Desenvolvimento

```bash
docker-compose -f docker-compose.dev.yml up
```

### Produção

```bash
docker-compose up --build
```

## 📊 Banco de Dados

### Principais Tabelas

- **profiles** - Usuários (clientes, advogados, admin)
- **lawyer_profiles** - Perfis estendidos de advogados
- **legal_areas** - Áreas jurídicas
- **lawyer_legal_areas** - Relação N:N entre advogados e áreas
- **reviews** - Avaliações de clientes
- **favorites** - Advogados favoritos dos clientes
- **contacts** - Leads/mensagens para advogados
- **payments** - Registro de pagamentos

### Relacionamentos

```
users (Supabase Auth)
  └── profiles (1:1)
       └── lawyer_profiles (1:1 se LAWYER)
            ├── lawyer_legal_areas (1:N)
            │    └── legal_areas (N:1)
            ├── reviews (1:N)
            ├── contacts (1:N)
            ├── favorites (1:N)
            └── payments (1:N)
```

## 🔒 Segurança

### Implementado

✅ Autenticação JWT (Supabase Auth)  
✅ Row Level Security (RLS) no PostgreSQL  
✅ Rate limiting com Redis  
✅ Proteção XSS (sanitização de inputs)  
✅ Proteção CSRF (tokens)  
✅ Helmet (headers de segurança)  
✅ CORS restritivo  
✅ Criptografia de emails (AES-256)  
✅ Hash de senhas (bcrypt via Supabase)  
✅ Upload seguro (validação tipo + tamanho)  
✅ Logs de auditoria  
✅ Filtro de palavras ofensivas  

## 🔎 Sistema de Busca

### Filtros
- Área jurídica
- Estado
- Cidade (opcional)
- Avaliação mínima
- Atendimento online

### Ordenação
- Melhor avaliados
- Mais relevantes (com boost)
- Mais recentes

### Ranking

```
score = (rating_avg × log(rating_count + 1)) × subscription_weight × boost_weight
```

- Cache Redis para buscas populares
- Paginação obrigatória

## ⭐ Sistema de Avaliações

- Apenas clientes autenticados
- Uma avaliação por cliente/advogado
- Nota de 1 a 5 estrelas
- Comentário obrigatório (mínimo 10 caracteres)
- Filtro de palavras ofensivas
- Botão "Denunciar"
- Advogado pode responder
- Média recalculada automaticamente

## 💳 Monetização

### Plano Premium (R$ 99,90/mês)
- Obrigatório para aparecer nas buscas
- Integração Mercado Pago (recorrente)
- Webhook para validar pagamento
- Suspensão automática se inadimplente

### Boost (R$ 99,00 por 30 dias)
- Add-on para aumentar posição nas buscas
- Pagamento único
- Válido por 30 dias
- Destaque visual nos resultados

## 🌍 SEO

✅ SSR nas páginas públicas  
✅ URLs amigáveis (`/advogado/nome-slug`)  
✅ Sitemap.xml dinâmico  
✅ Robots.txt  
✅ Open Graph tags  
✅ Meta tags dinâmicas  
✅ JSON-LD (schema LegalService)  
✅ Páginas indexáveis por advogado  

## 📜 LGPD

✅ Página de Termos de Uso  
✅ Política de Privacidade  
✅ Checkbox obrigatório no cadastro  
✅ Botão "Excluir conta"  
✅ Criptografia de emails  
✅ Logs de auditoria  
✅ Direitos do titular claramente descritos  

## 🎨 UI/UX

- Design moderno e clean
- Mobile-first responsivo
- Cards de advogados com:
  - Foto de perfil
  - Nome e OAB
  - Área de atuação
  - Nota média
  - Localização
  - Botão "Ver Perfil"
- Indicação visual de boost ativo
- Badge "OAB Verificada"

## 📱 Funcionalidades por Tipo de Usuário

### Cliente
- ✅ Cadastro gratuito
- ✅ Buscar advogados
- ✅ Ver perfis públicos
- ✅ Avaliar advogados
- ✅ Favoritar advogados
- ✅ Enviar mensagens
- ✅ Denunciar avaliações

### Advogado
- ✅ Cadastro gratuito
- ✅ Completar perfil profissional
- ✅ Escolher áreas de atuação
- ✅ Receber leads
- ✅ Responder avaliações
- ✅ Visualizar estatísticas
- ✅ Assinar plano Premium
- ✅ Ativar boost

### Admin
- ✅ Aprovar/rejeitar advogados
- ✅ Verificar OAB
- ✅ Moderar avaliações denunciadas
- ✅ Ocultar avaliações
- ✅ Suspender contas
- ✅ Visualizar pagamentos
- ✅ Acessar logs

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Conecte no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

### Outros Provedores

Use Docker:

```bash
docker build -t jurislink .
docker run -p 3000:3000 --env-file .env jurislink
```

## 🧪 Scripts Úteis

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Rodar build local
pnpm start

# Lint
pnpm lint

# Type check
pnpm tsc --noEmit
```

## 📝 TODO / Melhorias Futuras

- [ ] Sistema de mensagens em tempo real (WebSocket)
- [ ] Chat direto entre cliente e advogado
- [ ] Vídeo chamadas integradas
- [ ] Sistema de agendamento
- [ ] Integração com calendário
- [ ] Notificações push
- [ ] App mobile (React Native)
- [ ] Dashboard analytics avançado
- [ ] Multi-idioma (i18n)
- [ ] Testes automatizados (Jest + Playwright)
- [ ] Verificação OAB automática via API

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

**JurisLink**  
Email: contato@jurislink.com.br  
Website: https://jurislink.com.br

---

⚖️ **Aviso Legal:** A JurisLink não presta serviços jurídicos. Esta plataforma apenas conecta clientes a advogados independentes.

Desenvolvido com ❤️ usando Next.js e TypeScript
