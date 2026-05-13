import { Link } from "wouter";
import { MapPin, Mail, Instagram, Facebook, Heart, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[oklch(0.22_0.10_145)] text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[oklch(0.82_0.18_85)] flex items-center justify-center">
                <span className="text-[oklch(0.20_0.08_145)] font-bold text-sm">PA</span>
              </div>
              <div>
                <p className="font-serif font-bold text-lg leading-tight">Turista no Pará</p>
                <p className="text-xs text-white/60 leading-tight">Belém & Ananindeua</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Seu guia completo para explorar os encantos de Belém e Ananindeua, no coração da Amazônia.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[oklch(0.82_0.18_85)] hover:text-[oklch(0.20_0.08_145)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[oklch(0.82_0.18_85)] hover:text-[oklch(0.20_0.08_145)] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-[oklch(0.82_0.18_85)] mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[
                { href: "/pontos-turisticos", label: "Pontos Turísticos" },
                { href: "/galeria", label: "Galeria de Fotos" },
                { href: "/parceiros", label: "Empresas Parceiras" },
                { href: "/depoimentos", label: "Depoimentos" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[oklch(0.82_0.18_85)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="font-semibold text-[oklch(0.82_0.18_85)] mb-4 text-sm uppercase tracking-wider">Categorias</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {["Museus", "Parques", "Monumentos", "Gastronomia", "Religioso", "Natureza"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/pontos-turisticos?categoria=${cat.toLowerCase()}`}
                    className="hover:text-[oklch(0.82_0.18_85)] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback */}
          <div>
            <h4 className="font-semibold text-[oklch(0.82_0.18_85)] mb-4 text-sm uppercase tracking-wider">Feedback</h4>
            <p className="text-white/70 text-sm mb-4">Sua opinião é importante! Nos ajude a melhorar.</p>
            <Link href="/contato">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Deixar Sugestão
              </button>
            </Link>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-[oklch(0.82_0.18_85)] mb-4 text-sm uppercase tracking-wider">Contato</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[oklch(0.82_0.18_85)] shrink-0" />
                <span>Belém, Pará — Brasil</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[oklch(0.82_0.18_85)] shrink-0" />
                <a href="mailto:contato@turistanopara.com.br" className="hover:text-[oklch(0.82_0.18_85)] transition-colors">
                  contato@turistanopara.com.br
                </a>
              </li>
            </ul>
            <Link href="/doacoes">
              <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.82_0.18_85)] text-[oklch(0.20_0.08_145)] text-sm font-semibold hover:opacity-90 transition-opacity">
                <Heart className="w-4 h-4" />
                Apoiar o Projeto
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>
            © {currentYear} Turista no Pará. Todos os direitos reservados.
          </p>
          <p className="text-center">
            As imagens utilizadas neste site são de domínio público ou licenciadas para uso editorial.
            Proibida reprodução sem autorização.
          </p>
          <p>
            Belém, Pará — Brasil 🇧🇷
          </p>
        </div>
      </div>
    </footer>
  );
}
