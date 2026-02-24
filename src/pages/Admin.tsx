import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Flag, Loader2, Trash2, Cloud, Map, Upload, X } from "lucide-react";
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
import { MultiSelectDrivers } from "@/components/ui/multi-select-drivers";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
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
  const { isAdmin, loading: adminLoading } = useIsAdmin();
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
    tipo: "" as "vsca" | "iracing" | "",
    is_active: true,
    num_cars: "",
    num_classes: "",
    weather: "",
    drivers: [] as string[],
    duration_hours: "",
    duration_minutes: "",
  });
  const [newRaceGroups, setNewRaceGroups] = useState<{ name: string; driverIds: string[] }[]>([]);
  const [newRaceWeatherFile, setNewRaceWeatherFile] = useState<File | null>(null);
  const [newRaceMapFile, setNewRaceMapFile] = useState<File | null>(null);
  const [newRaceWeatherPreview, setNewRaceWeatherPreview] = useState<string | null>(null);
  const [newRaceMapPreview, setNewRaceMapPreview] = useState<string | null>(null);
  const newRaceWeatherRef = useRef<HTMLInputElement>(null);
  const newRaceMapRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/login");
      } else if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Não tens permissão para aceder a esta página.",
        });
        navigate("/");
      }
    }
  }, [user, authLoading, adminLoading, isAdmin, navigate, toast]);

  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .order("date", { ascending: false });

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

    if (user && isAdmin && !adminLoading) fetchRaces();
  }, [user, isAdmin, adminLoading, location.state]);

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaceForm.tipo) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Seleciona o tipo da corrida.",
      });
      return;
    }
    setSubmitting(true);

    // Deactivate other races if this one is active
    if (newRaceForm.is_active) {
      await supabase.from("races").update({ is_active: false }).eq("is_active", true);
    }

    // Convert hours and minutes to decimal hours
    const hours = newRaceForm.duration_hours ? parseInt(newRaceForm.duration_hours, 10) : 0;
    const minutes = newRaceForm.duration_minutes ? parseInt(newRaceForm.duration_minutes, 10) : 0;
    const totalHours = hours + (minutes / 60);
    
    const raceData = {
      name: newRaceForm.name,
      track: newRaceForm.track,
      tipo: newRaceForm.tipo as "vsca" | "iracing",
      is_active: newRaceForm.is_active,
      num_cars: newRaceForm.num_cars ? parseInt(newRaceForm.num_cars, 10) : null,
      num_classes: newRaceForm.num_classes ? parseInt(newRaceForm.num_classes, 10) : null,
      weather: newRaceForm.weather || null,
      drivers: newRaceForm.drivers.length > 0 ? newRaceForm.drivers : null,
      duration_hours: totalHours > 0 ? totalHours : null,
      driver_groups: newRaceGroups.length > 0
        ? Object.fromEntries(newRaceGroups.map((g) => [g.name, g.driverIds]))
        : null,
    };

    const { data, error } = await supabase
      .from("races")
      .insert([raceData])
      .select()
      .single();

    if (error) {
      setSubmitting(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
      return;
    }

    const newRaceId = data.id;

    // Upload optional images
    const uploadImage = async (file: File, type: "weather" | "map") => {
      const bucket = type === "weather" ? "track-weather" : "track-images";
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${newRaceId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

      const { data: imageData, error: imageError } = await supabase
        .from("images")
        .insert({
          storage_path: filePath,
          url: publicUrl,
          filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          description: type === "weather" ? "Weather forecast" : "Track map",
          category: type === "weather" ? "weather" : "track-map",
        })
        .select()
        .single();

      if (imageError) throw imageError;
      return imageData;
    };

    try {
      const weatherImage = newRaceWeatherFile ? await uploadImage(newRaceWeatherFile, "weather") : null;
      const mapImage = newRaceMapFile ? await uploadImage(newRaceMapFile, "map") : null;

      if (weatherImage || mapImage) {
        await supabase.from("track_info").insert({
          race_id: newRaceId,
          ...(weatherImage ? { weather_image_id: weatherImage.id } : {}),
          ...(mapImage ? { track_map_id: mapImage.id } : {}),
        });
      }
    } catch (imgError: any) {
      toast({
        variant: "destructive",
        title: "Corrida criada, mas erro ao carregar imagem",
        description: imgError.message,
      });
    }

    setSubmitting(false);
    toast({ title: "Corrida criada!" });
    setRaces([data, ...races]);
    setSelectedRace(data.id);
    setShowNewRace(false);
    setNewRaceForm({ name: "", track: "", tipo: "", is_active: true, num_cars: "", num_classes: "", weather: "", drivers: [], duration_hours: "", duration_minutes: "" });
    setNewRaceGroups([]);
    setNewRaceWeatherFile(null);
    setNewRaceMapFile(null);
    setNewRaceWeatherPreview(null);
    setNewRaceMapPreview(null);
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
          const { data: finishedRace, error: updateError } = await supabase
            .from("races")
            .update({ is_active: false })
            .eq("id", selectedRace)
            .select("date")
            .single();

          if (updateError) {
            toast({
              variant: "destructive",
              title: "Erro",
              description: updateError.message,
            });
          } else {
            // Ativar a próxima corrida (por data)
            if (finishedRace?.date) {
              const { data: nextRaces } = await supabase
                .from("races")
                .select("id")
                .gt("date", finishedRace.date)
                .order("date", { ascending: true })
                .limit(1);

              if (nextRaces && nextRaces.length > 0) {
                await supabase
                  .from("races")
                  .update({ is_active: true })
                  .eq("id", nextRaces[0].id);
              }
            }
            toast({ title: "Corrida finalizada!" });
          }
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

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // If user is authenticated but not admin, show nothing (redirect will happen in useEffect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-racing text-2xl sm:text-3xl font-bold">Painel Admin</h1>
              <p className="text-muted-foreground">
                Adiciona ocorrências em tempo real
              </p>
            </div>
            <Button onClick={() => setShowNewRace(!showNewRace)} variant="outline" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Corrida
            </Button>
          </div>

          {/* New Race Form */}
          {showNewRace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="card-racing p-4 sm:p-6 mb-6"
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={newRaceForm.tipo}
                      onValueChange={(v) =>
                        setNewRaceForm({ ...newRaceForm, tipo: v as "vsca" | "iracing" })
                      }
                      required
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vsca">VSCA</SelectItem>
                        <SelectItem value="iracing">iRacing</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="space-y-2">
                    <Label htmlFor="duration-hours">Duração - Horas</Label>
                    <Input
                      id="duration-hours"
                      type="number"
                      min="0"
                      max="99"
                      placeholder="ex: 2, 6, 24"
                      value={newRaceForm.duration_hours}
                      onChange={(e) =>
                        setNewRaceForm({ ...newRaceForm, duration_hours: e.target.value })
                      }
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration-minutes">Duração - Minutos</Label>
                    <Input
                      id="duration-minutes"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="ex: 0, 30, 45"
                      value={newRaceForm.duration_minutes}
                      onChange={(e) =>
                        setNewRaceForm({ ...newRaceForm, duration_minutes: e.target.value })
                      }
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <MultiSelectDrivers
                      selectedIds={newRaceForm.drivers}
                      onChange={(ids) =>
                        setNewRaceForm({ ...newRaceForm, drivers: ids })
                      }
                      label="Pilotos a Participar"
                    />
                  </div>

                  {/* Driver groups */}
                  <div className="space-y-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Agrupamentos de Equipa <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() =>
                          setNewRaceGroups([...newRaceGroups, { name: `Equipa ${newRaceGroups.length + 1}`, driverIds: [] }])
                        }
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar grupo
                      </Button>
                    </div>
                    {newRaceGroups.map((group, gi) => {
                      const usedByOthers = newRaceGroups
                        .filter((_, i) => i !== gi)
                        .flatMap((g) => g.driverIds);
                      const availableIds = newRaceForm.drivers.filter(
                        (id) => !usedByOthers.includes(id)
                      );
                      return (
                        <div key={gi} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={group.name}
                              onChange={(e) => {
                                const updated = [...newRaceGroups];
                                updated[gi] = { ...group, name: e.target.value };
                                setNewRaceGroups(updated);
                              }}
                              className="bg-background h-8 text-sm font-racing"
                              placeholder="Nome da equipa"
                            />
                            <button
                              type="button"
                              onClick={() => setNewRaceGroups(newRaceGroups.filter((_, i) => i !== gi))}
                              className="rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <MultiSelectDrivers
                            selectedIds={group.driverIds}
                            onChange={(ids) => {
                              const updated = [...newRaceGroups];
                              updated[gi] = { ...group, driverIds: ids };
                              setNewRaceGroups(updated);
                            }}
                            filterIds={[...availableIds, ...group.driverIds]}
                            label="Pilotos deste grupo"
                          />
                        </div>
                      );
                    })}
                    {newRaceGroups.length > 0 && newRaceForm.drivers.length === 0 && (
                      <p className="text-xs text-muted-foreground">Seleciona primeiro os pilotos a participar para os poder distribuir por grupos.</p>
                    )}
                  </div>

                  {/* Weather image upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Cloud className="h-3.5 w-3.5 text-primary" />
                      Previsão do Tempo <span className="text-xs text-muted-foreground">(opcional)</span>
                    </Label>
                    <input
                      ref={newRaceWeatherRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewRaceWeatherFile(file);
                          setNewRaceWeatherPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {newRaceWeatherPreview ? (
                      <div className="relative">
                        <img
                          src={newRaceWeatherPreview}
                          alt="Previsão do tempo"
                          className="w-full rounded-lg object-cover max-h-40"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewRaceWeatherFile(null);
                            setNewRaceWeatherPreview(null);
                            if (newRaceWeatherRef.current) newRaceWeatherRef.current.value = "";
                          }}
                          className="absolute top-1 right-1 rounded-full bg-black/70 text-white p-1 hover:bg-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-dashed"
                        onClick={() => newRaceWeatherRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Carregar imagem
                      </Button>
                    )}
                  </div>

                  {/* Track map upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Map className="h-3.5 w-3.5 text-primary" />
                      Mapa da Pista <span className="text-xs text-muted-foreground">(opcional)</span>
                    </Label>
                    <input
                      ref={newRaceMapRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewRaceMapFile(file);
                          setNewRaceMapPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {newRaceMapPreview ? (
                      <div className="relative">
                        <img
                          src={newRaceMapPreview}
                          alt="Mapa da pista"
                          className="w-full rounded-lg object-cover max-h-40"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewRaceMapFile(null);
                            setNewRaceMapPreview(null);
                            if (newRaceMapRef.current) newRaceMapRef.current.value = "";
                          }}
                          className="absolute top-1 right-1 rounded-full bg-black/70 text-white p-1 hover:bg-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-dashed"
                        onClick={() => newRaceMapRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Carregar imagem
                      </Button>
                    )}
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
          <div className="card-racing p-4 sm:p-6 mb-6">
            <Label className="mb-2 block">Corrida Ativa</Label>
            <Select value={selectedRace} onValueChange={setSelectedRace}>
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Selecionar corrida" />
              </SelectTrigger>
              <SelectContent>
                {races.map((race) => (
                  <SelectItem key={race.id} value={race.id}>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        {race.is_active && (
                          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        )}
                        <span className="truncate">{race.name} - {race.track}</span>
                      </div>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {new Date(race.date).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Event Form */}
          <div className="card-racing p-4 sm:p-6">
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
                  className="bg-secondary min-h-[100px]"
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
