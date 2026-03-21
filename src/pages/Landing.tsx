import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flag, ChevronRight, Trophy, Calendar, Users, Upload, Loader2, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ImageRow = Database["public"]["Tables"]["images"]["Row"];

export default function Landing() {
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const [landingImages, setLandingImages] = useState<ImageRow[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLandingImages = async () => {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("category", "landing")
      .order("created_at", { ascending: true });

    if (!error) setLandingImages(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLandingImages();
  }, []);

  useEffect(() => {
    if (landingImages.length <= 1) {
      setCurrentSlide(0);
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % landingImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [landingImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Seleciona uma imagem.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("landing")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("landing").getPublicUrl(path);
      const { error: insertError } = await supabase.from("images").insert({
        storage_path: path,
        url: publicUrl,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        description: "Landing page",
        category: "landing",
      });

      if (insertError) throw insertError;

      toast({ title: "Imagem adicionada!" });
      await fetchLandingImages();
    } catch (err: any) {
      toast({ title: "Erro ao carregar imagem", description: err?.message ?? "", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Remover esta imagem da landing?")) return;
    try {
      await supabase.from("images").delete().eq("id", id);
      await supabase.storage.from("landing").remove([storagePath]);
      toast({ title: "Imagem removida." });
      await fetchLandingImages();
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err?.message ?? "", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)]">
        {landingImages.length > 0 ? (
          <div className="absolute inset-0">
            {landingImages.map((img, index) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.description ?? "Imagem da equipa"}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.16)_0%,_transparent_60%)]" />
        )}

        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-black/15 to-black/25" />

        <div className="container relative h-full flex items-start justify-center pt-24 sm:pt-28 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto px-4"
          >
            <h1 className="font-racing text-3xl sm:text-4xl md:text-6xl font-bold mb-4 tracking-tight text-white">
              Ric Team Racing
            </h1>
            <p className="text-white/80 text-lg sm:text-xl mb-10">
              Sim racing de resistência. Acompanha as nossas corridas e conquistas.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/live">
                <Button
                  size="lg"
                  className="font-racing text-base uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white gap-2 px-8"
                >
                  <Flag className="h-5 w-5" />
                  Ver corrida em direto
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/calendario">
                <Button variant="outline" size="lg" className="font-racing uppercase tracking-wider gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendário
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {landingImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
              {landingImages.map((img, index) => (
                <button
                  key={`slide-${img.id}`}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
