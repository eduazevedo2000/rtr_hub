import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, User, Instagram, ExternalLink, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export default function Pilotos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    known_as: "",
    instagram: "",
    image_url: "",
  });

  useEffect(() => {
    fetchDrivers();
    fetchCategories();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setDrivers(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })
      .neq("name", "GERAL");

    if (data) {
      setCategories(data);
    }
  };

  const openAdd = () => {
    setEditingDriver(null);
    setForm({
      name: "",
      category: "",
      known_as: "",
      instagram: "",
      image_url: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (driver: Driver, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDriver(driver);
    setForm({
      name: driver.name,
      category: driver.category || "",
      known_as: driver.known_as || "",
      instagram: driver.instagram || "",
      image_url: driver.image_url || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingDriver(null);
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter menos de 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    // Generate file path
    const fileExt = file.name.split(".").pop();
    const fileName = `profile.${fileExt}`;
    
    // If editing, use driver ID; if adding, use temp random ID
    const driverId = editingDriver?.id || `temp-${Math.random().toString(36).substring(2)}`;
    const filePath = `${driverId}/${fileName}`;

    // Upload to Supabase Storage (bucket: Pilotos)
    const { error: uploadError } = await supabase.storage
      .from("Pilotos")
      .upload(filePath, file, {
        upsert: true, // Replace if exists
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
      .from("Pilotos")
      .getPublicUrl(filePath);

    setForm({ ...form, image_url: publicUrlData.publicUrl });
    setUploadingImage(false);
    toast({ title: "Imagem carregada!" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do piloto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const driverData = {
      name: form.name.trim(),
      category: form.category || null,
      known_as: form.known_as.trim() || null,
      instagram: form.instagram.trim() || null,
      image_url: form.image_url || null,
    };

    if (editingDriver) {
      const { error } = await supabase
        .from("drivers")
        .update(driverData)
        .eq("id", editingDriver.id);

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Piloto atualizado!" });
        closeDialog();
        fetchDrivers();
      }
    } else {
      const { error } = await supabase
        .from("drivers")
        .insert(driverData);

      if (error) {
        toast({
          title: "Erro ao adicionar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Piloto adicionado!" });
        closeDialog();
        fetchDrivers();
      }
    }

    setSubmitting(false);
  };

  const openDelete = (driver: Driver, e: React.MouseEvent) => {
    e.stopPropagation();
    setDriverToDelete(driver);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!driverToDelete) return;

    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", driverToDelete.id);

    if (error) {
      toast({
        title: "Erro ao apagar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Piloto apagado!" });
      fetchDrivers();
    }

    setDeleteDialogOpen(false);
    setDriverToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(4_90%_58%_/_0.1)_0%,_transparent_50%)]" />
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="font-racing text-4xl md:text-5xl font-bold mb-4">
              Pilotos
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Os pilotos que representam a Ric Team Racing no iRacing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="container py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : drivers.length === 0 ? (
          <div className="card-racing p-12 text-center max-w-lg mx-auto">
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-racing text-xl mb-2">Sem pilotos</h2>
            <p className="text-muted-foreground mb-6">
              Os pilotos da equipa serão adicionados em breve.
            </p>
            {user && (
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar piloto
              </Button>
            )}
          </div>
        ) : (
          <>
            {user && (
              <div className="flex justify-end mb-6 max-w-5xl mx-auto">
                <Button onClick={openAdd} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar piloto
                </Button>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {drivers.map((driver, index) => {
              const instagramHandle = driver.instagram?.replace(/^@/, "")?.trim();
              const instagramUrl =
                instagramHandle ?
                  `https://instagram.com/${instagramHandle}`
                : null;

              return (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-racing p-6 hover:border-primary/50 transition-colors group relative"
                >
                  {user && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => openEdit(driver, e)}
                        aria-label={`Editar ${driver.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => openDelete(driver, e)}
                        aria-label={`Apagar ${driver.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                      {driver.image_url ? (
                        <img
                          src={driver.image_url}
                          alt={driver.name}
                          className="h-full w-full object-contain object-center"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-racing text-lg font-bold truncate">
                        {driver.name}
                      </h3>
                      {/* {driver.known_as && (
                        <p className="text-sm text-primary font-medium mt-0.5">
                          {driver.known_as}
                        </p>
                      )} */}
                      {driver.category && (
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">
                          {driver.category}
                        </p>
                      )}
                      {instagramUrl && (
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-[#E4405F] hover:text-[#E4405F]/80 transition-colors"
                          aria-label={`Instagram de ${driver.name}`}
                        >
                          <img src="/images/instagram.png" alt="Instagram" className="h-4 w-4 shrink-0" />
                          {/* <span className="text-sm font-medium truncate">
                            @{instagramHandle}
                          </span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          </>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-racing">
              {editingDriver ? "Editar Piloto" : "Adicionar Piloto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driver-name">Nome *</Label>
              <Input
                id="driver-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do Piloto"
                required
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-category">Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger id="driver-category" className="bg-secondary">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="driver-known-as">Alcunha</Label>
              <Input
                id="driver-known-as"
                value={form.known_as}
                onChange={(e) => setForm({ ...form, known_as: e.target.value })}
                placeholder="ex: Ric, Fazeres"
                className="bg-secondary"
              />
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="driver-instagram">Instagram</Label>
              <Input
                id="driver-instagram"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@username ou username"
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-image">Foto do Piloto</Label>
              <div className="flex items-center gap-3">
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                  />
                )}
                <div className="flex-1">
                  <Input
                    id="driver-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="bg-secondary"
                  />
                  {uploadingImage && (
                    <p className="text-xs text-muted-foreground mt-1">
                      A carregar imagem...
                    </p>
                  )}
                </div>
              </div>
              {form.image_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="text-xs"
                >
                  Remover imagem
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={submitting || uploadingImage}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || uploadingImage}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingDriver ? "Guardar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-racing">
              Apagar piloto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres apagar este piloto? Esta ação não pode ser revertida.
              {driverToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  "{driverToDelete.name}"
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
