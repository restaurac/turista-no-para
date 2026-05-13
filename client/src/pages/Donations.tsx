import { useState } from "react";
import { Heart, Copy, Check, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";

const PIX_KEY = "contato@turistanopara.com.br";
const MERCADO_PAGO_LINK = "https://mpago.la/turistanopara";

const donationAmounts = [
  { value: "10", label: "R$ 10", description: "Ajuda a manter o site" },
  { value: "25", label: "R$ 25", description: "Apoia a criação de conteúdo" },
  { value: "50", label: "R$ 50", description: "Financia uma nova rota turística" },
  { value: "100", label: "R$ 100", description: "Patrocina um ponto turístico" },
];

export default function Donations() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [donorName, setDonorName] = useState(user?.name || "");
  const [amount, setAmount] = useState("25");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = trpc.donations.register.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Obrigado pelo seu apoio! 💚");
    },
    onError: (e) => toast.error(e.message),
  });

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Chave Pix copiada!");
    });
  };

  const handleRegister = () => {
    registerMutation.mutate({ donorName: donorName || undefined, amount, message: message || undefined });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[oklch(0.82_0.18_85)] py-12">
        <div className="container text-center">
          <Heart className="w-14 h-14 text-[oklch(0.28_0.12_145)] mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[oklch(0.20_0.08_145)] mb-3">Apoie o Projeto</h1>
          <p className="text-[oklch(0.28_0.12_145)]/80 text-lg max-w-2xl mx-auto">
            Sua doação ajuda a manter o portal Turista no Pará atualizado, promovendo o turismo sustentável e a cultura amazônica.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {submitted ? (
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary fill-primary" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Muito obrigado! 💚</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Seu apoio é fundamental para manter o turismo no Pará em destaque. Que sua visita ao Pará seja inesquecível!
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="gap-2">
              <Heart className="w-4 h-4" />
              Fazer outra doação
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Left: How to donate */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Como doar</h2>
                <p className="text-muted-foreground">Escolha a forma de pagamento mais conveniente para você.</p>
              </div>

              {/* Pix */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#32BCAD]/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-[#32BCAD]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Pix</h3>
                    <p className="text-xs text-muted-foreground">Transferência instantânea</p>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Chave Pix (e-mail)</p>
                    <p className="font-mono text-sm text-foreground font-medium">{PIX_KEY}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyPix} className="gap-1.5 shrink-0">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Abra o app do seu banco, selecione Pix e cole a chave acima. Qualquer valor é bem-vindo!
                </p>
              </div>

              {/* Mercado Pago */}
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#009EE3]/10 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-[#009EE3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Mercado Pago</h3>
                    <p className="text-xs text-muted-foreground">Cartão de crédito ou débito</p>
                  </div>
                </div>
                <a href={MERCADO_PAGO_LINK} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full gap-2 bg-[#009EE3] hover:bg-[#0082bb] text-white">
                    <ExternalLink className="w-4 h-4" />
                    Doar pelo Mercado Pago
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-3">
                  Aceita cartão de crédito, débito e saldo Mercado Pago. Processamento seguro.
                </p>
              </div>

              {/* Impact */}
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-3">Como sua doação é usada</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Manutenção e hospedagem do portal",
                    "Criação de novos conteúdos sobre pontos turísticos",
                    "Fotografias profissionais dos atrativos",
                    "Divulgação do turismo paraense nas redes sociais",
                    "Desenvolvimento de novas funcionalidades",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Register donation */}
            <div>
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Registrar sua doação</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Após realizar o pagamento, registre sua doação aqui para que possamos agradecer e acompanhar o impacto.
                </p>

                {/* Amount selector */}
                <div className="mb-5">
                  <Label className="mb-2 block">Valor da doação</Label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {donationAmounts.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAmount(opt.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          amount === opt.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-bold text-lg">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Outro valor (ex: 30)"
                    value={donationAmounts.some((o) => o.value === amount) ? "" : amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donor-name">Seu nome (opcional)</Label>
                    <Input
                      id="donor-name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Como gostaria de ser chamado?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem (opcional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Deixe uma mensagem de apoio..."
                      rows={3}
                      className="mt-1 resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleRegister}
                    disabled={registerMutation.isPending}
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Heart className="w-4 h-4" />
                    {registerMutation.isPending ? "Registrando..." : "Registrar Doação"}
                  </Button>
                  <p className="text-sm text-foreground text-center font-medium mt-3 p-3 bg-[oklch(0.82_0.18_85)]/10 rounded-lg border border-[oklch(0.82_0.18_85)]/20">
                    ☕️ Pague um café ao Editor do site! Sua generosidade nos inspira a criar conteúdo cada vez melhor para você.
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    O registro é apenas para acompanhamento. O pagamento deve ser feito via Pix ou Mercado Pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
