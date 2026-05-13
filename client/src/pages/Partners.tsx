import { Building2, Phone, Globe, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const categoryLabels: Record<string, string> = {
  hotel: "Hotel", restaurante: "Restaurante", sorveteria: "Sorveteria",
  salao_beleza: "Salão de Beleza", outro: "Outro",
};

const categoryColors: Record<string, string> = {
  hotel: "bg-blue-100 text-blue-800",
  restaurante: "bg-orange-100 text-orange-800",
  sorveteria: "bg-pink-100 text-pink-800",
  salao_beleza: "bg-purple-100 text-purple-800",
  outro: "bg-gray-100 text-gray-800",
};

const categoryIcons: Record<string, string> = {
  hotel: "🏨", restaurante: "🍽️", sorveteria: "🍦", salao_beleza: "💇", outro: "🏢",
};

export default function Partners() {
  const { data: partners, isLoading } = trpc.partners.list.useQuery();

  const grouped = (partners || []).reduce<Record<string, typeof partners>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category]!.push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[oklch(0.28_0.12_145)] text-white py-12">
        <div className="container">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Empresas Parceiras</h1>
          <p className="text-white/80 text-lg">Hotéis, restaurantes e serviços recomendados em Belém e Ananindeua</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : !partners || partners.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">Nenhuma empresa parceira cadastrada</h3>
            <p className="text-muted-foreground">Em breve teremos parceiros disponíveis.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{categoryIcons[cat] || "🏢"}</span>
                  <h2 className="font-serif text-2xl font-bold text-foreground">{categoryLabels[cat] || cat}</h2>
                  <Badge variant="secondary">{items?.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(items || []).map((p) => (
                    <div key={p.id} className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4 mb-4">
                        {p.logo ? (
                          <img src={p.logo} alt={p.name} className="w-14 h-14 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg leading-tight">{p.name}</h3>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[p.category] || "bg-gray-100 text-gray-800"}`}>
                            {categoryLabels[p.category] || p.category}
                          </span>
                        </div>
                      </div>
                      {p.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">{p.description}</p>
                      )}
                      <div className="space-y-2 text-sm">
                        {p.address && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{p.address}</span>
                          </div>
                        )}
                        {p.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 text-primary shrink-0" />
                            <a href={`tel:${p.phone}`} className="hover:text-primary transition-colors">{p.phone}</a>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        {p.whatsapp && (
                          <a href={`https://wa.me/55${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button size="sm" className="w-full gap-1.5 bg-[#25D366] hover:bg-[#20b558] text-white">
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </Button>
                          </a>
                        )}
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button size="sm" variant="outline" className="w-full gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5" />
                              Site
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA for businesses */}
        <div className="mt-16 bg-[oklch(0.28_0.12_145)] text-white rounded-2xl p-8 md:p-12 text-center">
          <Building2 className="w-12 h-12 text-[oklch(0.82_0.18_85)] mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Divulgue sua empresa aqui!</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-6">
            Alcance milhares de turistas que visitam Belém e Ananindeua. Cadastre seu hotel, restaurante ou serviço no portal Turista no Pará.
          </p>
          <a
            href="https://wa.me/559100000000?text=Olá!%20Gostaria%20de%20cadastrar%20minha%20empresa%20no%20portal%20Turista%20no%20Pará."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-[oklch(0.82_0.18_85)] text-[oklch(0.20_0.08_145)] hover:opacity-90 gap-2 font-semibold">
              <MessageCircle className="w-5 h-5" />
              Quero ser parceiro
            </Button>
          </a>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
