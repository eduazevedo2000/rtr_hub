import { supabase } from "@/integrations/supabase/client";

export async function uploadRaceImage(raceId: string, file: File, type: "weather" | "map") {
  const bucket = type === "weather" ? "track-weather" : "track-images";
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${raceId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: "31536000", upsert: false });
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
}
