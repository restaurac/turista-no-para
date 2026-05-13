import { useState } from "react";
import { Camera, X, ChevronLeft, ChevronRight, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";

const officialPhotos = [
  { url: "/manus-storage/estacao-docas-1_72c77fe1.jpg", caption: "Estação das Docas", spot: "Estação das Docas" },
  { url: "/manus-storage/estacao-docas-2_23a57224.jpg", caption: "Estação das Docas — Vista do Rio", spot: "Estação das Docas" },
  { url: "/manus-storage/mangal-garcas-1_ee7125a0.jpg", caption: "Mangal das Garças — Vista Aérea", spot: "Mangal das Garças" },
  { url: "/manus-storage/mangal-garcas-2_ee53e224.jpg", caption: "Mangal das Garças — Farol", spot: "Mangal das Garças" },
  { url: "/manus-storage/museu-goeldi-1_60139242.jpg", caption: "Museu Emílio Goeldi", spot: "Museu Emílio Goeldi" },
  { url: "/manus-storage/museu-goeldi-2_0d9797a6.webp", caption: "Museu Goeldi — Vitória-Régia", spot: "Museu Emílio Goeldi" },
  { url: "/manus-storage/bosque-rodrigues-1_b1f49894.jpg", caption: "Bosque Rodrigues Alves", spot: "Bosque Rodrigues Alves" },
  { url: "/manus-storage/bosque-rodrigues-2_4f3eb16f.webp", caption: "Bosque Rodrigues Alves — Entrada", spot: "Bosque Rodrigues Alves" },
  { url: "/manus-storage/basilica-nazare-1_3ad6f73e.jpg", caption: "Basílica de Nazaré", spot: "Basílica de Nazaré" },
  { url: "/manus-storage/basilica-nazare-2_5d4a4bcc.jpeg", caption: "Basílica de Nazaré — Fachada", spot: "Basílica de Nazaré" },
  { url: "/manus-storage/parque-utinga-1_94d05711.jpg", caption: "Parque Estadual do Utinga", spot: "Parque do Utinga" },
  { url: "/manus-storage/theatro-paz-1_5c08ed61.jpeg", caption: "Theatro da Paz — Interior", spot: "Theatro da Paz" },
  { url: "/manus-storage/theatro-paz-2_c1d5b1c9.jpg", caption: "Theatro da Paz — Fachada", spot: "Theatro da Paz" },
  { url: "/manus-storage/ver-o-peso-1_96476093.jpg", caption: "Mercado Ver-o-Peso", spot: "Ver-o-Peso" },
  { url: "/manus-storage/ver-o-peso-2_ccfc7707.jpg", caption: "Ver-o-Peso — Vista Aérea", spot: "Ver-o-Peso" },
  { url: "/manus-storage/parque-cop30-1_c11a0fe4.webp", caption: "Parque da Cidade — COP30", spot: "Parque da Cidade" },
  { url: "/manus-storage/parque-cop30-2_2bb29fc4.jpg", caption: "Parque da Cidade — Vista Aérea", spot: "Parque da Cidade" },
  { url: "/manus-storage/belem-panorama_3b6bbab2.jpg", caption: "Belém do Pará — Panorama", spot: "Belém" },
];

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState("image/jpeg");

  const { isAuthenticated } = useAuth();
  const { data: userPhotos } = trpc.gallery.list.useQuery();
  const uploadMutation = trpc.gallery.upload.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setUploadOpen(false);
      setCaption("");
      setPreview(null);
      setFileBase64(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const allPhotos = [...officialPhotos, ...(userPhotos || []).map((p) => ({ url: p.url, caption: p.caption || "Foto do visitante", spot: "Visitante" }))];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Arquivo muito grande. Máximo 5MB."); return; }
    setFileMime(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      setFileBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!fileBase64) { toast.error("Selecione uma foto."); return; }
    uploadMutation.mutate({ base64: fileBase64, mimeType: fileMime, caption });
  };

  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((i) => (i !== null ? (i - 1 + allPhotos.length) % allPhotos.length : 0));
  const nextImage = () => setLightboxIndex((i) => (i !== null ? (i + 1) % allPhotos.length : 0));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[oklch(0.28_0.12_145)] text-white py-12">
        <div className="container flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Galeria de Fotos</h1>
            <p className="text-white/80 text-lg">Imagens reais dos pontos turísticos de Belém e Ananindeua</p>
          </div>
          {isAuthenticated ? (
            <Button onClick={() => setUploadOpen(true)} className="gap-2 bg-[oklch(0.82_0.18_85)] text-[oklch(0.20_0.08_145)] hover:opacity-90 shrink-0">
              <Upload className="w-4 h-4" />
              Enviar Foto
            </Button>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="gap-2 bg-[oklch(0.82_0.18_85)] text-[oklch(0.20_0.08_145)] hover:opacity-90 shrink-0">
                <Camera className="w-4 h-4" />
                Entrar para enviar fotos
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="container py-10">
        <p className="text-muted-foreground text-sm mb-6">{allPhotos.length} fotos na galeria</p>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {allPhotos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="break-inside-avoid w-full rounded-lg overflow-hidden group cursor-zoom-in block"
            >
              <div className="relative overflow-hidden rounded-lg">
                <img src={photo.url} alt={photo.caption} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                  <p className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">{photo.caption}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Upload notice */}
        <div className="mt-12 bg-muted/50 rounded-xl p-6 text-center border border-border">
          <ImageIcon className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-foreground mb-2">Compartilhe suas fotos!</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            Visitou algum ponto turístico de Belém ou Ananindeua? Compartilhe suas fotos com a comunidade!
            As fotos passam por aprovação antes de aparecerem na galeria.
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button className="gap-2">
                <Camera className="w-4 h-4" />
                Entrar para enviar fotos
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Enviar Foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo-file">Foto (máx. 5MB)</Label>
              <Input id="photo-file" type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
            </div>
            {preview && (
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-border" />
            )}
            <div>
              <Label htmlFor="caption">Legenda (opcional)</Label>
              <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Descreva a foto..." className="mt-1" />
            </div>
            <p className="text-xs text-muted-foreground">
              Não envie fotos que exponham pessoas sem consentimento. Fotos inadequadas serão removidas pelo administrador.
            </p>
            <Button onClick={handleUpload} disabled={!fileBase64 || uploadMutation.isPending} className="w-full gap-2">
              {uploadMutation.isPending ? "Enviando..." : "Enviar Foto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={closeLightbox} aria-label="Fechar">
            <X className="w-8 h-8" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Anterior">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <div className="flex flex-col items-center gap-3 max-w-4xl w-full px-16" onClick={(e) => e.stopPropagation()}>
            <img src={allPhotos[lightboxIndex].url} alt={allPhotos[lightboxIndex].caption} className="max-h-[80vh] max-w-full object-contain rounded-lg" />
            <p className="text-white/80 text-sm text-center">{allPhotos[lightboxIndex].caption}</p>
            <p className="text-white/50 text-xs">{lightboxIndex + 1} / {allPhotos.length}</p>
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Próximo">
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
