import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import AppPage from "./pages/AppPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path={ROUTES.HOME} element={<Index />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.CADASTRO} element={<Cadastro />} />
            <Route path="/configuracoes" element={<Navigate to={ROUTES.APP} replace />} />
            <Route path={ROUTES.APP} element={<AppPage />} />
            <Route path={`${ROUTES.PROFILE}/:userId`} element={<ProfilePage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
