import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
type Category = Database["public"]["Tables"]["categories"]["Row"];
type EventType = Database["public"]["Tables"]["event_types"]["Row"];
type Driver = Database["public"]["Tables"]["drivers"]["Row"];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Initialize form state - check location.state for edit event
  const getInitialFormState = () => {
    const editEvent = (location.state as any)?.editEvent;
    if (editEvent) {
      return {
        lap: editEvent.lap,
        description: editEvent.description,
        event_type: editEvent.event_type,
        position: editEvent.position || "",
        driver: editEvent.driver || "",
        clip_url: editEvent.clip_url || "",
        category: editEvent.category || "GERAL",
      };
    }
    return {
      lap: "",
      description: "",
      event_type: "other" as RaceEventType,
      position: "",
      driver: "",
      clip_url: "",
      category: "GERAL",
    };
  };

  // Event form state
  const [eventForm, setEventForm] = useState(getInitialFormState);
  
  // Position fields for finishing race (when category is GERAL, need 2 positions)
  const [positionLMP2, setPositionLMP2] = useState("");
  const [positionGT3PRO, setPositionGT3PRO] = useState("");

  const getCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*");

    if (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setCategories(data);
    }
  };

  const getEventTypes = async () => {
    const { data, error } = await supabase
      .from("event_types")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching event types:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de evento.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setEventTypes(data);
    }
  };

  const getDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching drivers:", error);
      return;
    }

    if (data) {
      setDrivers(data);
    }
  };

  // New race form state
  const [showNewRace, setShowNewRace] = useState(false);
  const [newRaceForm, setNewRaceForm] = useState({
    name: "",
    track: "",
    is_active: true,
    num_cars: "",
    num_classes: "",
    weather: "",
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
        
        // Check if we're editing an event from location state
        const editEvent = (location.state as any)?.editEvent;
        if (editEvent) {
          setEditingEventId(editEvent.id);
          setSelectedRace(editEvent.race_id);
          // Only update form if values are different to avoid unnecessary re-renders
          setEventForm((prev) => {
            if (prev.category === editEvent.category && 
                prev.lap === editEvent.lap &&
                prev.description === editEvent.description) {
              return prev; // No change needed
            }
            return {
              lap: editEvent.lap,
              description: editEvent.description,
              event_type: editEvent.event_type,
              position: editEvent.position || "",
              driver: editEvent.driver || "",
              clip_url: editEvent.clip_url || "",
              category: editEvent.category || "GERAL",
            };
          });
          // Clear the state to avoid re-applying on re-render
          window.history.replaceState({}, document.title);
        } else {
          // Only set active race if not editing
          const active = data.find((r) => r.is_active);
          if (active && !selectedRace) setSelectedRace(active.id);
        }
      }
      setLoading(false);
      getCategories();
      getEventTypes();
      getDrivers();
    };

    if (user) fetchRaces();
  }, [user, location.state]);

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Deactivate other races if this one is active
    if (newRaceForm.is_active) {
      await supabase.from("races").update({ is_active: false }).eq("is_active", true);
    }

    const raceData = {
      name: newRaceForm.name,
      track: newRaceForm.track,
      is_active: newRaceForm.is_active,
      num_cars: newRaceForm.num_cars ? parseInt(newRaceForm.num_cars, 10) : null,
      num_classes: newRaceForm.num_classes ? parseInt(newRaceForm.num_classes, 10) : null,
      weather: newRaceForm.weather || null,
    };

    const { data, error } = await supabase
      .from("races")
      .insert([raceData])
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
      setNewRaceForm({ name: "", track: "", is_active: true, num_cars: "", num_classes: "", weather: "" });
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

    // Se estiver editando, atualiza a ocorrência existente
    if (editingEventId) {
      const { error } = await supabase
        .from("race_events")
        .update({
          lap: parseInt(eventForm.lap),
          description: eventForm.description,
          event_type: eventForm.event_type,
          position: eventForm.position ? eventForm.position.toUpperCase() : null,
          driver: eventForm.driver || null,
          clip_url: eventForm.clip_url || null,
          category: eventForm.category || null,
        })
        .eq("id", editingEventId);

      setSubmitting(false);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message,
        });
      } else {
        setEditingEventId(null);
        setEventForm({
          lap: "",
          description: "",
          event_type: "other",
          position: "",
          driver: "",
          clip_url: "",
          category: "GERAL",
        });
        setPositionLMP2("");
        setPositionGT3PRO("");

        toast({ title: "Ocorrência atualizada!" });
      }
      return;
    }

    // Cria uma única ocorrência com a categoria selecionada (incluindo "GERAL")
    const { error } = await supabase.from("race_events").insert([
      {
        race_id: selectedRace,
        lap: parseInt(eventForm.lap),
        description: eventForm.description,
        event_type: eventForm.event_type,
        position: eventForm.position ? eventForm.position.toUpperCase() : null,
        driver: eventForm.driver || null,
        clip_url: eventForm.clip_url || null,
        category: eventForm.category || null,
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
        setEventForm({
          lap: eventForm.lap,
          description: "",
          event_type: "other",
          position: "",
          driver: "",
          clip_url: "",
          category: "GERAL",
        });
        
        // Reset position fields
        setPositionLMP2("");
        setPositionGT3PRO("");
        
        if (eventForm.event_type === "finish") {
          // Get race info for achievement
          const { data: raceData } = await supabase
            .from("races")
            .select("name, track, date")
            .eq("id", selectedRace)
            .single();

          if (raceData) {
            // Create achievement
            const { data: achievementData, error: achievementError } = await supabase
              .from("team_achievements")
              .insert([
                {
                  title: raceData.name,
                  description: eventForm.description || null,
                  date: new Date(raceData.date).getFullYear().toString(),
                  race_id: selectedRace,
                },
              ])
              .select()
              .single();

            if (achievementError) {
              toast({
                variant: "destructive",
                title: "Erro",
                description: achievementError.message,
              });
            } else if (achievementData) {
              // Insert positions based on category
              const positionsToInsert = [];
              
              if (eventForm.category === "GERAL") {
                // Insert both LMP2 and GT3 PRO positions
                if (positionLMP2) {
                  positionsToInsert.push({
                    achievement_id: achievementData.id,
                    category: "LMP2",
                    position_finished: positionLMP2.toUpperCase(),
                  });
                }
                if (positionGT3PRO) {
                  positionsToInsert.push({
                    achievement_id: achievementData.id,
                    category: "GT3 PRO",
                    position_finished: positionGT3PRO.toUpperCase(),
                  });
                }
              } else if (eventForm.category && eventForm.position) {
                // Insert single position for selected category
                positionsToInsert.push({
                  achievement_id: achievementData.id,
                  category: eventForm.category,
                  position_finished: eventForm.position.toUpperCase(),
                });
              }

              if (positionsToInsert.length > 0) {
                const { error: positionsError } = await supabase
                  .from("achievement_positions")
                  .insert(positionsToInsert);

                if (positionsError) {
                  toast({
                    variant: "destructive",
                    title: "Erro",
                    description: positionsError.message,
                  });
                }
              }
            }
          }

          // Update race to inactive
          const { error } = await supabase
            .from("races")
            .update({
              is_active: false,
            })
            .eq("id", selectedRace);

          if (error) {
            toast({
              variant: "destructive",
              title: "Erro",
              description: error.message,
            });
          }

          toast({ title: "Corrida finalizada!" });
        }
        else {
          toast({ title: "Ocorrência atualizada!" });
        }
    }
  };

  // Filter drivers by selected category (or all if GERAL)
  const filteredDrivers = useMemo(() => {
    if (eventForm.category === "GERAL" || !eventForm.category) {
      return drivers;
    }
    return drivers.filter((driver) => driver.category === eventForm.category);
  }, [drivers, eventForm.category]);

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
                  <div className="space-y-2">
                    <Label htmlFor="numCars">Número de Carros</Label>
                    <Input
                      id="numCars"
                      type="number"
                      min="0"
                      placeholder="Ex: 50"
                      value={newRaceForm.num_cars}
                      onChange={(e) =>
                        setNewRaceForm({ ...newRaceForm, num_cars: e.target.value })
                      }
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numClasses">Número de Classes</Label>
                    <Input
                      id="numClasses"
                      type="number"
                      min="0"
                      placeholder="Ex: 3"
                      value={newRaceForm.num_classes}
                      onChange={(e) =>
                        setNewRaceForm({ ...newRaceForm, num_classes: e.target.value })
                      }
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="weather">Tempo</Label>
                    <Select
                      value={newRaceForm.weather}
                      onValueChange={(value) =>
                        setNewRaceForm({ ...newRaceForm, weather: value })
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                <h2 className="font-racing text-lg">
                  {editingEventId ? "Editar Ocorrência" : "Adicionar Ocorrência"}
                </h2>
              </div>
              {editingEventId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingEventId(null);
                    setEventForm({
                      lap: "",
                      description: "",
                      event_type: "other",
                      position: "",
                      driver: "",
                      clip_url: "",
                      category: "",
                    });
                    setPositionLMP2("");
                    setPositionGT3PRO("");
                  }}
                >
                  Cancelar Edição
                </Button>
              )}
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
                  <Label htmlFor="lap">Categoria</Label>
                  <Select
                    value={eventForm.category || "GERAL"}
                    onValueChange={(v) => {
                      const newCategory = v as string;
                      // Se mudou a categoria e o driver atual não pertence à nova categoria, limpar driver
                      const currentDriver = drivers.find((d) => d.name === eventForm.driver);
                      const shouldClearDriver =
                        eventForm.driver &&
                        currentDriver &&
                        newCategory !== "GERAL" &&
                        currentDriver.category !== newCategory;
                      setEventForm({
                        ...eventForm,
                        category: newCategory,
                        driver: shouldClearDriver ? "" : eventForm.driver,
                      });
                      // Clear position fields when category changes (if finishing race)
                      if (eventForm.event_type === "finish") {
                        setPositionLMP2("");
                        setPositionGT3PRO("");
                        setEventForm((prev) => ({ ...prev, position: "" }));
                      }
                    }}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">Tipo de Evento</Label>
                  <Select
                    value={eventForm.event_type}
                    onValueChange={(v) => {
                      setEventForm({ ...eventForm, event_type: v as RaceEventType });
                      // Clear position fields when changing event type
                      if (v !== "finish") {
                        setPositionLMP2("");
                        setPositionGT3PRO("");
                      }
                    }}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.value}>
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

              {/* Position fields - only show when finishing race */}
              {eventForm.event_type === "finish" ? (
                eventForm.category === "GERAL" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="positionLMP2">Posição Final - LMP2</Label>
                      <Input
                        id="positionLMP2"
                        placeholder="1"
                        value={positionLMP2}
                        onChange={(e) => setPositionLMP2(e.target.value)}
                        className="bg-secondary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="positionGT3PRO">Posição Final - GT3 PRO</Label>
                      <Input
                        id="positionGT3PRO"
                        placeholder="1"
                        value={positionGT3PRO}
                        onChange={(e) => setPositionGT3PRO(e.target.value)}
                        className="bg-secondary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="position">Posição Final - {eventForm.category}</Label>
                    <Input
                      id="position"
                      placeholder="6"
                      value={eventForm.position}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, position: e.target.value })
                      }
                      className="bg-secondary"
                    />
                  </div>
                )
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="position">Posição (opcional)</Label>
                    <Input
                      id="position"
                      placeholder="6"
                      value={eventForm.position}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, position: e.target.value })
                      }
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver">Piloto (opcional)</Label>
                    <Select
                      value={eventForm.driver}
                      onValueChange={(value) =>
                        setEventForm({ ...eventForm, driver: value })
                      }
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Selecionar piloto" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.name}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

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
                    {editingEventId ? (
                      <>
                        <Flag className="h-4 w-4 mr-2" />
                        Atualizar Ocorrência
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Ocorrência
                      </>
                    )}
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
