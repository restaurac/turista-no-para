import { useState } from "react";
import { Link, useParams } from "wouter";
import { MapPin, Clock, Phone, Globe, ArrowLeft, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MapView } from "@/components/Map";

const categoryLabels: Record<string, string> = {
  museu: "Museu", parque: "Parque", monumento: "Monumento", gastronomia: "Gastronomia",
  religioso: "Religioso", natureza: "Natureza", entretenimento: "Entretenimento", outro: "Outro",
};

export default function SpotDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: spot, isLoading } = trpc.spots.bySlug.useQuery({ slug: slug || "" });

  const images: string[] = spot?.images ? JSON.parse(spot.images) : spot?.coverImage ? [spot.coverImage] : [];

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : 0));
  const nextImage = () => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : 0));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">Ponto turístico não encontrado</h2>
            <Link href="/pontos-turisticos">
              <Button variant="outline" className="gap-2 mt-4">
                <ArrowLeft className="w-4 h-4" />
                Voltar à listagem
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const mapsUrl = spot.latitude && spot.longitude
    ? `https://www.google.com/maps?q=${spot.latitude},${spot.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <img
          src={spot.coverImage || "/manus-storage/belem-panorama_3b6bbab2.jpg"}
          alt={spot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container">
            <Link href="/pontos-turisticos">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 mb-4 -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-primary/90 text-primary-foreground border-0">{spot.city}</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {categoryLabels[spot.category] || spot.category}
              </Badge>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-white drop-shadow-lg">{spot.name}</h1>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Sobre o local</h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{spot.description}</p>
            </div>

            {/* Photo Gallery */}
            {images.length > 0 && (
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Galeria de Fotos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className="relative aspect-video rounded-lg overflow-hidden group cursor-zoom-in"
                    >
                      <img src={img} alt={`${spot.name} - foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-bold text-foreground">Localização</h2>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    Abrir no Maps
                  </Button>
                </a>
              </div>
              <div className="rounded-lg overflow-hidden h-64 border border-border">
                <MapView
                  onMapReady={(map) => {
                    if (spot.latitude && spot.longitude) {
                      const lat = parseFloat(String(spot.latitude));
                      const lng = parseFloat(String(spot.longitude));
                      map.setCenter({ lat, lng });
                      map.setZoom(15);
                      new google.maps.Marker({
                        position: { lat, lng },
                        map,
                        title: spot.name,
                      });
                    } else {
                      map.setCenter({ lat: -1.4558, lng: -48.4902 });
                      map.setZoom(13);
                    }
                  }}
                />
              </div>
              <p className="text-muted-foreground text-sm mt-3 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {spot.address}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Info Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Informações Práticas</h3>
              <div className="space-y-4">
                {spot.openingHours && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Horário</p>
                      <p className="text-sm text-foreground mt-0.5">{spot.openingHours}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Endereço</p>
                    <p className="text-sm text-foreground mt-0.5">{spot.address}</p>
                  </div>
                </div>
                {spot.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Telefone</p>
                      <a href={`tel:${spot.phone}`} className="text-sm text-primary hover:underline mt-0.5 block">{spot.phone}</a>
                    </div>
                  </div>
                )}
                {spot.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Site Oficial</p>
                      <a href={spot.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-0.5 block truncate">{spot.website}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Button */}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                <MapPin className="w-4 h-4" />
                Ver no Google Maps
              </Button>
            </a>

            {/* Back */}
            <Link href="/pontos-turisticos">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Ver outros pontos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={closeLightbox} aria-label="Fechar">
            <X className="w-8 h-8" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Anterior">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <img
            src={images[lightboxIndex]}
            alt={`${spot.name} - foto ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Próximo">
            <ChevronRight className="w-10 h-10" />
          </button>
          <p className="absolute bottom-4 text-white/60 text-sm">{lightboxIndex + 1} / {images.length}</p>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
