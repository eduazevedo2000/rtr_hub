import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { RaceEventsList } from "@/components/race/RaceEventsList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type Race = Database["public"]["Tables"]["races"]["Row"];
type AchievementPosition = Database["public"]["Tables"]["achievement_positions"]["Row"];

export default function Palmares() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  // Map of race_id -> array of positions
  const [racePositions, setRacePositions] = useState<Record<string, AchievementPosition[]>>({});

  useEffect(() => {
    const fetchRaces = async () => {
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .order("date", { ascending: false });

      if (!error && data) {
        setRaces(data);
        
        // Fetch achievements and positions for each race
        const positionsMap: Record<string, AchievementPosition[]> = {};
        
        for (const race of data) {
          if (!race.id) continue;
          
          // Get achievement for this race
          const { data: achievements } = await supabase
            .from("team_achievements")
            .select("id")
            .eq("race_id", race.id)
            .limit(1);
          
          if (achievements && achievements.length > 0) {
            const achievementId = achievements[0].id;
            
            // Get positions for this achievement
            const { data: positions } = await supabase
              .from("achievement_positions")
              .select("*")
              .eq("achievement_id", achievementId)
              .order("category", { ascending: true });
            
            if (positions && positions.length > 0) {
              positionsMap[race.id] = positions;
            }
          }
        }
        
        setRacePositions(positionsMap);
      }
      setLoading(false);
    };

    fetchRaces();
  }, []);

  const formatDate = (d: string | null) => {
    if (!d) return "Data não especificada";
    try {
      return new Date(d).toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  type TimelineItem =
    | { type: "year"; year: number }
    | { type: "race"; race: Race };

  const timelineItems: TimelineItem[] = [];
  let lastYear: number | null = null;
  for (const race of races) {
    const y = race.date ? new Date(race.date).getFullYear() : null;
    if (y != null && y !== lastYear) {
      timelineItems.push({ type: "year", year: y });
      lastYear = y;
    }
    timelineItems.push({ type: "race", race });
  }

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
        ) : races.length === 0 ? (
          <div className="card-racing p-12 text-center max-w-lg mx-auto">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-racing text-xl mb-2">Em Construção</h2>
            <p className="text-muted-foreground">
              O palmarés da equipa será adicionado em breve. Fica atento às nossas conquistas!
            </p>
          </div>
        ) : (
          <>
            <div className="relative max-w-3xl mx-auto">
              {/* Linha da cronologia */}
              <div
                className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary to-primary/50"
                aria-hidden
              />

              <div className="space-y-0">
                {timelineItems.map((item, index) => {
                  if (item.type === "year") {
                    return (
                      <motion.div
                        key={`year-${item.year}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        className="relative flex items-center gap-4 sm:gap-6 py-4 first:pt-0"
                      >
                        <div className="flex w-10 shrink-0 justify-center">
                          <div
                            className="relative z-10 h-3 w-3 rotate-45 rounded-sm border-2 border-primary bg-primary/20"
                            aria-hidden
                          />
                        </div>
                        <span className="font-racing text-sm font-bold uppercase tracking-wider text-primary">
                          {item.year}
                        </span>
                      </motion.div>
                    );
                  }

                  const race = item.race;
                  return (
                    <motion.div
                      key={race.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="relative flex items-start gap-4 sm:gap-6 py-6 last:pb-0"
                    >
                      <div className="flex w-10 shrink-0 justify-center pt-1.5">
                        <div
                          className="relative z-10 h-4 w-4 rounded-full border-2 border-primary bg-background ring-4 ring-background"
                          aria-hidden
                        />
                      </div>

                      <motion.div
                        className="card-racing group relative min-w-0 flex-1 cursor-pointer overflow-hidden transition-colors hover:border-primary/50"
                        onClick={() => {
                          if (race.id) setSelectedRaceId(race.id);
                        }}
                        whileHover={{ x: 4 }}
                      >
                        {(() => {
                          const positions = race.id ? racePositions[race.id] : [];
                          const hasPositions = positions && positions.length > 0;
                          
                          // Fallback to race.position_finished if no positions found
                          const fallbackPosition = race.position_finished;
                          
                          if (hasPositions || fallbackPosition) {
                            const hasMultiple = hasPositions && positions.length > 1;
                            
                            return (
                              <div className={`absolute top-4 right-4 z-10 ${hasMultiple ? 'flex flex-row flex-wrap gap-3 justify-end' : 'flex flex-col gap-2 items-end'}`}>
                                {hasPositions ? (
                                  positions.map((pos) => {
                                    const isP1 = pos.position_finished === "P1" || pos.position_finished === "1";
                                    const isP2 = pos.position_finished === "P2" || pos.position_finished === "2";
                                    const isP3 = pos.position_finished === "P3" || pos.position_finished === "3";
                                    
                                    return (
                                      <div key={pos.id} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                                        <span
                                          className={`position-badge position-badge-large ${
                                            isP1
                                              ? "p1"
                                              : isP2
                                                ? "p2"
                                                : isP3
                                                  ? "p3"
                                                  : "bg-secondary"
                                          }`}
                                        >
                                          {pos.position_finished}
                                        </span>
                                        <span className="text-xs sm:text-sm font-racing uppercase tracking-wider text-muted-foreground text-center whitespace-nowrap">
                                          {pos.category}
                                        </span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span
                                      className={`position-badge position-badge-large ${
                                        fallbackPosition === "P1" ||
                                        fallbackPosition === "1"
                                          ? "p1"
                                          : fallbackPosition === "P2" ||
                                              fallbackPosition === "2"
                                            ? "p2"
                                            : fallbackPosition === "P3" ||
                                                fallbackPosition === "3"
                                              ? "p3"
                                              : "bg-secondary"
                                      }`}
                                    >
                                      {fallbackPosition}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Calendar className="h-3 w-3 shrink-0" />
                            {formatDate(race.date)}
                          </div>
                          <h3 className="font-racing text-lg font-bold mb-2">
                            {race.name}
                          </h3>
                          {race.track && (
                            <div className="flex items-center gap-2 mt-3">
                              <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="text-xs font-racing uppercase tracking-wider text-muted-foreground">
                                {race.track}
                              </span>
                            </div>
                          )}
                          {(race.category || race.split) && (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {race.category && (
                                <span className="text-xs font-racing uppercase tracking-wider text-muted-foreground">
                                  {race.category}
                                </span>
                              )}
                              {race.split && (
                                <span className="text-xs font-racing uppercase tracking-wider text-muted-foreground">
                                  {race.split}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <Dialog
              open={selectedRaceId !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedRaceId(null);
                }
              }}
            >
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-racing text-2xl">
                    {races.find((r) => r.id === selectedRaceId)?.name || "Eventos da Corrida"}
                  </DialogTitle>
                </DialogHeader>
                {selectedRaceId && <RaceEventsList raceId={selectedRaceId} />}
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
    </div>
  );
}
