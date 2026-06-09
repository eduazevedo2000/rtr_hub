import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./queryKeys";

export function useLandingImages() {
  return useQuery({
    queryKey: queryKeys.images.landing(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("category", "landing")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
