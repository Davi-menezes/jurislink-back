# Guia de Contribuição - JurisLink

Obrigado por considerar contribuir com o JurisLink! 🎉

## 📋 Como Contribuir

### 1. Reportar Bugs

Se encontrar um bug:
1. Verifique se já não existe uma issue sobre ele
2. Crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots (se aplicável)
   - Ambiente (navegador, OS, etc.)

### 2. Sugerir Funcionalidades

Para sugerir novas features:
1. Crie uma issue com a tag `enhancement`
2. Descreva claramente a funcionalidade
3. Explique o caso de uso
4. Proponha uma implementação (opcional)

### 3. Enviar Pull Requests

#### Processo

1. **Fork o repositório**
2. **Crie uma branch**
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/meu-bug-fix
   ```

3. **Faça suas alterações**
   - Siga o style guide
   - Escreva código limpo e documentado
   - Adicione testes (quando aplicável)

4. **Commit suas mudanças**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

5. **Push para sua branch**
   ```bash
   git push origin feature/minha-feature
   ```

6. **Abra um Pull Request**
   - Descreva suas mudanças
   - Referencie issues relacionadas
   - Adicione screenshots (se UI)

## 📝 Convenções de Código

### TypeScript/React

```typescript
// ✅ Bom
interface UserProfile {
  id: string
  name: string
  email: string
}

export function UserCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-bold">{profile.name}</h3>
      <p className="text-muted-foreground">{profile.email}</p>
    </div>
  )
}

// ❌ Evite
function usercard(props) {
  return <div>{props.name}</div>
}
```

### Commits

Use Conventional Commits:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação, sem mudança de código
- `refactor:` - Refatoração de código
- `test:` - Adição/correção de testes
- `chore:` - Tarefas de manutenção

Exemplos:
```bash
feat: adiciona sistema de busca por CEP
fix: corrige erro ao salvar perfil
docs: atualiza README com instruções de deploy
refactor: simplifica lógica de cálculo de score
```

### Estrutura de Pastas

```
app/
├── (public)/      # Rotas públicas (sem autenticação)
├── painel/        # Dashboards (autenticado)
├── api/           # API routes
└── auth/          # Autenticação

components/
├── ui/            # Componentes base (shadcn)
└── [feature]/     # Componentes específicos

lib/
├── [service]/     # Clientes de serviços externos
└── utils/         # Funções utilitárias
```

## 🧪 Testes

Antes de enviar PR:

```bash
# Lint
pnpm lint

# Type check
pnpm tsc --noEmit

# Build
pnpm build
```

## 🎨 UI/UX Guidelines

- Mobile-first
- Acessibilidade (WCAG 2.1)
- Cores do tema Tailwind
- Componentes Shadcn/ui
- Design consistente

## 🔒 Segurança

- NUNCA commite credenciais ou secrets
- Use variáveis de ambiente
- Sanitize user inputs
- Valide dados no backend
- Revise código antes de PR

## 📦 Dependências

Ao adicionar novas dependências:

```bash
# Preferir pnpm
pnpm add [package]

# Documentar o porquê
# Atualizar README se necessário
```

## 🤝 Código de Conduta

- Seja respeitoso
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia

## ❓ Dúvidas?

Abra uma issue ou entre em contato:
- Email: dev@jurislink.com.br
- Discord: [Link do servidor]

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.

---

Obrigado por contribuir! 🚀
