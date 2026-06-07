import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_hsl(24_90%_50%_/_0.06)_0%,_transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center px-4"
      >
        <h1 className="font-racing text-7xl sm:text-9xl font-bold text-gradient-racing mb-4">
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-8 font-light">
          Esta pagina nao existe.
        </p>
        <Link to="/">
          <Button className="btn-racing gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao inicio
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
