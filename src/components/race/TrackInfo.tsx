import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Cloud, Map, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [info, setInfo] = useState<TrackInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<"weather" | "map" | null>(null);
  const [expandedImage, setExpandedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const weatherInputRef = useRef<HTMLInputElement>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);

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
    if (trackInfoData.weather_image_id) {
      imageIds.push(trackInfoData.weather_image_id);
    }
    if (trackInfoData.track_map_id) {
      imageIds.push(trackInfoData.track_map_id);
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
          (img) => img.id === trackInfoData.weather_image_id
        );
        trackMap = imagesData.find(
          (img) => img.id === trackInfoData.track_map_id
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

  useEffect(() => {
    fetchInfo();
  }, [raceId]);

  const handleUpload = async (
    file: File,
    type: "weather" | "map"
  ) => {
    if (!raceId) {
      toast({
        title: "Erro",
        description: "Corrida não encontrada.",
        variant: "destructive",
      });
      return;
    }

    setUploading(type);

    try {
      const bucket = type === "weather" ? "track-weather" : "track-images";
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${raceId}/${fileName}`;

      // Upload para o Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      // Criar entrada na tabela images
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

      // Criar ou atualizar track_info
      const updateField =
        type === "weather" ? "weather_image_id" : "track_map_id";

      const { data: existingInfo } = await supabase
        .from("track_info")
        .select("id")
        .eq("race_id", raceId)
        .maybeSingle();

      if (existingInfo) {
        // Atualizar
        const { error: updateError } = await supabase
          .from("track_info")
          .update({ [updateField]: imageData.id })
          .eq("id", existingInfo.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo
        const { error: insertError } = await supabase
          .from("track_info")
          .insert({
            race_id: raceId,
            [updateField]: imageData.id,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Imagem carregada!",
        description: "A imagem foi carregada com sucesso.",
      });

      fetchInfo();
    } catch (error: any) {
      toast({
        title: "Erro ao carregar imagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "weather" | "map"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Ficheiro inválido",
          description: "Por favor seleciona uma imagem.",
          variant: "destructive",
        });
        return;
      }
      handleUpload(file, type);
    }
  };

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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" />
            <h3 className="font-racing text-sm uppercase tracking-wider">Previsão do Tempo</h3>
          </div>
          {user && raceId && (
            <Button
              onClick={() => weatherInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={uploading === "weather"}
            >
              {uploading === "weather" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  A carregar...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  {info?.weather_image?.url ? "Substituir" : "Carregar"}
                </>
              )}
            </Button>
          )}
          <input
            ref={weatherInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "weather")}
          />
        </div>
        {info?.weather_image?.url ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                setExpandedImage({
                  url: info.weather_image!.url,
                  title: "Previsão do Tempo",
                })
              }
              className="w-full"
            >
              <img
                src={info.weather_image.url}
                alt={info.weather_image.description || "Weather forecast"}
                className="w-full rounded-lg cursor-zoom-in transition-transform hover:scale-[1.01]"
              />
            </button>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" />
            <h3 className="font-racing text-sm uppercase tracking-wider">Mapa da Pista</h3>
          </div>
          {user && raceId && (
            <Button
              onClick={() => mapInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={uploading === "map"}
            >
              {uploading === "map" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  A carregar...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  {info?.track_map?.url ? "Substituir" : "Carregar"}
                </>
              )}
            </Button>
          )}
          <input
            ref={mapInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "map")}
          />
        </div>
        {info?.track_map?.url ? (
          <button
            type="button"
            onClick={() =>
              setExpandedImage({
                url: info.track_map!.url,
                title: "Mapa da Pista",
              })
            }
            className="w-full"
          >
            <img
              src={info.track_map.url}
              alt={info.track_map.description || "Track map"}
              className="w-full rounded-lg cursor-zoom-in transition-transform hover:scale-[1.01]"
            />
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">Sem mapa disponível</p>
        )}
      </div>

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              className="relative w-full max-w-[95vw] sm:max-w-3xl md:max-w-5xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setExpandedImage(null)}
                className="absolute -top-3 -right-3 rounded-full bg-black/80 text-white p-2.5 shadow-lg hover:bg-black min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="rounded-lg bg-black/30 p-2">
                <img
                  src={expandedImage.url}
                  alt={expandedImage.title}
                  className="w-full max-h-[85vh] object-contain rounded-lg"
                />
              </div>
              <p className="mt-3 text-center text-sm text-white/80">
                {expandedImage.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
