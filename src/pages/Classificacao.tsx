import { useEffect, useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Flags from "country-flag-icons/react/3x2";

interface Standing {
  id: string;
  class: string;
  rank: number;
  car_number: string;
  car_logo_url: string | null;
  country_code: string;
  team_name: string;
  points: number;
  behind: number;
  starts: number;
  poles: number;
  wins: number;
  top5: number;
  top10: number;
}

interface StandingForm {
  class: string;
  rank: string;
  car_number: string;
  country_code: string;
  team_name: string;
  car_logo_url: string;
  points: string;
  behind: string;
  starts: string;
  poles: string;
  wins: string;
  top5: string;
  top10: string;
}

const COUNTRIES = [
  { code: "PT", name: "Portugal" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "ES", name: "Spain" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "BR", name: "Brazil" },
  { code: "NL", name: "Netherlands" },
];

// Car brands that should have inverted colors (white logos)
const INVERTED_BRANDS = ["mclaren", "acura", "aston"];

// Helper function to check if a logo URL should be inverted
const shouldInvertLogo = (logoUrl: string | null): boolean => {
  if (!logoUrl) return false;
  const lowerUrl = logoUrl.toLowerCase();
  return INVERTED_BRANDS.some(brand => lowerUrl.includes(brand));
};

const FLAG_COMPONENTS = Flags as Record<string, ComponentType<{ className?: string }>>;
const COUNTRY_CODE_ALIASES: Record<string, string> = {
  UK: "GB",
  EN: "GB",
  USA: "US",
};

const renderFlag = (countryCode?: string | null) => {
  const normalized = countryCode?.trim().toUpperCase();
  if (!normalized) {
    return <span className="text-xs text-muted-foreground">--</span>;
  }
  const resolved = COUNTRY_CODE_ALIASES[normalized] ?? normalized;
  const Flag = FLAG_COMPONENTS[resolved];
  if (!Flag) {
    return <span className="text-xs">{resolved}</span>;
  }
  return <Flag className="h-4 w-6 rounded-sm" />;
};

export default function Classificacao() {
  const [selectedClass, setSelectedClass] = useState<"LMP2" | "GT3 PRO">("GT3 PRO");
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStanding, setEditingStanding] = useState<Standing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [standingToDelete, setStandingToDelete] = useState<Standing | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState<StandingForm>({
    class: "GT3 PRO",
    rank: "",
    car_number: "",
    country_code: "PT",
    team_name: "",
    car_logo_url: "",
    points: "0",
    behind: "0",
    starts: "0",
    poles: "0",
    wins: "0",
    top5: "0",
    top10: "0",
  });

  useEffect(() => {
    fetchStandings();
  }, [selectedClass]);

  const fetchStandings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("championship_standings")
      .select("*")
      .eq("class", selectedClass)
      .order("rank", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar classificação",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStandings(data || []);
    }
    setLoading(false);
  };

  const openAdd = () => {
    setEditingStanding(null);
    setForm({
      class: selectedClass,
      rank: "",
      car_number: "",
      country_code: "PT",
      team_name: "",
      car_logo_url: "",
      points: "0",
      behind: "0",
      starts: "0",
      poles: "0",
      wins: "0",
      top5: "0",
      top10: "0",
    });
    setDialogOpen(true);
  };

  const openEdit = (standing: Standing) => {
    setEditingStanding(standing);
    setForm({
      class: standing.class,
      rank: standing.rank.toString(),
      car_number: standing.car_number,
      country_code: standing.country_code,
      team_name: standing.team_name,
      car_logo_url: standing.car_logo_url || "",
      points: standing.points.toString(),
      behind: standing.behind.toString(),
      starts: standing.starts.toString(),
      poles: standing.poles.toString(),
      wins: standing.wins.toString(),
      top5: standing.top5.toString(),
      top10: standing.top10.toString(),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingStanding(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Apenas imagens são permitidas.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter menos de 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    // Generate file path
    const fileExt = file.name.split(".").pop();
    const fileName = `logo.${fileExt}`;

    // If editing, use standing ID; if adding, use temp random ID
    const standingId =
      editingStanding?.id || `temp-${Math.random().toString(36).substring(2)}`;
    const filePath = `${standingId}/${fileName}`;

    // If editing and has old image, try to delete it first
    if (editingStanding?.car_logo_url) {
      try {
        const oldUrl = editingStanding.car_logo_url;
        const urlParts = oldUrl.split("/ChampionshipLogos/");
        if (urlParts.length > 1) {
          const oldPath = urlParts[1].split("?")[0];
          await supabase.storage.from("ChampionshipLogos").remove([oldPath]);
        }
      } catch (err) {
        console.log("Could not delete old image:", err);
      }
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("ChampionshipLogos")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      toast({
        title: "Erro ao enviar imagem",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploadingImage(false);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("ChampionshipLogos")
      .getPublicUrl(filePath);

    // Add timestamp to force browser to reload the image
    const urlWithTimestamp = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    setForm({ ...form, car_logo_url: urlWithTimestamp });
    setUploadingImage(false);
    toast({ title: "Imagem carregada!" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (!form.team_name.trim() || !form.car_number.trim() || !form.rank.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const standingData = {
      class: form.class,
      rank: parseInt(form.rank),
      car_number: form.car_number,
      country_code: form.country_code,
      team_name: form.team_name,
      car_logo_url: form.car_logo_url || null,
      points: parseInt(form.points) || 0,
      behind: parseInt(form.behind) || 0,
      starts: parseInt(form.starts) || 0,
      poles: parseInt(form.poles) || 0,
      wins: parseInt(form.wins) || 0,
      top5: parseInt(form.top5) || 0,
      top10: parseInt(form.top10) || 0,
    };

    if (editingStanding) {
      // Update existing standing
      const { error } = await supabase
        .from("championship_standings")
        .update(standingData)
        .eq("id", editingStanding.id);

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Classificação atualizada!" });
        closeDialog();
        fetchStandings();
      }
    } else {
      // Create new standing
      const { error } = await supabase
        .from("championship_standings")
        .insert([standingData]);

      if (error) {
        toast({
          title: "Erro ao adicionar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Classificação adicionada!" });
        closeDialog();
        fetchStandings();
      }
    }

    setSubmitting(false);
  };

  const openDelete = (standing: Standing) => {
    setStandingToDelete(standing);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!standingToDelete) return;

    // Delete logo from storage if exists
    if (standingToDelete.car_logo_url) {
      try {
        const urlParts = standingToDelete.car_logo_url.split("/ChampionshipLogos/");
        if (urlParts.length > 1) {
          const path = urlParts[1].split("?")[0];
          await supabase.storage.from("ChampionshipLogos").remove([path]);
        }
      } catch (err) {
        console.log("Could not delete logo:", err);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from("championship_standings")
      .delete()
      .eq("id", standingToDelete.id);

    if (error) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Classificação removida!" });
      setDeleteDialogOpen(false);
      setStandingToDelete(null);
      fetchStandings();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.15)_0%,_transparent_50%)]" />
        <div className="container py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-racing text-4xl md:text-6xl font-bold mb-4 racing-glow">
              <span className="text-gradient-racing">Classificação</span>{" "}
              <span className="text-foreground">do Campeonato</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Acompanha a classificação das equipas nas classes LMP2 e GT3 PRO
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-8">
        {/* Class Tabs */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant={selectedClass === "LMP2" ? "default" : "outline"}
            onClick={() => setSelectedClass("LMP2")}
            className="font-racing"
          >
            LMP2
          </Button>
          <Button
            variant={selectedClass === "GT3 PRO" ? "default" : "outline"}
            onClick={() => setSelectedClass("GT3 PRO")}
            className="font-racing"
          >
            GT3 PRO
          </Button>
        </div>

        {/* Add Team Button (Admin Only) */}
        {user && (
          <div className="flex justify-end mb-4">
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Equipa
            </Button>
          </div>
        )}

        {/* Standings Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">A carregar classificação...</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma equipa na classificação de {selectedClass}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="min-w-full"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      No.
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Car
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Team
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Points
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Behind
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Starts
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Poles
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Wins
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Top 5
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-racing uppercase tracking-wider">
                      Top 10
                    </th>
                    {user && <th className="w-20"></th>}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {standings.map((standing, index) => (
                      <motion.tr
                        key={standing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border hover:bg-accent/50 group"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold">{standing.rank}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center px-2 py-1 text-sm font-bold text-white bg-primary rounded">
                            {standing.car_number}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {standing.car_logo_url ? (
                            <img
                              src={standing.car_logo_url}
                              alt="Car logo"
                              className={`h-8 w-8 object-contain ${
                                shouldInvertLogo(standing.car_logo_url)
                                  ? "brightness-0 invert"
                                  : ""
                              }`}
                            />
                          ) : (
                            <div className="h-8 w-8 bg-muted rounded" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center">
                              {renderFlag(standing.country_code)}
                            </span>
                            <span>{standing.team_name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 font-bold">
                          {standing.points}
                        </td>
                        <td className="text-center py-3 px-4">
                          {standing.behind}
                        </td>
                        <td className="text-center py-3 px-4">
                          {standing.starts}
                        </td>
                        <td className="text-center py-3 px-4">
                          {standing.poles}
                        </td>
                        <td className="text-center py-3 px-4">
                          {standing.wins}
                        </td>
                        <td className="text-center py-3 px-4">
                          {standing.top5}
                        </td>
                        <td className="text-center py-3 px-4">
                          {standing.top10}
                        </td>
                        {user && (
                          <td className="py-3 px-4">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(standing)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDelete(standing)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStanding ? "Editar Equipa" : "Adicionar Equipa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Classe</Label>
                <Select
                  value={form.class}
                  onValueChange={(value) => setForm({ ...form, class: value })}
                  disabled={!!editingStanding}
                >
                  <SelectTrigger id="class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LMP2">LMP2</SelectItem>
                    <SelectItem value="GT3 PRO">GT3 PRO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rank">Posição</Label>
                <Input
                  id="rank"
                  type="number"
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="car_number">Número do Carro</Label>
                <Input
                  id="car_number"
                  value={form.car_number}
                  onChange={(e) =>
                    setForm({ ...form, car_number: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Select
                  value={form.country_code}
                  onValueChange={(value) =>
                    setForm({ ...form, country_code: value })
                  }
                >
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="inline-flex items-center gap-2">
                            {renderFlag(country.code)}
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="team_name">Nome da Equipa</Label>
              <Input
                id="team_name"
                value={form.team_name}
                onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="car_logo">Logo do Carro (Opcional)</Label>
              <Input
                id="car_logo"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <p className="text-sm text-muted-foreground mt-1">
                  A carregar imagem...
                </p>
              )}
              {form.car_logo_url && (
                <img
                  src={form.car_logo_url}
                  alt="Preview"
                  className="mt-2 h-16 w-16 object-contain border rounded"
                />
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="points">Pontos</Label>
                <Input
                  id="points"
                  type="number"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="behind">Behind</Label>
                <Input
                  id="behind"
                  type="number"
                  value={form.behind}
                  onChange={(e) => setForm({ ...form, behind: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="starts">Starts</Label>
                <Input
                  id="starts"
                  type="number"
                  value={form.starts}
                  onChange={(e) => setForm({ ...form, starts: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="poles">Poles</Label>
                <Input
                  id="poles"
                  type="number"
                  value={form.poles}
                  onChange={(e) => setForm({ ...form, poles: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="wins">Wins</Label>
                <Input
                  id="wins"
                  type="number"
                  value={form.wins}
                  onChange={(e) => setForm({ ...form, wins: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="top5">Top 5</Label>
                <Input
                  id="top5"
                  type="number"
                  value={form.top5}
                  onChange={(e) => setForm({ ...form, top5: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="top10">Top 10</Label>
                <Input
                  id="top10"
                  type="number"
                  value={form.top10}
                  onChange={(e) => setForm({ ...form, top10: e.target.value })}
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "A guardar..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{standingToDelete?.team_name}</strong> da classificação?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
