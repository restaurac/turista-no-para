import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { MapPin, Clock, Star, ChevronLeft, ChevronRight, Heart, Users, Camera, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const heroSlides = [
  { image: "/manus-storage/estacao-docas-1_72c77fe1.jpg", title: "Estação das Docas", subtitle: "Gastronomia e cultura à beira do Rio Guamá" },
  { image: "/manus-storage/mangal-garcas-1_ee7125a0.jpg", title: "Mangal das Garças", subtitle: "Natureza amazônica no coração de Belém" },
  { image: "/manus-storage/theatro-paz-1_5c08ed61.jpeg", title: "Theatro da Paz", subtitle: "Patrimônio histórico do ciclo da borracha" },
  { image: "/manus-storage/ver-o-peso-1_96476093.jpg", title: "Mercado Ver-o-Peso", subtitle: "A maior feira a céu aberto da América Latina" },
  { image: "/manus-storage/basilica-nazare-1_3ad6f73e.jpg", title: "Basílica de Nazaré", subtitle: "Sede do Círio, patrimônio imaterial da UNESCO" },
  { image: "/manus-storage/parque-cop30-1_c11a0fe4.webp", title: "Parque da Cidade", subtitle: "O legado verde da COP30 em Belém" },
];

const categoryIcons: Record<string, string> = {
  museu: "🏛️", parque: "🌿", monumento: "🏛", gastronomia: "🍽️",
  religioso: "⛪", natureza: "🌳", entretenimento: "🎭", outro: "📍",
};

const categoryLabels: Record<string, string> = {
  museu: "Museu", parque: "Parque", monumento: "Monumento", gastronomia: "Gastronomia",
  religioso: "Religioso", natureza: "Natureza", entretenimento: "Entretenimento", outro: "Outro",
};

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((c) => (c + 1) % heroSlides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {heroSlides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75" />
        </div>
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-4 text-center text-white">
        <div className="max-w-3xl">
          <Badge className="mb-4 bg-[oklch(0.82_0.18_85)] text-[oklch(0.20_0.08_145)] border-0 text-sm px-3 py-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            Belém & Ananindeua, Pará
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-3 drop-shadow-lg">{heroSlides[current].title}</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow">{heroSlides[current].subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pontos-turisticos">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg">
                <MapPin className="w-5 h-5" />
                Explorar Pontos Turísticos
              </Button>
            </Link>
            <Link href="/galeria">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20 gap-2">
                <Camera className="w-5 h-5" />
                Ver Galeria
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors" aria-label="Anterior">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors" aria-label="Próximo">
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "bg-[oklch(0.82_0.18_85)] w-6" : "bg-white/50 w-2"}`} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

type Spot = { id: number; name: string; slug: string; shortDescription?: string | null; city: string; category: string; coverImage?: string | null; openingHours?: string | null };

function SpotCard({ spot }: { spot: Spot }) {
  return (
    <Link href={`/pontos-turisticos/${spot.slug}`}>
      <div className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-border h-full">
        <div className="relative h-48 overflow-hidden">
          <img src={spot.coverImage || "/manus-storage/belem-panorama_3b6bbab2.jpg"} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">{spot.city}</Badge>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-xl">{categoryIcons[spot.category] || "📍"}</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{spot.name}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{spot.shortDescription || "Um dos pontos turísticos mais visitados de Belém do Pará."}</p>
          {spot.openingHours && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="line-clamp-1">{spot.openingHours}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

type Testimonial = { id: number; authorName: string; content: string; rating: number };

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-md border border-border h-full flex flex-col">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < t.rating ? "fill-[oklch(0.82_0.18_85)] text-[oklch(0.82_0.18_85)]" : "text-muted"}`} />
        ))}
      </div>
      <p className="text-foreground/80 text-sm leading-relaxed italic mb-4 flex-1">"{t.content}"</p>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          {t.authorName.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-sm text-foreground">{t.authorName}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: featuredSpots, isLoading: spotsLoading } = trpc.spots.featured.useQuery();
  const { data: testimonials } = trpc.testimonials.list.useQuery();
  const { data: partners } = trpc.partners.list.useQuery();
  const seedMutation = trpc.spots.seed.useMutation();

  useEffect(() => {
    seedMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <HeroCarousel />

      {/* Stats bar */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: MapPin, value: "10+", label: "Pontos Turísticos" },
              { icon: Camera, value: "100+", label: "Fotos na Galeria" },
              { icon: Building2, value: "20+", label: "Empresas Parceiras" },
              { icon: Users, value: "5000+", label: "Visitantes/Mês" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="w-5 h-5 text-[oklch(0.82_0.18_85)]" />
                <span className="font-bold text-xl">{value}</span>
                <span className="text-primary-foreground/70 text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Spots */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Pontos em Destaque</h2>
              <p className="text-muted-foreground text-lg mt-2">Os lugares mais incríveis de Belém e Ananindeua</p>
            </div>
            <Link href="/pontos-turisticos">
              <Button variant="outline" className="hidden sm:flex gap-2">
                Ver todos
                <MapPin className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {spotsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredSpots || []).map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          )}
          <div className="text-center mt-8 sm:hidden">
            <Link href="/pontos-turisticos">
              <Button variant="outline" className="gap-2">
                Ver todos os pontos turísticos
                <MapPin className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground text-center mb-8">Explore por Categoria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: "museu", label: "Museus", color: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200" },
              { key: "parque", label: "Parques", color: "bg-green-50 hover:bg-green-100 text-green-800 border-green-200" },
              { key: "gastronomia", label: "Gastronomia", color: "bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200" },
              { key: "religioso", label: "Religioso", color: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200" },
              { key: "natureza", label: "Natureza", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200" },
              { key: "monumento", label: "Monumentos", color: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200" },
              { key: "entretenimento", label: "Entretenimento", color: "bg-pink-50 hover:bg-pink-100 text-pink-800 border-pink-200" },
              { key: "outro", label: "Outros", color: "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200" },
            ].map((cat) => (
              <Link key={cat.key} href={`/pontos-turisticos?categoria=${cat.key}`}>
                <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${cat.color}`}>
                  <span className="text-3xl">{categoryIcons[cat.key]}</span>
                  <span className="font-medium text-sm text-center">{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map CTA */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="rounded-2xl overflow-hidden bg-[oklch(0.28_0.12_145)] text-white relative">
            <div className="absolute inset-0 opacity-10">
              <img src="/manus-storage/belem-panorama_3b6bbab2.jpg" alt="Belém" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Explore o Mapa Interativo</h2>
                <p className="text-white/80 text-lg max-w-lg">
                  Visualize todos os pontos turísticos de Belém e Ananindeua em um mapa interativo. Planeje seu roteiro com facilidade!
                </p>
              </div>
              <Link href="/pontos-turisticos">
                <Button size="lg" className="bg-[oklch(0.82_0.18_85)] text-[oklch(0.20_0.08_145)] hover:opacity-90 gap-2 whitespace-nowrap font-semibold">
                  <MapPin className="w-5 h-5" />
                  Abrir Mapa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">O que dizem os visitantes</h2>
              <p className="text-muted-foreground text-lg mt-2">Experiências reais de quem já explorou o Pará</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <TestimonialCard key={t.id} t={t} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/depoimentos">
                <Button variant="outline" className="gap-2">
                  Ver todos os depoimentos
                  <Star className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Partners */}
      {partners && partners.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Empresas Parceiras</h2>
              <p className="text-muted-foreground text-lg mt-2">Hotéis, restaurantes e serviços recomendados em Belém</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.slice(0, 3).map((p) => (
                <div key={p.id} className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs capitalize">{p.category.replace("_", " ")}</Badge>
                      {p.description && <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{p.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/parceiros">
                <Button variant="outline" className="gap-2">
                  Ver todas as empresas parceiras
                  <Building2 className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Donation CTA */}
      <section className="py-16 bg-[oklch(0.82_0.18_85)]">
        <div className="container text-center">
          <Heart className="w-12 h-12 text-[oklch(0.28_0.12_145)] mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[oklch(0.20_0.08_145)] mb-3">
            Apoie o Turismo no Pará
          </h2>
          <p className="text-[oklch(0.28_0.12_145)]/80 text-lg max-w-2xl mx-auto mb-8">
            Sua doação ajuda a manter este portal atualizado e a promover o turismo sustentável em Belém e Ananindeua.
          </p>
          <Link href="/doacoes">
            <Button size="lg" className="bg-[oklch(0.28_0.12_145)] text-white hover:bg-[oklch(0.22_0.10_145)] gap-2 font-semibold">
              <Heart className="w-5 h-5" />
              Fazer uma Doação
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
