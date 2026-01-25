import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, User, Instagram, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import type { Database } from "@/integrations/supabase/types";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

export default function Pilotos() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("name", { ascending: true });

      if (!error && data) {
        setDrivers(data);
      }
      setLoading(false);
    };

    fetchDrivers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.1)_0%,_transparent_50%)]" />
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="font-racing text-4xl md:text-5xl font-bold mb-4">
              Pilotos
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Os pilotos que representam a Ric Team Racing no iRacing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="container py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : drivers.length === 0 ? (
          <div className="card-racing p-12 text-center max-w-lg mx-auto">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-racing text-xl mb-2">Sem pilotos</h2>
            <p className="text-muted-foreground">
              Os pilotos da equipa serão adicionados em breve.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {drivers.map((driver, index) => {
              const instagramHandle = driver.instagram?.replace(/^@/, "")?.trim();
              const instagramUrl =
                instagramHandle ?
                  `https://instagram.com/${instagramHandle}`
                : null;

              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-racing p-6 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                      {driver.image_url ? (
                        <img
                          src={driver.image_url}
                          alt={driver.name}
                          className="h-full w-full object-contain object-center"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-racing text-lg font-bold truncate">
                        {driver.name}
                      </h3>
                      {/* {driver.known_as && (
                        <p className="text-sm text-primary font-medium mt-0.5">
                          {driver.known_as}
                        </p>
                      )} */}
                      {driver.category && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">
                          {driver.category}
                        </p>
                      )}
                      {instagramUrl && (
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-[#E4405F] hover:text-[#E4405F]/80 transition-colors"
                          aria-label={`Instagram de ${driver.name}`}
                        >
                          <img src="/images/instagram.png" alt="Instagram" className="h-4 w-4 shrink-0" />
                          {/* <span className="text-sm font-medium truncate">
                            @{instagramHandle}
                          </span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
