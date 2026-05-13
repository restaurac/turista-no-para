import { useState } from "react";
import { Link, useSearch } from "wouter";
import { MapPin, Clock, Phone, Globe, Filter, Search, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MapView } from "@/components/Map";

const categoryIcons: Record<string, string> = {
  museu: "🏛️", parque: "🌿", monumento: "🏛", gastronomia: "🍽️",
  religioso: "⛪", natureza: "🌳", entretenimento: "🎭", outro: "📍",
};

const categoryLabels: Record<string, string> = {
  museu: "Museu", parque: "Parque", monumento: "Monumento", gastronomia: "Gastronomia",
  religioso: "Religioso", natureza: "Natureza", entretenimento: "Entretenimento", outro: "Outro",
};

export default function TouristSpots() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("categoria") || "";

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState(initialCategory);
  const [showMap, setShowMap] = useState(false);

  const { data: spots, isLoading } = trpc.spots.list.useQuery({
    city: city !== "all" ? city : undefined,
    category: category !== "all" && category ? category : undefined,
  });

  const filtered = (spots || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.shortDescription || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[oklch(0.28_0.12_145)] text-white py-12">
        <div className="container">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Pontos Turísticos</h1>
          <p className="text-white/80 text-lg">Explore os melhores destinos de Belém e Ananindeua, no Pará</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-border sticky top-16 z-40 shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ponto turístico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                <SelectItem value="Belém">Belém</SelectItem>
                <SelectItem value="Ananindeua">Ananindeua</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category || "all"} onValueChange={setCategory}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{categoryIcons[k]} {v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showMap ? "default" : "outline"}
              onClick={() => setShowMap(!showMap)}
              className="gap-2 shrink-0"
            >
              <MapIcon className="w-4 h-4" />
              {showMap ? "Ver Lista" : "Ver Mapa"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container py-8">
        {/* Map View */}
        {showMap && (
          <div className="mb-8 rounded-xl overflow-hidden border border-border shadow-md h-[450px]">
            <MapView
              onMapReady={(map) => {
                if (!spots) return;
                spots.forEach((spot) => {
                  if (spot.latitude && spot.longitude) {
                    const marker = new google.maps.Marker({
                      position: { lat: parseFloat(String(spot.latitude)), lng: parseFloat(String(spot.longitude)) },
                      map,
                      title: spot.name,
                    });
                    const infoWindow = new google.maps.InfoWindow({
                      content: `<div style="max-width:200px"><strong>${spot.name}</strong><br/><small>${spot.address}</small></div>`,
                    });
                    marker.addListener("click", () => infoWindow.open(map, marker));
                  }
                });
                // Default center: Belém
                map.setCenter({ lat: -1.4558, lng: -48.4902 });
                map.setZoom(12);
              }}
            />
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-sm">
            {isLoading ? "Carregando..." : `${filtered.length} ponto${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">Nenhum ponto encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((spot) => (
              <Link key={spot.id} href={`/pontos-turisticos/${spot.slug}`}>
                <div className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-border h-full">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={spot.coverImage || "/manus-storage/belem-panorama_3b6bbab2.jpg"}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs">{spot.city}</Badge>
                      <Badge variant="secondary" className="text-xs">{categoryLabels[spot.category] || spot.category}</Badge>
                    </div>
                    <div className="absolute top-3 right-3 text-2xl">{categoryIcons[spot.category] || "📍"}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">{spot.name}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{spot.shortDescription || "Ponto turístico de Belém do Pará."}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="line-clamp-1">{spot.address}</span>
                      </div>
                      {spot.openingHours && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="line-clamp-1">{spot.openingHours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
