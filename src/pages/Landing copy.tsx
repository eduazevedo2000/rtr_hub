import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Flag, ChevronRight, Calendar, Loader2, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ImageRow = Database["public"]["Tables"]["images"]["Row"];
type OptimizedVideoOption = { filename: string; url: string };

/** Embeds otimizados para evitar ficheiros de vídeo pesados no repositório */
const OPTIMIZED_LANDING_VIDEOS: OptimizedVideoOption[] = [
  {
    filename: "Evento Sebring - YouTube Shorts",
    url: "https://www.youtube.com/embed/OMyW3hntPxs?autoplay=1&mute=1&loop=1&playlist=OMyW3hntPxs&controls=1&rel=0&modestbranding=1&playsinline=1",
  },
  {
    filename: "Hino Ric Team Racing - YouTube",
    url: "https://www.youtube.com/embed/xcFs9jls1z8?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1",
  },
];

const toIframeEmbedUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const isWatch = url.pathname === "/watch";
      const isShorts = url.pathname.startsWith("/shorts/");
      const videoId = isWatch
        ? url.searchParams.get("v")
        : isShorts
          ? url.pathname.split("/")[2]
          : null;

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
      }
    }

    if (host === "youtu.be") {
      const videoId = url.pathname.replace("/", "").trim();
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
      }
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
};

