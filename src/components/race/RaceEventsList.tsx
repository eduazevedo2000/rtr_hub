import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { RaceEventCard } from "./RaceEventCard";
import { Link, Loader2, Plus, Radio, RefreshCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";

type RaceEvent = Database["public"]["Tables"]["race_events"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type EventType = Database["public"]["Tables"]["event_types"]["Row"];
type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type RaceEventType = Database["public"]["Enums"]["race_event_type"];

interface RaceEventsListProps {
  raceId?: string;
}

export function RaceEventsList({ raceId }: RaceEventsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || "");
  const [spin, setSpin] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RaceEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    lap: "",
    description: "",
    event_type: "other" as RaceEventType,
    position: "",
    driver: "",
    clip_url: "",
    category: "GERAL",
  });

  useEffect(() => {
    getCategories();
    getEventTypes();
    getDrivers();
    fetchEvents();

  // Set up realtime subscription
  const channel = supabase
    .channel("race_events_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "race_events",
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          setEvents((prev) => [payload.new as RaceEvent, ...prev]);
        } else if (payload.eventType === "DELETE") {
          setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
        } else if (payload.eventType === "UPDATE") {
          setEvents((prev) =>
            prev.map((e) => (e.id === payload.new.id ? (payload.new as RaceEvent) : e))
          );
        }
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [raceId]);

  const getCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    if (data) {
      setCategories(data.filter((category) => category.name !== "GERAL"));
      setSelectedCategory(data[0]?.name || "");
    }
  };

  const getEventTypes = async () => {
    const { data, error } = await supabase
      .from("event_types")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching event types:", error);
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

  const fetchEvents = async () => {
    let query = supabase
      .from("race_events")
      .select("*")
      .order("lap", { ascending: false })
      .order("created_at", { ascending: false });

    if (raceId) {
      query = query.eq("race_id", raceId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const handleEditEvent = (event: RaceEvent) => {
    setEditingEvent(event);
    setEditForm({
      lap: event.lap.toString(),
      description: event.description,
      event_type: event.event_type,
      position: event.position || "",
      driver: event.driver || "",
      clip_url: event.clip_url || "",
      category: event.category || "GERAL",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSubmitting(true);
    const { error } = await supabase
      .from("race_events")
      .update({
        lap: parseInt(editForm.lap),
        description: editForm.description,
        event_type: editForm.event_type,
        position: editForm.position ? editForm.position.toUpperCase() : null,
        driver: editForm.driver || null,
        clip_url: editForm.clip_url || null,
        category: editForm.category || null,
      })
      .eq("id", editingEvent.id);

    setSubmitting(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } else {
      toast({ title: "Ocorrência atualizada!" });
      setEditDialogOpen(false);
      setEditingEvent(null);
    }
  };

  // Filter drivers by selected category (or all if GERAL)
  const filteredDrivers = useMemo(() => {
    if (editForm.category === "GERAL" || !editForm.category) {
      return drivers;
    }
    return drivers.filter((driver) => driver.category === editForm.category);
  }, [drivers, editForm.category]);

  // Filter events by selected category + GERAL category
  const filteredEvents = useMemo(() => {
    return events.filter((event) => 
      event.category === selectedCategory || event.category === "GERAL"
    );
  }, [events, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="card-racing p-8 text-center">
        <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-racing text-lg mb-2">Sem ocorrências</h3>
        <p className="text-sm text-muted-foreground">
          As ocorrências da corrida aparecerão aqui em tempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-racing uppercase tracking-wider text-muted-foreground">
            Live Feed
          </span>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              fetchEvents();
              setSpin((s) => s + 360);
            }}
            className={`h-8 w-8 shrink-0 ${categories.length > 0 ? "rounded-r-none border-r-0" : ""}`}
          >
            <motion.span
              animate={{ rotate: spin }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="inline-flex"
            >
              <RefreshCcw className="h-4 w-4" />
            </motion.span>
          </Button>
          {categories.length > 0 && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8 w-[140px] shrink-0 rounded-l-none border-l-0 text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      {filteredEvents.length === 0 ? (
        <div className="card-racing p-8 text-center">
          <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-racing text-lg mb-2">Sem ocorrências</h3>
          <p className="text-sm text-muted-foreground">
            Não há eventos para a categoria selecionada.
          </p>
        </div>
      ) : (
        filteredEvents.map((event, index) => (
          <RaceEventCard
            key={event.id}
            event={event}
            index={index}
            onEdit={handleEditEvent}
          />
        ))
      )}

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-racing">Editar Ocorrência</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEvent} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-lap">Volta</Label>
                <Input
                  id="edit-lap"
                  type="number"
                  placeholder="25"
                  value={editForm.lap}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lap: e.target.value })
                  }
                  required
                  min={1}
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select
                  value={editForm.category || "GERAL"}
                  onValueChange={(v) => {
                    const newCategory = v as string;
                    // Se mudou a categoria e o driver atual não pertence à nova categoria, limpar driver
                    const currentDriver = drivers.find((d) => d.name === editForm.driver);
                    const shouldClearDriver =
                      editForm.driver &&
                      currentDriver &&
                      newCategory !== "GERAL" &&
                      currentDriver.category !== newCategory;
                    setEditForm({
                      ...editForm,
                      category: newCategory,
                      driver: shouldClearDriver ? "" : editForm.driver,
                    });
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
                    <SelectItem value="GERAL">GERAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-type">Tipo de Evento</Label>
                <Select
                  value={editForm.event_type}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, event_type: v as RaceEventType })
                  }
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
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Ultrapassagem na T1 para P6"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                required
                className="bg-secondary min-h-[80px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-position">Posição (opcional)</Label>
                <Input
                  id="edit-position"
                  placeholder="6"
                  value={editForm.position}
                  onChange={(e) =>
                    setEditForm({ ...editForm, position: e.target.value })
                  }
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-driver">Piloto (opcional)</Label>
                <Select
                  value={editForm.driver}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, driver: value })
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

            <div className="space-y-2">
              <Label htmlFor="edit-clip-url">Link do Clip (opcional)</Label>
              <Input
                id="edit-clip-url"
                type="url"
                placeholder="https://clips.twitch.tv/..."
                value={editForm.clip_url}
                onChange={(e) =>
                  setEditForm({ ...editForm, clip_url: e.target.value })
                }
                className="bg-secondary"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingEvent(null);
                }}
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
}
