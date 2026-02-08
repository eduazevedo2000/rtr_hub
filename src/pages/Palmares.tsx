import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { RaceEventsList } from "@/components/race/RaceEventsList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Race = Database["public"]["Tables"]["races"]["Row"];
type AchievementPosition = Database["public"]["Tables"]["achievement_positions"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export default function Palmares() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  // Map of race_id -> array of positions
  const [racePositions, setRacePositions] = useState<Record<string, AchievementPosition[]>>({});
  // Map of category name -> color (from categories table)
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [raceToDelete, setRaceToDelete] = useState<Race | null>(null);

  const fetchRaces = async () => {
    // Fetch all achievements first to know which races have been completed
    const { data: achievementsData, error: achievementsError } = await supabase
      .from("team_achievements")
      .select(`
        id,
        race_id,
        achievement_positions (
          id,
          category,
          position_finished
        )
      `);

    if (achievementsError) {
      setLoading(false);
      return;
    }

    // Get race IDs that have achievements (manually finished races)
    const raceIdsWithAchievements = achievementsData
      ?.map(a => a.race_id)
      .filter(Boolean) || [];

    // Fetch races that either:
    // 1. Have achievements (manually finished)
    // 2. Have a date in the past (automatically considered finished)
    const now = new Date().toISOString();
    
    let query = supabase
      .from("races")
      .select("*")
      .order("date", { ascending: false });

    // If there are achievements, include those races OR races in the past
    if (raceIdsWithAchievements.length > 0) {
      query = query.or(`id.in.(${raceIdsWithAchievements.join(',')}),date.lt.${now}`);
    } else {
      // If no achievements yet, only show past races
      query = query.lt("date", now);
    }

    const { data: racesData, error: racesError } = await query;

    if (racesError || !racesData) {
      setLoading(false);
      return;
    }

    setRaces(racesData);
    
    // Build positions map from achievements data
    if (achievementsData) {
      const positionsMap: Record<string, AchievementPosition[]> = {};
      
      for (const achievement of achievementsData) {
        if (achievement.race_id && achievement.achievement_positions) {
          // achievement_positions is an array due to the relationship
          const positions = Array.isArray(achievement.achievement_positions) 
            ? achievement.achievement_positions 
            : [achievement.achievement_positions];
          
          if (positions.length > 0) {
            positionsMap[achievement.race_id] = positions.sort((a, b) => 
              a.category.localeCompare(b.category)
            ) as AchievementPosition[];
          }
        }
      }
      
      setRacePositions(positionsMap);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, color");

      if (!error && data) {
        const colors: Record<string, string> = {};
        for (const cat of data as Category[]) {
          if (cat.color) colors[cat.name] = cat.color;
        }
        setCategoryColors(colors);
      }
    };

    fetchCategories();
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

  const openDelete = (race: Race, e: React.MouseEvent) => {
    e.stopPropagation();
    setRaceToDelete(race);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!raceToDelete?.id) return;

    const { error } = await supabase
      .from("races")
      .delete()
      .eq("id", raceToDelete.id);

    if (error) {
      toast({
        title: "Erro ao apagar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Corrida apagada!" });
      fetchRaces();
    }

    setDeleteDialogOpen(false);
    setRaceToDelete(null);
  };

  type TimelineItem =
    | { type: "year"; year: number }
    | { type: "race"; race: Race };

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    let lastYear: number | null = null;
    for (const race of races) {
      const y = race.date ? new Date(race.date).getFullYear() : null;
      if (y != null && y !== lastYear) {
        items.push({ type: "year", year: y });
        lastYear = y;
      }
      items.push({ type: "race", race });
    }
    return items;
  }, [races]);

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
                        style={
                          race.tipo === "vsca"
                            ? {
                                background:
                                  "linear-gradient(180deg, hsl(215 25% 22%) 0%, hsl(215 20% 16%) 100%)",
                                borderColor: "hsl(215 25% 28%)",
                              }
                            : race.tipo === "iracing"
                              ? {
                                  background:
                                    "linear-gradient(180deg, hsl(0 0% 4%) 0%, hsl(0 0% 2%) 100%)",
                                  borderColor: "hsl(220 10% 12%)",
                                }
                              : undefined
                        }
                        onClick={() => {
                          if (race.id) setSelectedRaceId(race.id);
                        }}
                        whileHover={{ x: 4 }}
                      >
                        {user && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => openDelete(race, e)}
                            aria-label={`Apagar: ${race.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                                        <span
                                          className={`text-xs sm:text-sm font-racing uppercase tracking-wider text-center whitespace-nowrap font-semibold ${!categoryColors[pos.category] ? "text-muted-foreground" : ""}`}
                                          style={
                                            categoryColors[pos.category]
                                              ? { color: categoryColors[pos.category] }
                                              : undefined
                                          }
                                        >
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-racing">
              Apagar corrida?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres apagar esta corrida do palmarés? Esta ação não pode ser revertida.
              {raceToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  "{raceToDelete.name}"
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
