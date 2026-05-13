import { useState } from "react";
import { useLocation } from "wouter";
import {
  MapPin, Building2, Star, Camera, Heart, ShieldCheck, Trash2, Check, X,
  Plus, Edit, Eye, EyeOff, LogIn, ChevronDown, ChevronUp, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

// ─── Feedback Admin ────────────────────────────────────────────────────────────────
function FeedbackAdmin() {
  const utils = trpc.useUtils();
  const { data: feedbacks, isLoading } = trpc.feedbacks.adminList.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<"todos" | "novo" | "lido" | "respondido">("todos");

  const updateStatusMutation = trpc.feedbacks.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); utils.feedbacks.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.feedbacks.delete.useMutation({
    onSuccess: () => { toast.success("Feedback removido!"); utils.feedbacks.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (feedbacks || []).filter((f) => filterStatus === "todos" || f.status === filterStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-foreground">Feedback dos Usuários ({filtered.length})</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos</option>
            <option value="novo">Novos</option>
            <option value="lido">Lidos</option>
            <option value="respondido">Respondidos</option>
          </select>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum feedback encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((feedback) => (
            <div key={feedback.id} className="bg-card rounded-lg border border-border overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === feedback.id ? null : feedback.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">{feedback.name}</p>
                      <Badge
                        className={`text-xs shrink-0 ${
                          feedback.status === "novo"
                            ? "bg-blue-100 text-blue-800 border-0"
                            : feedback.status === "lido"
                            ? "bg-yellow-100 text-yellow-800 border-0"
                            : "bg-green-100 text-green-800 border-0"
                        }`}
                      >
                        {feedback.status === "novo" ? "Novo" : feedback.status === "lido" ? "Lido" : "Respondido"}
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {feedback.feedbackType === "sugestao"
                          ? "💡 Sugestão"
                          : feedback.feedbackType === "elogio"
                          ? "👍 Elogio"
                          : feedback.feedbackType === "reclamacao"
                          ? "⚠️ Reclamação"
                          : "❓ Outro"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{feedback.email}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{feedback.subject}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {expandedId === feedback.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              {expandedId === feedback.id && (
                <div className="border-t border-border p-4 bg-muted/30">
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Mensagem:</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{feedback.message}</p>
                  </div>
                  {feedback.rating && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Avaliação:</p>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating!
                                ? "fill-[oklch(0.82_0.18_85)] text-[oklch(0.82_0.18_85)]"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mb-4 text-xs text-muted-foreground">
                    <p>{new Date(feedback.createdAt).toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={feedback.status === "novo" ? "default" : "outline"}
                      onClick={() => updateStatusMutation.mutate({ id: feedback.id, status: "novo" })}
                      className="text-xs"
                    >
                      Marcar como Novo
                    </Button>
                    <Button
                      size="sm"
                      variant={feedback.status === "lido" ? "default" : "outline"}
                      onClick={() => updateStatusMutation.mutate({ id: feedback.id, status: "lido" })}
                      className="text-xs"
                    >
                      Marcar como Lido
                    </Button>
                    <Button
                      size="sm"
                      variant={feedback.status === "respondido" ? "default" : "outline"}
                      onClick={() => updateStatusMutation.mutate({ id: feedback.id, status: "respondido" })}
                      className="text-xs"
                    >
                      Marcar como Respondido
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive text-xs"
                      onClick={() => {
                        if (confirm("Remover este feedback?")) deleteMutation.mutate({ id: feedback.id });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Spots Admin ────────────────────────────────────────────────────────────────
function SpotsAdmin() {
  const utils = trpc.useUtils();
  const { data: spots, isLoading } = trpc.spots.adminList.useQuery();
  const [editSpot, setEditSpot] = useState<null | { id: number; name: string; active: boolean; featured: boolean; coverImage?: string | null }>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", shortDescription: "", city: "Belém" as "Belém" | "Ananindeua", category: "outro" as string, address: "", latitude: "", longitude: "", openingHours: "", phone: "", website: "", coverImage: "", featured: false });

  const updateMutation = trpc.spots.update.useMutation({
    onSuccess: () => { toast.success("Ponto atualizado!"); utils.spots.adminList.invalidate(); setEditSpot(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.spots.delete.useMutation({
    onSuccess: () => { toast.success("Ponto removido!"); utils.spots.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const createMutation = trpc.spots.create.useMutation({
    onSuccess: () => { toast.success("Ponto criado!"); utils.spots.adminList.invalidate(); setAddOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-foreground">Pontos Turísticos ({spots?.length || 0})</h2>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {(spots || []).map((spot) => (
            <div key={spot.id} className="bg-card rounded-lg p-4 border border-border flex items-center gap-4">
              <img src={spot.coverImage || "/manus-storage/belem-panorama_3b6bbab2.jpg"} alt={spot.name} className="w-16 h-12 rounded object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{spot.name}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{spot.city}</Badge>
                  <Badge variant="outline" className="text-xs">{spot.category}</Badge>
                  {spot.featured && <Badge className="text-xs bg-[oklch(0.82_0.18_85)] text-[oklch(0.20_0.08_145)] border-0">Destaque</Badge>}
                  {!spot.active && <Badge variant="destructive" className="text-xs">Inativo</Badge>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: spot.id, active: !spot.active })} title={spot.active ? "Desativar" : "Ativar"}>
                  {spot.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: spot.id, featured: !spot.featured })} title={spot.featured ? "Remover destaque" : "Destacar"}>
                  <Star className={`w-4 h-4 ${spot.featured ? "fill-[oklch(0.82_0.18_85)] text-[oklch(0.82_0.18_85)]" : "text-muted-foreground"}`} />
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { if (confirm(`Remover "${spot.name}"?`)) deleteMutation.mutate({ id: spot.id }); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Spot Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif">Adicionar Ponto Turístico</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} className="mt-1" /></div>
            <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" /></div>
            <div className="sm:col-span-2"><Label>Descrição *</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 resize-none" /></div>
            <div className="sm:col-span-2"><Label>Descrição curta</Label><Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="mt-1" /></div>
            <div>
              <Label>Cidade *</Label>
              <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v as "Belém" | "Ananindeua" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Belém">Belém</SelectItem><SelectItem value="Ananindeua">Ananindeua</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["museu", "parque", "monumento", "gastronomia", "religioso", "natureza", "entretenimento", "outro"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label>Endereço *</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
            <div><Label>Latitude</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-1.4558" className="mt-1" /></div>
            <div><Label>Longitude</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-48.4902" className="mt-1" /></div>
            <div><Label>Horário de funcionamento</Label><Input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} placeholder="Seg-Sex 9h-17h" className="mt-1" /></div>
            <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
            <div><Label>Site</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="mt-1" /></div>
            <div><Label>URL da imagem de capa</Label><Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="/manus-storage/..." className="mt-1" /></div>
          </div>
          <Button
            onClick={() => createMutation.mutate({ ...form, category: form.category as "museu" | "parque" | "monumento" | "gastronomia" | "religioso" | "natureza" | "entretenimento" | "outro" })}
            disabled={createMutation.isPending || !form.name || !form.slug || !form.description || !form.address}
            className="w-full mt-2"
          >
            {createMutation.isPending ? "Criando..." : "Criar Ponto Turístico"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Partners Admin ──────────────────────────────────────────────────────────────
function PartnersAdmin() {
  const utils = trpc.useUtils();
  const { data: partners, isLoading } = trpc.partners.adminList.useQuery();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "outro" as string, description: "", logo: "", website: "", phone: "", address: "", whatsapp: "" });

  const deleteMutation = trpc.partners.delete.useMutation({
    onSuccess: () => { toast.success("Parceiro removido!"); utils.partners.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.partners.update.useMutation({
    onSuccess: () => { toast.success("Parceiro atualizado!"); utils.partners.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const createMutation = trpc.partners.create.useMutation({
    onSuccess: () => { toast.success("Parceiro criado!"); utils.partners.adminList.invalidate(); setAddOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-foreground">Empresas Parceiras ({partners?.length || 0})</h2>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5"><Plus className="w-4 h-4" />Adicionar</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {(partners || []).map((p) => (
            <div key={p.id} className="bg-card rounded-lg p-4 border border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">{p.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs capitalize">{p.category.replace("_", " ")}</Badge>
                  {!p.active && <Badge variant="destructive" className="text-xs">Inativo</Badge>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => updateMutation.mutate({ id: p.id, active: !p.active })}>
                  {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { if (confirm(`Remover "${p.name}"?`)) deleteMutation.mutate({ id: p.id }); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-serif">Adicionar Empresa Parceira</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div>
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[["hotel", "Hotel"], ["restaurante", "Restaurante"], ["sorveteria", "Sorveteria"], ["salao_beleza", "Salão de Beleza"], ["outro", "Outro"]].map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 resize-none" /></div>
            <div><Label>Endereço</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
            <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
            <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="91999999999" className="mt-1" /></div>
            <div><Label>Site</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="mt-1" /></div>
          </div>
          <Button
            onClick={() => createMutation.mutate({ ...form, category: form.category as "hotel" | "restaurante" | "sorveteria" | "salao_beleza" | "outro" })}
            disabled={createMutation.isPending || !form.name}
            className="w-full mt-2"
          >
            {createMutation.isPending ? "Criando..." : "Criar Parceiro"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Testimonials Admin ──────────────────────────────────────────────────────────
function TestimonialsAdmin() {
  const utils = trpc.useUtils();
  const { data: testimonials, isLoading } = trpc.testimonials.adminList.useQuery();
  const approveMutation = trpc.testimonials.approve.useMutation({
    onSuccess: () => { toast.success("Depoimento aprovado!"); utils.testimonials.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.testimonials.delete.useMutation({
    onSuccess: () => { toast.success("Depoimento removido!"); utils.testimonials.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const pending = (testimonials || []).filter((t) => !t.approved);
  const approved = (testimonials || []).filter((t) => t.approved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">
          Aguardando Aprovação ({pending.length})
        </h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : pending.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Nenhum depoimento pendente.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((t) => (
              <div key={t.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{t.authorName}</p>
                    <div className="flex gap-0.5 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "fill-[oklch(0.82_0.18_85)] text-[oklch(0.82_0.18_85)]" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/80 italic">"{t.content}"</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => approveMutation.mutate({ id: t.id })} className="gap-1.5 bg-green-600 hover:bg-green-700">
                      <Check className="w-3.5 h-3.5" />
                      Aprovar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate({ id: t.id })} className="gap-1.5">
                      <X className="w-3.5 h-3.5" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">Aprovados ({approved.length})</h2>
        <div className="space-y-3">
          {approved.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{t.authorName}</p>
                <p className="text-sm text-foreground/70 italic mt-1 line-clamp-2">"{t.content}"</p>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={() => { if (confirm("Remover depoimento?")) deleteMutation.mutate({ id: t.id }); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Admin ───────────────────────────────────────────────────────────────
function GalleryAdmin() {
  const utils = trpc.useUtils();
  const { data: photos, isLoading } = trpc.gallery.adminList.useQuery();
  const approveMutation = trpc.gallery.approve.useMutation({
    onSuccess: () => { toast.success("Foto aprovada!"); utils.gallery.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => { toast.success("Foto removida!"); utils.gallery.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const pending = (photos || []).filter((p) => !p.approved);
  const approved = (photos || []).filter((p) => p.approved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">Fotos Pendentes ({pending.length})</h2>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-video rounded-lg bg-muted animate-pulse" />)}</div>
        ) : pending.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Nenhuma foto pendente.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pending.map((p) => (
              <div key={p.id} className="relative rounded-lg overflow-hidden border-2 border-yellow-400">
                <img src={p.url} alt={p.caption || "Foto"} className="w-full aspect-video object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 flex gap-2">
                  <Button size="sm" onClick={() => approveMutation.mutate({ id: p.id })} className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700">
                    <Check className="w-3 h-3 mr-1" />Aprovar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate({ id: p.id })} className="flex-1 h-7 text-xs">
                    <X className="w-3 h-3 mr-1" />Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="font-serif text-xl font-bold text-foreground mb-4">Fotos Aprovadas ({approved.length})</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {approved.map((p) => (
            <div key={p.id} className="relative rounded-lg overflow-hidden group">
              <img src={p.url} alt={p.caption || "Foto"} className="w-full aspect-video object-cover" />
              <button
                onClick={() => { if (confirm("Remover foto?")) deleteMutation.mutate({ id: p.id }); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Donations Admin ─────────────────────────────────────────────────────────────
function DonationsAdmin() {
  const { data: donations, isLoading } = trpc.donations.adminList.useQuery();

  const total = (donations || []).reduce((sum, d) => {
    const v = parseFloat(d.amount || "0");
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-foreground">Doações ({donations?.length || 0})</h2>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold text-sm">
          Total: R$ {total.toFixed(2)}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : !donations || donations.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">Nenhuma doação registrada.</p>
      ) : (
        <div className="space-y-3">
          {donations.map((d) => (
            <div key={d.id} className="bg-card rounded-lg p-4 border border-border flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[oklch(0.82_0.18_85)]/20 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-[oklch(0.65_0.16_85)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{d.donorName || "Anônimo"}</p>
                {d.message && <p className="text-sm text-muted-foreground italic truncate">"{d.message}"</p>}
              </div>
              <div className="text-right shrink-0">
                {d.amount && <p className="font-bold text-primary">R$ {d.amount}</p>}
                <p className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <ShieldCheck className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">Faça login para acessar o painel administrativo.</p>
            <a href={getLoginUrl()}>
              <Button className="gap-2"><LogIn className="w-4 h-4" />Entrar</Button>
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <ShieldCheck className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Sem permissão</h2>
            <p className="text-muted-foreground">Você não tem permissão para acessar o painel administrativo.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[oklch(0.28_0.12_145)] text-white py-8">
        <div className="container flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[oklch(0.82_0.18_85)] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[oklch(0.20_0.08_145)]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-white/70 text-sm">Bem-vindo, {user.name}! Gerencie o portal Turista no Pará.</p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="spots">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="spots" className="gap-1.5"><MapPin className="w-4 h-4" />Pontos Turísticos</TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5"><Building2 className="w-4 h-4" />Parceiros</TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-1.5"><Star className="w-4 h-4" />Depoimentos</TabsTrigger>
            <TabsTrigger value="gallery" className="gap-1.5"><Camera className="w-4 h-4" />Galeria</TabsTrigger>
            <TabsTrigger value="donations" className="gap-1.5"><Heart className="w-4 h-4" />Doações</TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1.5"><MessageCircle className="w-4 h-4" />Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="spots"><SpotsAdmin /></TabsContent>
          <TabsContent value="partners"><PartnersAdmin /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsAdmin /></TabsContent>
          <TabsContent value="gallery"><GalleryAdmin /></TabsContent>
          <TabsContent value="donations"><DonationsAdmin /></TabsContent>
          <TabsContent value="feedback"><FeedbackAdmin /></TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
