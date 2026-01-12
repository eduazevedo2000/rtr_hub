import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Flag, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Race = Database["public"]["Tables"]["races"]["Row"];
type RaceEventType = Database["public"]["Enums"]["race_event_type"];

const eventTypes: { value: RaceEventType; label: string }[] = [
  { value: "race_start", label: "🏁 Partida" },
  { value: "pit_stop", label: "⛽ Pit Stop" },
  { value: "position_change", label: "📊 Mudança de Posição" },
  { value: "fcy_short", label: "🟡 Short FCY" },
  { value: "fcy_long", label: "🟡 Long FCY" },
  { value: "incident", label: "⚠️ Incidente" },
  { value: "driver_change", label: "👥 Troca de Piloto" },
  { value: "restart", label: "🟢 Restart" },
  { value: "finish", label: "🏆 Fim de Corrida" },
  { value: "other", label: "📝 Outro" },
];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    lap: "",
    description: "",
    event_type: "other" as RaceEventType,
    position: "",
    driver: "",
    clip_url: "",
  });

  // New race form state
  const [showNewRace, setShowNewRace] = useState(false);
  const [newRaceForm, setNewRaceForm] = useState({
    name: "",
    track: "",
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRaces(data);
        const active = data.find((r) => r.is_active);
        if (active) setSelectedRace(active.id);
      }
      setLoading(false);
    };

    if (user) fetchRaces();
  }, [user]);

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Deactivate other races if this one is active
    if (newRaceForm.is_active) {
      await supabase.from("races").update({ is_active: false }).eq("is_active", true);
    }

    const { data, error } = await supabase
      .from("races")
      .insert([newRaceForm])
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
      toast({ title: "Corrida criada!" });
      setRaces([data, ...races]);
      setSelectedRace(data.id);
      setShowNewRace(false);
      setNewRaceForm({ name: "", track: "", is_active: true });
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRace) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Seleciona uma corrida primeiro.",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("race_events").insert([
      {
        race_id: selectedRace,
        lap: parseInt(eventForm.lap),
        description: eventForm.description,
        event_type: eventForm.event_type,
        position: eventForm.position || null,
        driver: eventForm.driver || null,
        clip_url: eventForm.clip_url || null,
      },
    ]);

    setSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } else {
      toast({ title: "Ocorrência adicionada!" });
      setEventForm({
        lap: eventForm.lap, // Keep the lap for convenience
        description: "",
        event_type: "other",
        position: "",
        driver: "",
        clip_url: "",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-racing text-3xl font-bold">Painel Admin</h1>
              <p className="text-muted-foreground">
                Adiciona ocorrências em tempo real
              </p>
            </div>
            <Button onClick={() => setShowNewRace(!showNewRace)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nova Corrida
            </Button>
          </div>

          {/* New Race Form */}
          {showNewRace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="card-racing p-6 mb-6"
            >
              <h2 className="font-racing text-lg mb-4">Criar Nova Corrida</h2>
              <form onSubmit={handleCreateRace} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="raceName">Nome da Corrida</Label>
                    <Input
                      id="raceName"
                      placeholder="24h Spa 2024"
                      value={newRaceForm.name}
                      onChange={(e) =>
                        setNewRaceForm({ ...newRaceForm, name: e.target.value })
                      }
                      required
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="raceTrack">Pista</Label>
                    <Input
                      id="raceTrack"
                      placeholder="Spa-Francorchamps"
                      value={newRaceForm.track}
                      onChange={(e) =>
                        setNewRaceForm({ ...newRaceForm, track: e.target.value })
                      }
                      required
                      className="bg-secondary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowNewRace(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Corrida
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Race Selector */}
          <div className="card-racing p-6 mb-6">
            <Label className="mb-2 block">Corrida Ativa</Label>
            <Select value={selectedRace} onValueChange={setSelectedRace}>
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Selecionar corrida" />
              </SelectTrigger>
              <SelectContent>
                {races.map((race) => (
                  <SelectItem key={race.id} value={race.id}>
                    <div className="flex items-center gap-2">
                      {race.is_active && (
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                      {race.name} - {race.track}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Event Form */}
          <div className="card-racing p-6">
            <div className="flex items-center gap-2 mb-6">
              <Flag className="h-5 w-5 text-primary" />
              <h2 className="font-racing text-lg">Adicionar Ocorrência</h2>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lap">Volta</Label>
                  <Input
                    id="lap"
                    type="number"
                    placeholder="25"
                    value={eventForm.lap}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, lap: e.target.value })
                    }
                    required
                    min={1}
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Tipo de Evento</Label>
                  <Select
                    value={eventForm.event_type}
                    onValueChange={(v) =>
                      setEventForm({ ...eventForm, event_type: v as RaceEventType })
                    }
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Ultrapassagem na T1 para P6"
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  required
                  className="bg-secondary min-h-[80px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Posição (opcional)</Label>
                  <Input
                    id="position"
                    placeholder="P6"
                    value={eventForm.position}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, position: e.target.value })
                    }
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver">Piloto (opcional)</Label>
                  <Input
                    id="driver"
                    placeholder="Rodrigo Marreiros"
                    value={eventForm.driver}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, driver: e.target.value })
                    }
                    className="bg-secondary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clipUrl">Link do Clip (opcional)</Label>
                <Input
                  id="clipUrl"
                  type="url"
                  placeholder="https://clips.twitch.tv/..."
                  value={eventForm.clip_url}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, clip_url: e.target.value })
                  }
                  className="bg-secondary"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !selectedRace}
                className="w-full btn-racing"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Ocorrência
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
