import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Cloud, Map, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TrackInfoType = Database["public"]["Tables"]["track_info"]["Row"];

interface TrackInfoProps {
  raceId?: string;
}

export function TrackInfo({ raceId }: TrackInfoProps) {
  const [info, setInfo] = useState<TrackInfoType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!raceId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("track_info")
        .select("*")
        .eq("race_id", raceId)
        .maybeSingle();

      if (!error && data) {
        setInfo(data);
      }
      setLoading(false);
    };

    fetchInfo();
  }, [raceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Weather Card */}
      <div className="card-racing p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="h-4 w-4 text-primary" />
          <h3 className="font-racing text-sm uppercase tracking-wider">Previsão do Tempo</h3>
        </div>
        {info?.weather_image_url ? (
          <div className="space-y-2">
            <img
              src={info.weather_image_url}
              alt="Weather forecast"
              className="w-full rounded-lg"
            />
            {info.weather_description && (
              <p className="text-sm text-muted-foreground">{info.weather_description}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem informação disponível</p>
        )}
      </div>

      {/* Track Map Card */}
      <div className="card-racing p-4">
        <div className="flex items-center gap-2 mb-3">
          <Map className="h-4 w-4 text-primary" />
          <h3 className="font-racing text-sm uppercase tracking-wider">Mapa da Pista</h3>
        </div>
        {info?.track_map_url ? (
          <img
            src={info.track_map_url}
            alt="Track map"
            className="w-full rounded-lg"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Sem mapa disponível</p>
        )}
      </div>
    </div>
  );
}
