const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-display font-bold text-lg text-gradient-gold">Libertà</span>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Termos de uso</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
          <a href="#" className="hover:text-foreground transition-colors">Contato</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Libertà. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
