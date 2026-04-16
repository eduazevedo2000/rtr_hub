import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flag, ChevronRight, Upload, Loader2, Trash2, Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ImageRow = Database["public"]["Tables"]["images"]["Row"];

/** Hino da equipa — https://www.youtube.com/watch?v=xcFs9jls1z8 */
const TEAM_ANTHEM_IFRAME_SRC =
  "https://www.youtube.com/embed/xcFs9jls1z8?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1";

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

  const activeImage = landingImages[currentSlide];
  const nextImage =
    landingImages.length > 1
      ? landingImages[(currentSlide + 1) % landingImages.length]
      : null;

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
        .upload(path, file, { cacheControl: "31536000", upsert: false });

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
    <div className="page-shell relative">
      <Header />

      {activeImage ? (
        <div className="pointer-events-none fixed inset-0 z-0">
          {[activeImage, nextImage].filter(Boolean).map((img, index) => (
            <img
              key={`page-bg-${img!.id}`}
              src={img!.url}
              alt={img!.description ?? "Imagem da equipa"}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                index === 0 ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.16)_0%,_transparent_60%)] bg-secondary/30" />
      )}
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/30" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/20 via-black/25 to-black/35" />

      <div className="relative z-10">
        {/* Chamada principal: corrida em direto */}
        <section className="relative overflow-hidden border-b border-border h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)]">

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

        </div>
        </section>

        {/* Hero com slideshow e vídeo */}
        <section className="relative overflow-hidden border-b border-border h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)]">

        <div className="container relative flex w-full h-full flex-1 flex-col items-center justify-center py-8 sm:py-10">
          <h2 className="font-racing mb-4 text-center text-lg font-bold uppercase tracking-wider text-white sm:text-xl">
            Hino da equipa
          </h2>
          <div className="card-racing mx-auto aspect-video w-4/5 overflow-hidden shadow-2xl">
            <iframe
              src={TEAM_ANTHEM_IFRAME_SRC}
              title="Hino da equipa — Ric Team Racing"
              className="block h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>

        {isAdmin && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
            <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2 font-racing uppercase tracking-wider shadow-md"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Adicionar foto
              </Button>
            </div>
          </>
        )}

        <div className="container relative h-full">
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

        {/* Admin: gerir fotos do slideshow */}
        {isAdmin && (
          <section className="border-t border-border bg-secondary/40 py-6">
            <div className="container">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-racing text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Fotos da página inicial (slideshow)
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit gap-2 font-racing uppercase tracking-wider"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Adicionar outra foto
                </Button>
              </div>
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : landingImages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda não há imagens. Usa &quot;Adicionar foto&quot; acima para preencher o slideshow.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {landingImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-video w-36 overflow-hidden rounded-lg border border-border bg-background sm:w-44"
                    >
                      <img
                        src={img.url}
                        alt={img.description ?? ""}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleDelete(img.id, img.storage_path)}
                        aria-label="Remover imagem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
