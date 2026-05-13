import { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${i + 1} estrela${i > 0 ? "s" : ""}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              i < (hovered || value)
                ? "fill-[oklch(0.82_0.18_85)] text-[oklch(0.82_0.18_85)]"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { isAuthenticated, user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  const { data: testimonials, isLoading, refetch } = trpc.testimonials.list.useQuery();
  const createMutation = trpc.testimonials.create.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setContent("");
      setRating(5);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Informe seu nome."); return; }
    if (content.length < 10) { toast.error("Depoimento muito curto. Mínimo 10 caracteres."); return; }
    createMutation.mutate({ authorName: name, content, rating });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[oklch(0.28_0.12_145)] text-white py-12">
        <div className="container">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Depoimentos</h1>
          <p className="text-white/80 text-lg">O que os visitantes dizem sobre o Pará</p>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-bold text-foreground mb-1">Compartilhe sua experiência</h2>
              <p className="text-muted-foreground text-sm mb-5">Conte como foi sua visita aos pontos turísticos do Pará!</p>

              {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Seu nome</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className="mt-1" required />
                  </div>
                  <div>
                    <Label>Avaliação</Label>
                    <div className="mt-2">
                      <StarRating value={rating} onChange={setRating} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="content">Depoimento</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Conte sua experiência em Belém ou Ananindeua... (mín. 10 caracteres)"
                      rows={5}
                      className="mt-1 resize-none"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">{content.length}/1000 caracteres</p>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    Não são permitidos palavrões, ofensas ou comentários políticos. Depoimentos passam por aprovação antes de serem publicados.
                  </p>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    {createMutation.isPending ? "Enviando..." : "Enviar Depoimento"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-4">Faça login para enviar seu depoimento.</p>
                  <a href={getLoginUrl()}>
                    <Button className="gap-2 w-full">Entrar para comentar</Button>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Testimonials List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : !testimonials || testimonials.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">Seja o primeiro a comentar!</h3>
                <p className="text-muted-foreground">Compartilhe sua experiência nos pontos turísticos do Pará.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-muted-foreground text-sm">{testimonials.length} depoimento{testimonials.length !== 1 ? "s" : ""}</p>
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-card rounded-xl p-6 border border-border shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {t.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{t.authorName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-[oklch(0.82_0.18_85)] text-[oklch(0.82_0.18_85)]" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground/80 leading-relaxed italic">"{t.content}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
