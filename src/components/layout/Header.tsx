import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Flag, Trophy, HelpCircle, Settings, LogIn, LogOut, User, Mail, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/", label: "Live", icon: Flag },
  { path: "/palmares", label: "Palmarés", icon: Trophy },
  { path: "/pilotos", label: "Pilotos", icon: Users },
  { path: "/redes", label: "Redes Sociais", icon: Globe },
  { path: "/faq", label: "FAQ", icon: HelpCircle },
  { path: "/contacts", label: "Contactos", icon: Mail },
];

export function Header() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const topItems = navItems.slice(0, 4);
  const stairItems = navItems.slice(4);

  const NavLink = ({ item, className = "" }: { item: (typeof navItems)[0]; className?: string }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    return (
      <Link key={item.path} to={item.path} className={className}>
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
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-20 items-center justify-between py-1 md:min-h-24">
        <Link to="/" className="flex shrink-0 items-center">
          <img
            src="/images/rtr_logo.png"
            alt="RTR Logo"
            className="h-20 w-auto object-contain md:h-24"
          />
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0 md:flex">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {topItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
          {stairItems.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
              {stairItems.map((item, i) => (
                <div key={item.path} style={{ marginLeft: i * 12 }}>
                  <NavLink item={item} />
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
