# ⚠️ PROBLEMA: Emails não estão sendo enviados?

## 🔍 Diagnóstico

Se você não está recebendo emails de **verificação de conta** ou **recuperação de senha**, o problema está na configuração do Supabase.

## ✅ Soluções

### 1. **Verificar se o Email está Habilitado no Supabase**

1. Acesse o **Supabase Dashboard** → https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **Providers**
4. Certifique-se de que **Email** está **ENABLED**

### 2. **Verificar Templates de Email**

1. No Supabase Dashboard, vá em **Authentication** → **Email Templates**
2. Verifique os seguintes templates:
   - **Confirm signup** (verificação de conta)
   - **Reset password** (recuperação de senha)

3. **IMPORTANTE**: Verifique se o link de redirecionamento está correto:
   - Substitua `{{ .SiteURL }}` por `{{ .ConfirmationURL }}`
   - Ou ajuste para usar sua URL de produção

### 3. **Verificar Rate Limits**

Se você está testando muito, o Supabase pode estar bloqueando temporariamente o envio.

1. No Supabase, vá em **Authentication** → **Rate Limits**
2. Verifique se você não excedeu o limite
3. Aguarde alguns minutos e tente novamente

### 4. **Verificar SMTP (Opcional - para produção)**

Por padrão, o Supabase usa o próprio serviço de email, mas você pode configurar um SMTP customizado:

1. No Supabase, vá em **Project Settings** → **Auth**
2. Role até **SMTP Settings**
3. Configure com um provedor como:
   - **SendGrid**
   - **Resend**
   - **AWS SES**
   - **Gmail** (apenas para testes)

### 5. **Verificar se o Google OAuth está habilitado**

O erro `"Unsupported provider: provider is not enabled"` significa que o **Google OAuth** não está configurado no Supabase.

**Para habilitar:**

1. No Supabase, vá em **Authentication** → **Providers**
2. Clique em **Google**
3. Habilite o provider
4. Adicione as credenciais do **Google Cloud Console**:
   - **Client ID**
   - **Client Secret**
5. Configure a **Authorized redirect URIs** com:
   ```
   https://<seu-projeto>.supabase.co/auth/v1/callback
   ```

**Como obter credenciais do Google:**

1. Acesse https://console.cloud.google.com
2. Crie um novo projeto (ou selecione um existente)
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `https://<seu-projeto>.supabase.co/auth/v1/callback`
6. Copie o **Client ID** e **Client Secret** e cole no Supabase

---

## 🧪 Teste Rápido

Para verificar se o email está funcionando:

1. Tente criar uma nova conta
2. Verifique **caixa de entrada** e **spam**
3. Se não receber em 2 minutos, há um problema de configuração

---

## 📧 Caso ainda não funcione

Se após todas essas verificações o email ainda não estiver chegando:

1. **Verifique os logs do Supabase**:
   - Dashboard → **Logs** → **Auth**
   
2. **Teste com outro email**:
   - Às vezes provedores de email (Gmail, Outlook) bloqueiam emails de testes

3. **Entre em contato com o suporte do Supabase**:
   - https://supabase.com/support

---

## ⚡ Solução Temporária (Desenvolvimento)

Se você está em **desenvolvimento local**, pode desabilitar temporariamente a verificação de email:

1. No Supabase Dashboard, vá em **Authentication** → **Email Auth**
2. Desabilite **Confirm Email** (apenas para desenvolvimento!)
3. ⚠️ **NUNCA desabilite isso em produção**

---

## 📝 Checklist Final

- [ ] Email provider habilitado no Supabase
- [ ] Templates de email configurados corretamente
- [ ] URL de redirecionamento correta (`NEXT_PUBLIC_APP_URL`)
- [ ] Google OAuth habilitado (se necessário)
- [ ] Rate limits não excedidos
- [ ] Verificou spam e caixa de entrada
- [ ] Logs do Supabase verificados
