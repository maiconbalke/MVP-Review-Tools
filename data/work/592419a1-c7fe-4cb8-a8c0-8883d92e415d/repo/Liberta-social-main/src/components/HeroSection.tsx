import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">100% privado e discreto</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
          <span className="text-gradient-gold">Conexões</span>
          <br />
          <span className="text-foreground">sem limites</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          A rede social exclusiva para casais e praticantes da vida não-monogâmica.
          Encontre pessoas com a mesma liberdade de espírito.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        >
          <Button
            variant="hero"
            size="lg"
            className="text-base px-8 py-6 rounded-xl"
            onClick={() => document.getElementById("cta-criar-conta")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <Sparkles className="w-5 h-5" />
            Começar agora
          </Button>
          <Button variant="hero-outline" size="lg" className="text-base px-8 py-6 rounded-xl">
            Saiba mais
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center justify-center gap-8 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-foreground">10k+</p>
            <p className="text-sm">Membros ativos</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-foreground">500+</p>
            <p className="text-sm">Eventos mensais</p>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-foreground">100%</p>
            <p className="text-sm">Verificados</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
