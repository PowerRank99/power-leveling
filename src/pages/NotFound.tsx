
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight-base">
      <div className="text-center p-6">
        <h1 className="text-4xl font-orbitron font-bold mb-4 text-text-primary">404</h1>
        <p className="text-xl text-text-secondary font-sora mb-6">Ops! Página não encontrada</p>
        <img 
          src="/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png" 
          alt="Pixel Art Character" 
          className="w-32 h-32 mx-auto mb-6"
        />
        <p className="text-text-tertiary font-sora mb-6">O exercício que você procura não está aqui!</p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-purple"
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
