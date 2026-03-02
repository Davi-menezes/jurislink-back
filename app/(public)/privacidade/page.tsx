import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade | JurisLink",
  description: "Política de privacidade e proteção de dados da JurisLink",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <p className="text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introdução</h2>
          <p>
            A JurisLink respeita sua privacidade e está comprometida em proteger seus dados pessoais. 
            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e compartilhamos 
            suas informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Controlador de Dados</h2>
          <p>
            <strong>JurisLink Tecnologia Ltda.</strong><br />
            CNPJ: XX.XXX.XXX/XXXX-XX<br />
            Endereço: [Endereço completo]<br />
            Email: privacidade@jurislink.com.br
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Dados Coletados</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Dados Fornecidos por Você</h3>
          <p>Ao criar uma conta, coletamos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nome completo</li>
            <li>Email</li>
            <li>Senha (criptografada)</li>
            <li>Estado e cidade</li>
            <li>Telefone (opcional)</li>
            <li>Foto de perfil (opcional)</li>
          </ul>

          <p className="mt-4">Para advogados, também coletamos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Número e estado da OAB</li>
            <li>Áreas de atuação</li>
            <li>Anos de experiência</li>
            <li>Descrição profissional</li>
            <li>Formação acadêmica</li>
            <li>Website e redes sociais</li>
            <li>Valores de honorários</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Dados Coletados Automaticamente</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Endereço IP</li>
            <li>Tipo de navegador e dispositivo</li>
            <li>Páginas visitadas</li>
            <li>Data e hora de acesso</li>
            <li>Cookies e tecnologias similares</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Finalidades do Tratamento</h2>
          <p>Utilizamos seus dados para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Criar e gerenciar sua conta</li>
            <li>Conectar clientes a advogados</li>
            <li>Processar pagamentos de assinaturas</li>
            <li>Exibir perfis públicos de advogados</li>
            <li>Enviar notificações sobre leads e mensagens</li>
            <li>Melhorar nossos serviços</li>
            <li>Prevenir fraudes e garantir segurança</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Base Legal</h2>
          <p>Tratamos seus dados com base em:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Consentimento:</strong> Ao aceitar esta política ao criar sua conta</li>
            <li><strong>Execução de contrato:</strong> Para fornecer os serviços solicitados</li>
            <li><strong>Obrigação legal:</strong> Para cumprir leis e regulamentos</li>
            <li><strong>Legítimo interesse:</strong> Para melhorar nossos serviços e prevenir fraudes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Compartilhamento de Dados</h2>
          <p>Seus dados podem ser compartilhados com:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Outros usuários:</strong> Perfis públicos de advogados são visíveis para todos os visitantes
            </li>
            <li>
              <strong>Processadores de pagamento:</strong> Mercado Pago para processar transações
            </li>
            <li>
              <strong>Provedores de serviços:</strong> Empresas que nos ajudam a operar a plataforma 
              (hospedagem, email, analytics)
            </li>
            <li>
              <strong>Autoridades:</strong> Quando exigido por lei ou para proteger direitos
            </li>
          </ul>
          <p className="mt-4">
            <strong>Não vendemos</strong> seus dados pessoais a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Armazenamento e Segurança</h2>
          <p>
            Seus dados são armazenados em servidores seguros com as seguintes medidas de proteção:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Criptografia de senhas (bcrypt)</li>
            <li>Criptografia de emails (AES-256)</li>
            <li>Comunicação via HTTPS</li>
            <li>Controle de acesso restrito</li>
            <li>Backups regulares</li>
            <li>Monitoramento de segurança</li>
          </ul>
          <p className="mt-4">
            Mantemos seus dados pelo tempo necessário para fornecer nossos serviços ou conforme 
            exigido por lei.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Seus Direitos (LGPD)</h2>
          <p>Você tem o direito de:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Acesso:</strong> Saber quais dados temos sobre você</li>
            <li><strong>Correção:</strong> Atualizar dados incorretos ou incompletos</li>
            <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados</li>
            <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
            <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
            <li><strong>Oposição:</strong> Opor-se a certos tratamentos de dados</li>
            <li><strong>Informação:</strong> Saber com quem compartilhamos seus dados</li>
          </ul>
          <p className="mt-4">
            Para exercer seus direitos, acesse as configurações da sua conta ou envie email para{" "}
            <strong>privacidade@jurislink.com.br</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de análise 
            para melhorar sua experiência. Você pode gerenciar cookies nas configurações do seu navegador.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Menores de Idade</h2>
          <p>
            Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente 
            dados de menores.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Transferência Internacional</h2>
          <p>
            Alguns de nossos provedores de serviços podem estar localizados fora do Brasil. 
            Garantimos que esses parceiros cumpram padrões adequados de proteção de dados.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
            por email ou aviso na plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contato</h2>
          <p>
            Para dúvidas sobre privacidade ou exercer seus direitos:<br />
            <strong>Email:</strong> privacidade@jurislink.com.br<br />
            <strong>Encarregado de Dados (DPO):</strong> dpo@jurislink.com.br
          </p>
          <p className="mt-4">
            Você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD) em{" "}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              www.gov.br/anpd
            </a>
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-3">Consentimento</h2>
          <p>
            Ao usar a JurisLink, você confirma que leu e compreendeu esta Política de Privacidade 
            e concorda com o tratamento de seus dados conforme descrito.
          </p>
        </section>
      </div>
    </div>
  )
}
