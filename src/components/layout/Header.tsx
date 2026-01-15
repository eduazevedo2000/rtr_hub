import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Flag, Trophy, HelpCircle, Settings, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "Live", icon: Flag },
  { path: "/palmares", label: "Palmarés", icon: Trophy },
  { path: "/faq", label: "FAQ", icon: HelpCircle },
];

export function Header() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/images/rtr_logo.png" alt="RTR Logo" className="h-10 w-170" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={`relative flex items-center gap-2 px-4 py-2 font-racing text-sm uppercase tracking-wider transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeNav"
                      initial={false}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Botões de admin/login/logout escondidos para versão beta */}
        {/* <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div> */}
      </div>
    </header>
  );
}
