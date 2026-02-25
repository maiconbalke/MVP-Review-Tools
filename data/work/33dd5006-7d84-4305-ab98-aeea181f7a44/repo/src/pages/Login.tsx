import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error("E-mail ou senha inválidos.");
    } else {
      navigate(ROUTES.APP);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gradient-gold font-serif">Libertà</h1>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-3 rounded-full" />
        </div>

        <h2 className="text-2xl font-serif text-foreground mb-10">Seja Bem-Vindo(a)</h2>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-transparent border-foreground/30 text-foreground placeholder:text-foreground/50 rounded-full px-5"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-transparent border-foreground/30 text-foreground placeholder:text-foreground/50 rounded-full px-5"
          />
          <div className="pt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-foreground text-background font-semibold text-base hover:bg-foreground/90"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-sm text-primary font-medium">
          <Link to={ROUTES.CADASTRO} className="hover:underline">
            Não tem conta? Cadastre-se
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
