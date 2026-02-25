import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-glass"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-display font-bold text-gradient-gold tracking-wide">
          Libertà
        </span>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
          <a href="#community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Comunidade</a>
          <a href="#events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Eventos</a>
          <Button variant="hero" size="sm" className="rounded-lg" onClick={() => navigate(ROUTES.LOGIN)}>
            Entrar
          </Button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          className="md:hidden px-6 pb-6 bg-glass border-t border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="flex flex-col gap-4 pt-4">
            <a href="#features" className="text-sm text-muted-foreground">Recursos</a>
            <a href="#community" className="text-sm text-muted-foreground">Comunidade</a>
            <a href="#events" className="text-sm text-muted-foreground">Eventos</a>
            <Button variant="hero" size="sm" className="rounded-lg w-fit" onClick={() => navigate(ROUTES.LOGIN)}>Entrar</Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
