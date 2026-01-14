import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Cloud, Map, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TrackInfoRow = Database["public"]["Tables"]["track_info"]["Row"];
type ImageRow = Database["public"]["Tables"]["images"]["Row"];

type TrackInfoType = TrackInfoRow & {
  weather_image?: ImageRow;
  track_map?: ImageRow;
};

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

      const { data: trackInfoData, error: trackInfoError } = await supabase
        .from("track_info")
        .select("*")
        .eq("race_id", raceId)
        .maybeSingle();

      if (trackInfoError || !trackInfoData) {
        setLoading(false);
        return;
      }

      // Buscar as imagens separadamente
      const imageIds: string[] = [];
      if ((trackInfoData as any).weather_image_id) {
        imageIds.push((trackInfoData as any).weather_image_id);
      }
      if ((trackInfoData as any).track_map_id) {
        imageIds.push((trackInfoData as any).track_map_id);
      }

      let weatherImage: ImageRow | undefined;
      let trackMap: ImageRow | undefined;

      if (imageIds.length > 0) {
        const { data: imagesData } = await supabase
          .from("images")
          .select("*")
          .in("id", imageIds);

        if (imagesData) {
          weatherImage = imagesData.find(
            (img) => img.id === (trackInfoData as any).weather_image_id
          );
          trackMap = imagesData.find(
            (img) => img.id === (trackInfoData as any).track_map_id
          );
        }
      }

      setInfo({
        ...trackInfoData,
        weather_image: weatherImage,
        track_map: trackMap,
      } as TrackInfoType);

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
        {info?.weather_image?.url ? (
          <div className="space-y-2">
            <img
              src={info.weather_image.url}
              alt={info.weather_image.description || "Weather forecast"}
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
        {info?.track_map?.url ? (
          <img
            src={info.track_map.url}
            alt={info.track_map.description || "Track map"}
            className="w-full rounded-lg"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Sem mapa disponível</p>
        )}
      </div>
    </div>
  );
}
