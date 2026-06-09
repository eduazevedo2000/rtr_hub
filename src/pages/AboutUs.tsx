import { motion } from "framer-motion";
import { Users, Trophy, Target, Flag, Heart, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function AboutUs() {
  return (
    <div className="page-shell">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,_hsl(24_90%_50%_/_0.1)_0%,_hsl(268_40%_30%_/_0.05)_40%,_transparent_70%)]" />
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 12 }}
            >
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-racing text-2xl sm:text-4xl md:text-5xl font-bold mb-4"
            >
              SOBRE NÓS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Conhece a história, valores e visão da Ric Team Racing.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="container py-12 max-w-4xl">
        <div className="space-y-8">
          {/* História/Fundação */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -2 }}
            className="card-racing p-5 sm:p-8"
          >
            <h2 className="font-racing text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Flag className="h-5 w-5 text-primary" />
              </div>
              A Nossa História
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A Ric Team Racing (RTR) nasceu de um grupo de amigos que partilha uma paixão genuína pelo sim racing. Após vários anos a acompanhar a modalidade, a ver pilotos, equipas e eventos de resistência crescerem, decidimos dar o passo de espectadores para competidores.
              </p>
            </div>
          </motion.div>

          {/* Ricfazeres */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="card-racing p-5 sm:p-8"
          >
            <h2 className="font-racing text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              Ricfazeres - Team Owner
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Uma figura chave na fundação e crescimento da Ric Team Racing é o Ricfazeres. Tendo apoiado o projeto desde os seus primeiros dias, quando tudo começou apenas como um grupo de amigos a correr juntos, acabou por se envolver profundamente no desenvolvimento e direção da equipa, assumindo o papel de team owner.
              </p>
              <p>
                Através da transmissão das nossas corridas, produção de conteúdos e ajuda na organização de eventos LAN especiais, o Ricfazeres tem sido fundamental na expansão da RTR para além da pista. O seu trabalho trouxe visibilidade, profissionalismo e novas oportunidades à organização, desempenhando também um papel essencial na captação de patrocinadores e parceiros, ajudando a estabelecer a Ric Team Racing como uma presença estruturada e credível no panorama do sim racing de resistência.
              </p>
            </div>
          </motion.div>

          {/* Filosofia */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="card-racing p-5 sm:p-8"
          >
            <h2 className="font-racing text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              A Nossa Filosofia
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Embora a nossa ambição nunca tenha sido simplesmente sermos "os melhores do mundo", o nosso foco sempre foi fazer as coisas da forma certa. Orgulhamo-nos de operar com o máximo profissionalismo possível, dentro e fora de pista. Desde a preparação para as corridas e coordenação da equipa, até ao branding, parcerias e presença na comunidade.
              </p>
              <p>
                Para nós, a RTR representa a união entre amizade, paixão e profissionalismo, provando que mesmo equipas amadoras podem abordar o sim racing com estrutura, compromisso e elevados padrões.
              </p>
            </div>
          </motion.div>

          {/* Competições */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="card-racing p-5 sm:p-8"
          >
            <h2 className="font-racing text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              As Nossas Competições
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A Ric Team Racing compete em alguns dos eventos de resistência mais exigentes do calendário de sim racing, especializando-se em competições de longa duração onde consistência, trabalho de equipa e estratégia são fatores decisivos para o sucesso. O nosso programa foca-se principalmente em corridas de resistência, incluindo provas de 6, 8, 10, 12 e 24 horas disputadas em circuitos de renome mundial na plataforma iRacing.
              </p>
              <p>
                Em 2025, a RTR participou no prestigiado evento Majors 24 Hours, assinalando um marco importante no percurso da equipa na resistência. Com base nessa experiência, a equipa continua a sua expansão em 2026 ao competir no campeonato VSCA, entrando em múltiplas categorias e reforçando a sua presença na competição internacional de protótipos e GT.
              </p>
            </div>
          </motion.div>

          {/* Visão Futura */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="card-racing p-5 sm:p-8"
          >
            <h2 className="font-racing text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              A Nossa Visão
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A nossa visão passa por continuar a expandir a Ric Team Racing, estamos comprometidos em crescer tanto a nível competitivo como organizacional, elevando constantemente os nossos padrões dentro e fora de pista. Enquanto equipa, acreditamos que o progresso nasce do esforço coletivo, evoluir juntos, aprender juntos e construir sucesso passo a passo.
              </p>
              <p>
                Procuramos lutar por pódios e campeonatos, ao mesmo tempo que desenvolvemos pilotos talentosos, construímos parcerias de longo prazo com patrocinadores e entregamos conteúdo digital de desporto motorizado com elevada qualidade. No centro da RTR está a ambição de alcançar os melhores resultados possíveis. Corremos para vencer, e essa mentalidade reflete-se nas muitas horas que dedicamos a treinos, preparação e desenvolvimento de performance, e criação de ideias para as nossas redes sociais antes de cada evento.
              </p>
              <p>
                À medida que crescemos, a nossa missão mantém-se inalterada: representar os nossos parceiros, pilotos e comunidade com profissionalismo, paixão e performance. Nunca esquecendo a amizade que existe dentro da equipa.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 RTR Sempre a puxar croquetes
          </p>
        </div>
      </footer>
    </div>
  );
}
