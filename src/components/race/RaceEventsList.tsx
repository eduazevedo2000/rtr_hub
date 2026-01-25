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
import type { Database } from "@/integrations/supabase/types";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";

type RaceEvent = Database["public"]["Tables"]["race_events"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
interface RaceEventsListProps {
  raceId?: string;
}

export function RaceEventsList({ raceId }: RaceEventsListProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || "");
  const [spin, setSpin] = useState(0);

  useEffect(() => {
  getCategories();
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
    const { data, error } = await supabase
    .from("categories")
    .select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  if (data) {
    setCategories(data.filter((category) => category.name !== "GERAL")); 
    setSelectedCategory(data[0]?.name || "");
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
          <RaceEventCard key={event.id} event={event} index={index} />
        ))
      )}
    </div>
  );
}
