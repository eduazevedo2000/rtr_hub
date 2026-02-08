import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flag, Clock, Users, Trophy, Car, Layers, Cloud, Sun, CloudRain, Edit, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { RaceEventsList } from "@/components/race/RaceEventsList";
import { QualifyingTable } from "@/components/race/QualifyingTable";
import { TrackInfo } from "@/components/race/TrackInfo";
import { RaceDrivers } from "@/components/race/RaceDrivers";
import { Countdown } from "@/components/race/Countdown";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Race = Database["public"]["Tables"]["races"]["Row"] & {
  duration_hours?: number | null;
  drivers?: string[] | null;
};

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeRace, setActiveRace] = useState<Race | null>(null);
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    track: "",
    num_cars: "",
    num_classes: "",
    weather: "",
    duration_hours: "",
    duration_minutes: "",
  });
  const formattedDuration = useMemo(() => {
    if (!activeRace?.duration_hours) return "—";
    const hours = Math.floor(activeRace.duration_hours);
    const minutes = Math.round((activeRace.duration_hours - hours) * 60);
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  }, [activeRace?.duration_hours]);

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

      // Se não houver corrida ativa, busca a próxima corrida futura
      const { data: nextRaceData, error: nextRaceError } = await supabase
        .from("races")
        .select("*")
        .gt("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!nextRaceError && nextRaceData) {
        setNextRace(nextRaceData);
      }

      setLoading(false);
    };

    fetchActiveRace();
  }, []);

  const openEditDialog = () => {
    if (!activeRace) return;
    const totalHours = activeRace.duration_hours || 0;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    
    setEditForm({
      name: activeRace.name,
      track: activeRace.track,
      num_cars: activeRace.num_cars?.toString() || "",
      num_classes: activeRace.num_classes?.toString() || "",
      weather: activeRace.weather || "",
      duration_hours: hours > 0 ? hours.toString() : "",
      duration_minutes: minutes > 0 ? minutes.toString() : "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRace) return;

    setSubmitting(true);
    
    // Convert hours and minutes to decimal hours
    const hours = editForm.duration_hours ? parseInt(editForm.duration_hours, 10) : 0;
    const minutes = editForm.duration_minutes ? parseInt(editForm.duration_minutes, 10) : 0;
    const totalHours = hours + (minutes / 60);
    
    const updateData = {
      name: editForm.name,
      track: editForm.track,
      num_cars: editForm.num_cars ? parseInt(editForm.num_cars, 10) : null,
      num_classes: editForm.num_classes ? parseInt(editForm.num_classes, 10) : null,
      weather: editForm.weather || null,
      duration_hours: totalHours > 0 ? totalHours : null,
    };

    const { data, error } = await supabase
      .from("races")
      .update(updateData)
      .eq("id", activeRace.id)
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } else {
      toast({ title: "Corrida atualizada!" });
      setActiveRace(data);
      setEditDialogOpen(false);
    }
  };

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

            {/* Countdown for next race (when no active race) */}
            {!activeRace && nextRace && nextRace.date && (
              <Countdown targetDate={nextRace.date} raceName={nextRace.name} />
            )}

            {activeRace && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative inline-flex items-center gap-6 px-6 py-4 rounded-xl bg-card border border-border"
              >
                {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-card border border-border hover:bg-primary/20"
                    onClick={openEditDialog}
                    title="Editar corrida"
                  >
                    <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                  </Button>
                )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * 0 }}
              className="text-center"
            >
              <Car className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="font-racing text-2xl font-bold">{activeRace?.num_cars ?? "—"}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Carros</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * 1 }}
              className="text-center"
            >
              <Layers className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="font-racing text-2xl font-bold">{activeRace?.num_classes ?? "—"}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {activeRace?.num_classes === 1 ? "Classe" : "Classes"}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * 2 }}
              className="text-center"
            >
              <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="font-racing text-2xl font-bold">
                {formattedDuration}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Duração</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * 3 }}
              className="text-center"
            >
              {activeRace?.weather ? (
                (() => {
                  const WeatherIcon =
                    activeRace.weather === "sol"
                      ? Sun
                      : activeRace.weather === "chuva"
                        ? CloudRain
                        : Cloud;
                  return <WeatherIcon className="h-5 w-5 mx-auto mb-2 text-primary" />;
                })()
              ) : (
                <Cloud className="h-5 w-5 mx-auto mb-2 text-primary" />
              )}
              {activeRace?.weather ? (
                <p className="font-racing text-2xl font-bold capitalize">
                  {activeRace.weather}
                </p>
              ) : (
                <p className="font-racing text-2xl font-bold">—</p>
              )}
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Metereologia</p>
            </motion.div>
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
            <RaceDrivers driverIds={activeRace?.drivers} />
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

      {/* Edit Race Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-racing">Editar Corrida</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRace} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-race-name">Nome da Corrida</Label>
                <Input
                  id="edit-race-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-race-track">Pista</Label>
                <Input
                  id="edit-race-track"
                  value={editForm.track}
                  onChange={(e) =>
                    setEditForm({ ...editForm, track: e.target.value })
                  }
                  required
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-num-cars">Número de Carros</Label>
                <Input
                  id="edit-num-cars"
                  type="number"
                  min="0"
                  value={editForm.num_cars}
                  onChange={(e) =>
                    setEditForm({ ...editForm, num_cars: e.target.value })
                  }
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-num-classes">Número de Classes</Label>
                <Input
                  id="edit-num-classes"
                  type="number"
                  min="0"
                  value={editForm.num_classes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, num_classes: e.target.value })
                  }
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-weather">Tempo</Label>
                <Select
                  value={editForm.weather}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, weather: value })
                  }
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Selecionar tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sol">Sol</SelectItem>
                    <SelectItem value="chuva">Chuva</SelectItem>
                    <SelectItem value="nublado">Nublado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration-hours">Duração - Horas</Label>
                <Input
                  id="edit-duration-hours"
                  type="number"
                  min="0"
                  max="99"
                  placeholder="ex: 2, 6, 24"
                  value={editForm.duration_hours}
                  onChange={(e) =>
                    setEditForm({ ...editForm, duration_hours: e.target.value })
                  }
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration-minutes">Duração - Minutos</Label>
                <Input
                  id="edit-duration-minutes"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="ex: 0, 30, 45"
                  value={editForm.duration_minutes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, duration_minutes: e.target.value })
                  }
                  className="bg-secondary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
