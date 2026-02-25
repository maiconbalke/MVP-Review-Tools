import { motion } from "framer-motion";
import { Shield, Heart, Calendar, Users, Eye, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Privacidade Total",
    description: "Perfis ocultos, fotos com acesso restrito e navegação anônima. Sua identidade, suas regras.",
  },
  {
    icon: Heart,
    title: "Matching Inteligente",
    description: "Algoritmo que entende suas preferências e conecta você a casais e pessoas compatíveis.",
  },
  {
    icon: Calendar,
    title: "Eventos Exclusivos",
    description: "Descubra festas, encontros e eventos verificados na sua região com total segurança.",
  },
  {
    icon: Users,
    title: "Comunidade Ativa",
    description: "Grupos de discussão, fóruns e espaços para compartilhar experiências sem julgamento.",
  },
  {
    icon: Eye,
    title: "Perfis Verificados",
    description: "Processo de verificação rigoroso para garantir autenticidade e segurança para todos.",
  },
  {
    icon: MessageCircle,
    title: "Chat Seguro",
    description: "Mensagens criptografadas, fotos temporárias e controle total sobre suas conversas.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Feito para quem vive{" "}
            <span className="text-gradient-gold">sem amarras</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Cada detalhe pensado para sua liberdade e segurança
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group p-8 rounded-2xl bg-glass hover:glow-gold-sm transition-shadow duration-500 cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
