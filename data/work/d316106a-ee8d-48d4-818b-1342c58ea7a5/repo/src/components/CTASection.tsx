import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="cta-criar-conta" className="py-24 px-6">
      <motion.div
        className="max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-20 bg-glass glow-gold relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <h2 className="relative text-3xl md:text-5xl font-display font-bold mb-6">
          Pronto para explorar{" "}
          <span className="text-gradient-gold">novas conexões</span>?
        </h2>
        <p className="relative text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
          Junte-se a milhares de casais e pessoas que já vivem suas relações com liberdade e respeito.
        </p>
        <div className="relative">
          <Button variant="hero" size="lg" className="text-base px-10 py-6 rounded-xl" onClick={() => navigate(ROUTES.CADASTRO)}>
            Criar minha conta
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
