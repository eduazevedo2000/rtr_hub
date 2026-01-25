import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flag, Clock, Users, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { RaceEventsList } from "@/components/race/RaceEventsList";
import { QualifyingTable } from "@/components/race/QualifyingTable";
import { TrackInfo } from "@/components/race/TrackInfo";
import type { Database } from "@/integrations/supabase/types";

type Race = Database["public"]["Tables"]["races"]["Row"];

const Index = () => {
  const [activeRace, setActiveRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [racesCount, setRacesCount] = useState(0);
  const [victoriesCount, setVictoriesCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);

  useEffect(() => {
    const fetchActiveRace = async () => {
      // Primeiro tenta buscar uma corrida ativa
      const { data: activeData, error: activeError } = await supabase
        .from("races")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (!activeError && activeData) {
        setActiveRace(activeData);
        setLoading(false);
        return;
      }

      // // Se não houver corrida ativa, busca a última corrida (mais recente)
      // const { data: lastRaceData, error: lastRaceError } = await supabase
      //   .from("races")
      //   .select("*")
      //   .order("date", { ascending: false })
      //   .limit(1)  
      //   .maybeSingle();

      // if (!lastRaceError && lastRaceData) {
      //   setActiveRace(lastRaceData);
      // }

      setLoading(false);
    };

    const fetchRacesCount = async () => {
      const { data, error } = await supabase
        .from("races")
        .select("count")
        .single();

      if (!error && data) {
        setRacesCount(data.count);
      }
    };

    const fetchVictoriesCount = async () => {
      const { data, error } = await supabase
        .from("races")
        .select("count")
        .eq("position_finished", "1");

      if (!error && data) {
        setVictoriesCount(data[0].count);
      }
    };

    const fetchDriversCount = async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("count")

      if (!error && data) {
        setDriversCount(data[0].count);
      }
    };

    fetchActiveRace();
    fetchRacesCount();
    fetchVictoriesCount();
    fetchDriversCount();
  }, []);
  

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.15)_0%,_transparent_50%)]" />
        <div className="container py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-racing uppercase tracking-widest text-primary">
                {activeRace ? "Corrida em Direto" : "Próxima Corrida"}
              </span>
            </div>
            
            <h1 className="font-racing text-4xl md:text-6xl font-bold mb-4 racing-glow">
              <span className="text-gradient-racing">RIC TEAM</span>{" "}
              <span className="text-foreground">RACING</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Acompanha em tempo real todas as ocorrências das corridas da equipa RTR no iRacing.
            </p>

            {activeRace && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-6 px-6 py-4 rounded-xl bg-card border border-border"
              >
                <div className="text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Corrida</p>
                  <p className="font-racing font-bold">{activeRace.name}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Pista</p>
                  <p className="font-racing font-bold">{activeRace.track}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-card/50">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Flag, label: "Corridas", value: racesCount },
              { icon: Trophy, label: "Vitórias", value: victoriesCount },
              { icon: Users, label: "Pilotos", value: driversCount },
              // { icon: Clock, label: "Horas", value: "120+" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-center"
              >
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-racing text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Race Events Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-racing text-xl uppercase tracking-wider">
                <Flag className="inline-block h-5 w-5 mr-2 text-primary" />
                Race Highlights
              </h2>
            </div>
            <RaceEventsList raceId={activeRace?.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QualifyingTable raceId={activeRace?.id} />
            <TrackInfo raceId={activeRace?.id} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 RTR Sempre a puxar croquetes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
