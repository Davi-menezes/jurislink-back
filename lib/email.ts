import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: 'JurisLink <noreply@jurislink.com.br>',
    to: email,
    subject: 'Verifique seu email - JurisLink',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Bem-vindo ao JurisLink!</h1>
        <p>Clique no link abaixo para verificar seu email:</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Verificar Email
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Se você não criou uma conta, ignore este email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: 'JurisLink <noreply@jurislink.com.br>',
    to: email,
    subject: 'Redefinir senha - JurisLink',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Redefinir Senha</h1>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Redefinir Senha
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Este link expira em 1 hora. Se você não solicitou, ignore este email.
        </p>
      </div>
    `,
  });
}

export async function sendLeadNotification(
  lawyerEmail: string,
  clientName: string,
  clientMessage: string
) {
  await resend.emails.send({
    from: 'JurisLink <leads@jurislink.com.br>',
    to: lawyerEmail,
    subject: 'Novo Lead - JurisLink',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Você recebeu um novo lead!</h1>
        <p><strong>Cliente:</strong> ${clientName}</p>
        <p><strong>Mensagem:</strong></p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 6px;">
          ${clientMessage}
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/painel/advogado" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Ver no Painel
        </a>
      </div>
    `,
  });
}
