import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RaceEventCard } from "./RaceEventCard";
import { Loader2, Radio } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RaceEvent = Database["public"]["Tables"]["race_events"]["Row"];

interface RaceEventsListProps {
  raceId?: string;
}

export function RaceEventsList({ raceId }: RaceEventsListProps) {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-racing uppercase tracking-wider text-muted-foreground">
          Live Feed
        </span>
      </div>
      {events.map((event, index) => (
        <RaceEventCard key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}
