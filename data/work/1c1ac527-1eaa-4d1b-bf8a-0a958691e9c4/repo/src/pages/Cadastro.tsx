import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ROUTES } from "@/routes";

const profileTypes = [
  { value: "casal", label: "Casal" },
  { value: "casal_2m", label: "Casal (2 mulheres)" },
  { value: "casal_2h", label: "Casal (2 homens)" },
  { value: "homem", label: "Homem" },
  { value: "homem_trans", label: "Homem Trans" },
  { value: "mulher", label: "Mulher" },
  { value: "mulher_trans", label: "Mulher Trans" },
  { value: "travesti", label: "Travesti" },
  { value: "crossdressing", label: "Cross-dressing (CD)" },
];

const Cadastro = () => {
  const [profileType, setProfileType] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileType) {
      toast.error("Selecione o tipo de perfil.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, {
      display_name: displayName,
      profile_type: profileType,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message || "Erro ao criar conta.");
    } else {
      // Save pre-signup data for profile seeding
      const preSignup = { displayName: displayName, gender: profileType, email };
      localStorage.setItem("pp:preSignup:v1", JSON.stringify(preSignup));
      toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      navigate(ROUTES.LOGIN);
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
        <h2 className="text-xl font-serif text-primary italic mb-8 text-center leading-relaxed">
          Cadastre-se para conectar<br />ao mundo do swing
        </h2>

        <form onSubmit={handleSignup} className="w-full space-y-4">
          <Select value={profileType} onValueChange={setProfileType}>
            <SelectTrigger className="h-12 bg-transparent border-foreground/30 text-foreground rounded-full px-5 [&>span]:text-foreground/50 data-[state=open]:border-primary">
              <SelectValue placeholder="Eu sou/somos..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {profileTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Nome de Exibição"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={50}
            className="h-12 bg-transparent border-foreground/30 text-foreground placeholder:text-foreground/50 rounded-full px-5"
          />
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
          <Input
            type="password"
            placeholder="Confirme a Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-12 bg-transparent border-foreground/30 text-foreground placeholder:text-foreground/50 rounded-full px-5"
          />

          <div className="pt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-foreground text-background font-semibold text-base hover:bg-foreground/90"
            >
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-sm text-primary font-medium">
          <Link to={ROUTES.LOGIN} className="hover:underline">
            Já tem Conta? Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Cadastro;