export default function Landing() {
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const [landingVideos, setLandingVideos] = useState<ImageRow[]>([]);
  const [landingImages, setLandingImages] = useState<ImageRow[]>([]);
  const [iframeConfig, setIframeConfig] = useState<ImageRow | null>(null);
  const [usingLocalVideo, setUsingLocalVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLandingData = async () => {
    const { data: videoData, error: videoError } = await supabase
      .from("images")
      .select("*")
      .eq("category", "landing-video")
      .order("created_at", { ascending: false });

    const { data: imageData, error: imageError } = await supabase
      .from("images")
      .select("*")
      .eq("category", "landing")
      .order("created_at", { ascending: true });

    const { data: iframeData, error: iframeError } = await supabase
      .from("images")
      .select("*")
      .eq("category", "landing-iframe")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!videoError) setLandingVideos(videoData ?? []);
    if (!imageError) setLandingImages(imageData ?? []);
    if (!iframeError) setIframeConfig(iframeData ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchLandingData();
  }, []);

  const isEmbedUrl = (url: string) => /youtube\.com\/embed|player\.twitch\.tv|vimeo\.com\/video/.test(url);

  const handleUseLocalVideo = async (video: OptimizedVideoOption) => {
    setUsingLocalVideo(true);
    try {
      await supabase.from("images").delete().eq("category", "landing-video");
      const { error } = await supabase.from("images").insert({
        storage_path: `embed-video/${Date.now()}`,
        url: video.url,
        filename: video.filename,
        mime_type: "text/html",
        size_bytes: 0,
        description: "Landing background video (optimized embed)",
        category: "landing-video",
      });

      if (error) throw error;
      toast({ title: "Vídeo de fundo atualizado!" });
      await fetchLandingData();
    } catch (err: any) {
      toast({
        title: "Erro ao selecionar vídeo",
        description: err?.message ?? "",
        variant: "destructive",
      });
    } finally {
      setUsingLocalVideo(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Remover este vídeo da landing?")) return;
    try {
      await supabase.from("images").delete().eq("id", id);
      if (storagePath.startsWith("videos/")) {
        await supabase.storage.from("landing").remove([storagePath]);
      }
      toast({ title: "Vídeo removido." });
      await fetchLandingData();
    } catch (err: any) {
      toast({ title: "Erro ao remover", description: err?.message ?? "", variant: "destructive" });
    }
  };

  const handleSetIframeUrl = async () => {
    const currentUrl = iframeConfig?.url ?? "";
    const value = window.prompt("Link do iframe (YouTube embed, Twitch embed, etc.)", currentUrl);
    if (value === null) return;

    const nextUrl = value.trim();
    if (!nextUrl) {
      if (iframeConfig?.id) {
        await supabase.from("images").delete().eq("id", iframeConfig.id);
        toast({ title: "Iframe removido." });
        await fetchLandingData();
      }
      return;
    }

    if (!/^https?:\/\//i.test(nextUrl)) {
      toast({
        title: "Link inválido",
        description: "O link deve começar por http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase.from("images").delete().eq("category", "landing-iframe");
      const { error } = await supabase.from("images").insert({
        storage_path: `iframe/${Date.now()}`,
        url: nextUrl,
        filename: "landing-iframe",
        mime_type: "text/uri-list",
        size_bytes: 0,
        description: "Landing iframe URL",
        category: "landing-iframe",
      });

      if (error) throw error;
      toast({ title: "Iframe atualizado!" });
      await fetchLandingData();
    } catch (err: any) {
      toast({
        title: "Erro ao guardar iframe",
        description: err?.message ?? "",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Seleciona uma imagem.", variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `images/${Date.now()}.${ext}`;
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
        description: "Landing gallery image",
        category: "landing",
      });

      if (insertError) throw insertError;
      toast({ title: "Imagem adicionada!" });
      await fetchLandingData();
    } catch (err: any) {
      toast({
        title: "Erro ao carregar imagem",
        description: err?.message ?? "",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      e.currentTarget.value = "";
    }
  };

  const handleDeleteImage = async (image: ImageRow) => {
    if (!confirm("Remover esta imagem?")) return;
    try {
      await supabase.from("images").delete().eq("id", image.id);
      await supabase.storage.from("landing").remove([image.storage_path]);
      toast({ title: "Imagem removida." });
      await fetchLandingData();
    } catch (err: any) {
      toast({
        title: "Erro ao remover imagem",
        description: err?.message ?? "",
        variant: "destructive",
      });
    }
  };

  const heroVideo = landingVideos[0] ?? null;

  return (
    <div className="page-shell">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)]">
        {heroVideo ? (
          <div className="absolute inset-0">
            {isEmbedUrl(heroVideo.url) ? (
              <iframe
                key={heroVideo.id}
                src={heroVideo.url}
                title={heroVideo.description ?? "Landing background video"}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                key={heroVideo.id}
                src={heroVideo.url}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            )}
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

        </div>
      </section>

      {/* 2ª Secção: Iframe */}
      <section className="border-b border-border">
        <div className="container py-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            {isAdmin && (
              <Button type="button" size="sm" variant="outline" onClick={handleSetIframeUrl}>
                Alterar link do iframe
              </Button>
            )}
          </div>
          {iframeConfig?.url ? (
            <div className="card-racing overflow-hidden aspect-video">
              <iframe
                src={toIframeEmbedUrl(iframeConfig.url)}
                title="Live Embed"
                className="block h-full w-full border-0 overflow-hidden"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                scrolling="no"
              />
            </div>
          ) : (
            <div className="card-racing p-8 text-center text-muted-foreground">
              Ainda não há iframe configurado.
            </div>
          )}
        </div>
      </section>

      {/* 3ª Secção: Imagens */}
      <section>
        <div className="container py-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-racing text-xl uppercase tracking-wider">A Equipa em Ação</h2>
            {isAdmin && (
              <Label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button type="button" size="sm" variant="outline" disabled={uploadingImage} asChild>
                  <span>{uploadingImage ? "A carregar..." : "Adicionar imagem"}</span>
                </Button>
              </Label>
            )}
          </div>
          {landingImages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {landingImages.map((img) => (
                <div key={img.id} className="group relative overflow-hidden rounded-lg border border-border bg-card">
                  <img src={img.url} alt={img.description ?? "Imagem da equipa"} className="h-48 w-full object-cover" />
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDeleteImage(img)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card-racing p-8 text-center text-muted-foreground">
              Ainda não há imagens para mostrar.
            </div>
          )}
        </div>
      </section>

      {/* Admin: gerir vídeos da landing */}
      {isAdmin && (
        <section className="border-t border-border bg-secondary/40 py-6">
          <div className="container">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-racing text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Vídeos da página inicial (background)
              </h2>
              <p className="text-xs text-muted-foreground">
                A usar embeds otimizados (YouTube/Twitch/Vimeo) para reduzir peso da landing
              </p>
            </div>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : landingVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda não há mapeamento. Escolhe um vídeo local abaixo para definir o fundo da landing.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {landingVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group relative aspect-video w-36 overflow-hidden rounded-lg border border-border bg-background sm:w-44"
                  >
                    {isEmbedUrl(video.url) ? (
                      <iframe
                        src={video.url}
                        title={video.description ?? "Landing video"}
                        className="h-full w-full border-0"
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={video.url}
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDelete(video.id, video.storage_path)}
                      aria-label="Remover vídeo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 space-y-2">
              <h3 className="text-xs font-racing uppercase tracking-wider text-muted-foreground">
                Vídeos otimizados disponíveis
              </h3>
              <div className="flex flex-wrap gap-3">
                {OPTIMIZED_LANDING_VIDEOS.map((video) => {
                  const isSelected = heroVideo?.url === video.url;
                  return (
                    <div
                      key={video.url}
                      className={`relative aspect-video w-44 overflow-hidden rounded-lg border ${
                        isSelected ? "border-primary" : "border-border"
                      } bg-background`}
                    >
                      <iframe
                        src={video.url}
                        title={video.filename}
                        className="h-full w-full border-0"
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5">
                        <p className="truncate text-[11px] text-white">{video.filename}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? "secondary" : "outline"}
                          className="mt-1 h-7 w-full text-[10px] font-racing uppercase tracking-wider"
                          onClick={() => handleUseLocalVideo(video)}
                          disabled={usingLocalVideo || isSelected}
                        >
                          {isSelected ? "Em uso" : "Usar como fundo"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
