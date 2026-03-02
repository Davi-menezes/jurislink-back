import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso | JurisLink",
  description: "Termos de uso da plataforma JurisLink",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
      
      <div className="prose prose-slate max-w-none space-y-6">
        <p className="text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar a plataforma JurisLink, você aceita e concorda em estar vinculado a estes 
            Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descrição do Serviço</h2>
          <p>
            A JurisLink é uma plataforma online que conecta clientes a advogados no Brasil. 
            <strong> A JurisLink NÃO presta serviços jurídicos</strong>. Atuamos exclusivamente como 
            intermediadora, facilitando o contato entre clientes e profissionais do direito independentes.
          </p>
          <p className="mt-4">
            Os advogados cadastrados são profissionais autônomos, responsáveis por seus próprios serviços, 
            honorários e obrigações profissionais.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Cadastro e Conta</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Para Clientes</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>O cadastro é gratuito</li>
            <li>Você deve fornecer informações verdadeiras e atualizadas</li>
            <li>Você é responsável pela segurança de sua senha</li>
            <li>Você pode buscar, avaliar e contatar advogados</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Para Advogados</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>É necessário possuir registro ativo na OAB</li>
            <li>O cadastro inicial é gratuito</li>
            <li>A aparição nas buscas requer assinatura paga do Plano Premium</li>
            <li>Todas as informações fornecidas devem ser verídicas</li>
            <li>A OAB será verificada por nossa equipe</li>
            <li>Você é responsável por responder aos contatos recebidos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Planos e Pagamentos</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Plano Premium (Advogados)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pagamento mensal recorrente via Mercado Pago</li>
            <li>Necessário para aparecer nos resultados de busca</li>
            <li>Cancelável a qualquer momento</li>
            <li>Não há reembolso proporcional em caso de cancelamento</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Boost (Add-on)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pagamento único por período determinado (30 dias)</li>
            <li>Aumenta a posição nos resultados de busca</li>
            <li>Não renovável automaticamente</li>
            <li>Não há reembolso após ativação</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Avaliações</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Clientes podem avaliar advogados com quem tiveram contato</li>
            <li>Cada cliente pode avaliar um advogado apenas uma vez</li>
            <li>As avaliações devem ser honestas e respeitosas</li>
            <li>Não são permitidos comentários ofensivos, difamatórios ou discriminatórios</li>
            <li>Advogados podem responder às avaliações</li>
            <li>A JurisLink pode ocultar avaliações que violem estas regras</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Responsabilidades</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Da Plataforma</h3>
          <p>A JurisLink:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Não se responsabiliza pela qualidade dos serviços jurídicos prestados</li>
            <li>Não interfere na relação entre cliente e advogado</li>
            <li>Não garante resultados específicos</li>
            <li>Verifica registros da OAB, mas não avalia competência profissional</li>
            <li>Pode remover perfis que violem estes termos</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Dos Usuários</h3>
          <p>Os usuários são responsáveis por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Manter suas informações atualizadas</li>
            <li>Usar a plataforma de forma ética e legal</li>
            <li>Negociar honorários diretamente com o advogado</li>
            <li>Cumprir obrigações contratuais estabelecidas fora da plataforma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo da plataforma (textos, imagens, logos, código) é propriedade da JurisLink 
            ou de seus licenciadores e está protegido por leis de propriedade intelectual.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Privacidade</h2>
          <p>
            O tratamento de dados pessoais está descrito em nossa{" "}
            <a href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </a>
            , em conformidade com a LGPD (Lei nº 13.709/2018).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Modificações</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
            Usuários serão notificados sobre mudanças significativas.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Lei Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis da República Federativa do Brasil. 
            Qualquer disputa será resolvida no foro da comarca de São Paulo/SP.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contato</h2>
          <p>
            Para dúvidas sobre estes termos, entre em contato:<br />
            Email: contato@jurislink.com.br
          </p>
        </section>
      </div>
    </div>
  )
}
