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
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.12)_0%,_transparent_50%)]" />
        <div className="container relative py-16 sm:py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <img
                src="/images/rtr_logo.png"
                alt="Ric Team Racing"
                className="h-20 sm:h-24 md:h-28 w-auto object-contain opacity-95"
              />
            </div>
            <h1 className="font-racing text-3xl sm:text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Ric Team Racing
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl mb-10">
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

      {/* Photos / highlights section */}
      <section className="container py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-racing text-2xl sm:text-3xl font-bold text-center sm:text-left"
          >
            A equipa em ação
          </motion.h2>
          {isAdmin && (
            <div className="flex justify-center sm:justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                className="gap-2 font-racing uppercase tracking-wider"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Adicionar imagem
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : landingImages.length > 0 ? (
            landingImages.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card-racing overflow-hidden aspect-[4/3] relative group"
              >
                <img
                  src={img.url}
                  alt={img.description ?? "Equipa em ação"}
                  className="w-full h-full object-cover"
                />
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(img.id, img.storage_path)}
                    aria-label="Remover imagem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-racing overflow-hidden aspect-[4/3] flex items-center justify-center bg-secondary/50 border-dashed"
              >
                <div className="text-center p-6">
                  <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground font-racing uppercase tracking-wider">
                    Foto {i}
                  </p>
                  {isAdmin && (
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Usa o botão acima para adicionar imagens
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <Link to="/palmares">
            <Button variant="ghost" className="gap-2 font-racing uppercase tracking-wider">
              <Trophy className="h-4 w-4" />
              Palmarés
            </Button>
          </Link>
          <Link to="/pilotos">
            <Button variant="ghost" className="gap-2 font-racing uppercase tracking-wider">
              <Users className="h-4 w-4" />
              Pilotos
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container py-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <p className="font-racing text-lg uppercase tracking-wider text-center sm:text-left">
              Próxima corrida? Entra em direto.
            </p>
            <Link to="/live">
              <Button className="bg-red-600 hover:bg-red-700 font-racing uppercase tracking-wider gap-2">
                <Flag className="h-4 w-4" />
                Ir para Live
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
