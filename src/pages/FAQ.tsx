import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Loader2, Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type FAQItem = Database["public"]["Tables"]["faq"]["Row"];

async function fetchFAQs() {
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .order("order_index", { ascending: true });
  if (!error) return data ?? [];
  return [];
}

export default function FAQ() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", order_index: 0 });

  const loadFaqs = () => {
    fetchFAQs().then((data) => {
      setFaqs(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openAdd = () => {
    setEditingFaq(null);
    setForm({
      question: "",
      answer: "",
      order_index: faqs.length,
    });
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      order_index: faq.order_index,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      toast({
        title: "Campos em falta",
        description: "Preenche a pergunta e a resposta.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const order = Math.max(0, Math.floor(Number(form.order_index) || 0));

    if (editingFaq) {
      const { error } = await supabase
        .from("faq")
        .update({
          question: form.question.trim(),
          answer: form.answer.trim(),
          order_index: order,
        })
        .eq("id", editingFaq.id);

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Pergunta atualizada!" });
        closeDialog();
        loadFaqs();
      }
    } else {
      const { error } = await supabase.from("faq").insert({
        question: form.question.trim(),
        answer: form.answer.trim(),
        order_index: order,
      });

      if (error) {
        toast({
          title: "Erro ao adicionar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Pergunta adicionada!" });
        closeDialog();
        loadFaqs();
      }
    }
    setSubmitting(false);
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
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="font-racing text-4xl md:text-5xl font-bold mb-4">
              FAQ
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Perguntas frequentes sobre a Ric Team Racing e o mundo do sim racing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <main className="container py-12 max-w-3xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="card-racing p-12 text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-racing text-xl mb-2">Em Construção</h2>
            <p className="text-muted-foreground mb-6">
              As perguntas frequentes serão adicionadas em breve.
            </p>
            {user && (
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar pergunta
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {user && (
              <div className="flex justify-end">
                <Button onClick={openAdd} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar pergunta
                </Button>
              </div>
            )}
            <div className="card-racing overflow-hidden p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="min-w-0 gap-2 text-left font-racing text-base hover:text-primary [&>svg]:shrink-0">
                      <span className="min-w-0 flex-1 truncate text-left">
                        {faq.question}
                      </span>
                      {user && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            openEdit(faq);
                          }}
                          aria-label={`Editar: ${faq.question}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-racing">
              {editingFaq ? "Editar pergunta" : "Adicionar pergunta"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="faq-question">Pergunta</Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) =>
                  setForm((f) => ({ ...f, question: e.target.value }))
                }
                placeholder="Ex.: O que é o iRacing?"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="faq-answer">Resposta</Label>
              <Textarea
                id="faq-answer"
                value={form.answer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, answer: e.target.value }))
                }
                placeholder="Resposta..."
                rows={4}
                className="mt-1.5 resize-none"
              />
            </div>
            <div>
              <Label htmlFor="faq-order">Ordem</Label>
              <Input
                id="faq-order"
                type="number"
                min={0}
                value={form.order_index}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    order_index: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1.5 w-24"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {editingFaq ? "Guardar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
