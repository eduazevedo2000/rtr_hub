import { motion } from "framer-motion";
import { Flag, Fuel, AlertTriangle, Users, Play, Clock, Edit, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type RaceEvent = Database["public"]["Tables"]["race_events"]["Row"];

const eventTypeConfig: Record<string, { icon: typeof Flag; className: string; label: string }> = {
  race_start: { icon: Play, className: "event-green", label: "Partida" },
  pit_stop: { icon: Fuel, className: "event-pit", label: "Pit Stop" },
  position_change: { icon: Flag, className: "event-green", label: "Posição" },
  fcy_short: { icon: AlertTriangle, className: "event-fcy", label: "Short FCY" },
  fcy_long: { icon: AlertTriangle, className: "event-fcy", label: "Long FCY" },
  incident: { icon: AlertTriangle, className: "event-incident", label: "Incidente" },
  driver_change: { icon: Users, className: "event-pit", label: "Troca Piloto" },
  restart: { icon: Flag, className: "event-green", label: "Restart" },
  finish: { icon: Flag, className: "event-green", label: "Fim" },
  qualification: { icon: Timer, className: "event-pit", label: "Qualificação" },
  other: { icon: Clock, className: "event-pit", label: "Outro" },
};

interface RaceEventCardProps {
  event: RaceEvent;
  index: number;
}

export function RaceEventCard({ event, index }: RaceEventCardProps) {
  const config = eventTypeConfig[event.event_type] || eventTypeConfig.other;
  const Icon = config.icon;
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEdit = () => {
    navigate("/admin", {
      state: {
        editEvent: {
          id: event.id,
          race_id: event.race_id,
          lap: event.lap.toString(),
          description: event.description,
          event_type: event.event_type,
          position: event.position || "",
          driver: event.driver || "",
          clip_url: event.clip_url || "",
          category: event.category || "",
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`card-racing p-4 ${config.className}`}
    >
      <div className="flex items-start gap-4">
        <div className="lap-badge">
          <span>L{event.lap}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-racing uppercase tracking-wider text-muted-foreground">
              {config.label}
            </span>
            {event.position && (
              <span className={`position-badge ${event.position === 'P1' ? 'p1' : event.position === 'P2' ? 'p2' : event.position === 'P3' ? 'p3' : 'bg-secondary'}`}>
                {event.position}
              </span>
            )}
          </div>
          
          <p className="text-sm text-foreground">
            {event.description}
          </p>
          
          {event.driver && (
            <p className="text-xs text-muted-foreground mt-1">
              Piloto: {event.driver}
            </p>
          )}
          
          {event.clip_url && (
            <a
              href={event.clip_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              <Play className="h-3 w-3" />
              Ver Clip
            </a>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(event.created_at).toLocaleTimeString("pt-PT", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-primary/20"
              onClick={handleEdit}
              title="Editar ocorrência"
            >
              <Edit className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
