import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import type { Database } from "@/integrations/supabase/types";

type Achievement = Database["public"]["Tables"]["team_achievements"]["Row"];

export default function Palmares() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data, error } = await supabase
        .from("team_achievements")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAchievements(data);
      }
      setLoading(false);
    };

    fetchAchievements();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(48_100%_50%_/_0.1)_0%,_transparent_50%)]" />
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy className="h-12 w-12 mx-auto mb-4 text-racing-yellow" />
            <h1 className="font-racing text-4xl md:text-5xl font-bold mb-4">
              Palmarés
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Os melhores momentos e conquistas da Ric Team Racing ao longo das temporadas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="container py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : achievements.length === 0 ? (
          <div className="card-racing p-12 text-center max-w-lg mx-auto">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-racing text-xl mb-2">Em Construção</h2>
            <p className="text-muted-foreground">
              O palmarés da equipa será adicionado em breve. Fica atento às nossas conquistas!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-racing overflow-hidden group"
              >
                {achievement.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={achievement.image_url}
                      alt={achievement.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    {achievement.date || "Data não especificada"}
                  </div>
                  <h3 className="font-racing text-lg font-bold mb-2">
                    {achievement.title}
                  </h3>
                  {achievement.description && (
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
