import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, MapPin, LogIn, LogOut, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/pontos-turisticos", label: "Pontos Turísticos" },
  { href: "/galeria", label: "Galeria" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "/depoimentos", label: "Depoimentos" },
  { href: "/doacoes", label: "Doações" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Você saiu da sua conta.");
      window.location.href = "/";
    },
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-[oklch(0.28_0.12_145)] flex items-center justify-center shadow-md shrink-0 overflow-hidden">
            <svg viewBox="0 0 40 40" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="oklch(0.28 0.12 145)" />
              {/* Estrela do Pará */}
              <polygon points="20,6 22.5,14 31,14 24.5,19 27,27 20,22 13,27 15.5,19 9,14 17.5,14" fill="oklch(0.82 0.18 85)" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="font-serif font-bold text-primary text-lg leading-tight">Turista no Pará</p>
            <p className="text-xs text-muted-foreground leading-tight">Belém & Ananindeua</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden lg:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
                <User className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium max-w-[120px] truncate">{user?.name || "Usuário"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                className="gap-1.5 text-muted-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                <LogIn className="w-4 h-4" />
                Entrar
              </Button>
            </a>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md text-foreground/70 hover:text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            {isAuthenticated ? (
              <div className="space-y-1">
                {user?.role === "admin" && (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Painel Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => { logout.mutate(); setOpen(false); }}
                >
                  <LogOut className="w-4 h-4" />
                  Sair ({user?.name})
                </Button>
              </div>
            ) : (
              <a href={getLoginUrl()} className="block">
                <Button size="sm" className="w-full gap-1.5 bg-primary">
                  <LogIn className="w-4 h-4" />
                  Entrar / Cadastrar
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
