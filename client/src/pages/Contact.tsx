import { useState } from "react";
import { MessageCircle, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    feedbackType: "sugestao",
    rating: 5,
  });
  const [submitted, setSubmitted] = useState(false);

  const feedbackMutation = trpc.feedbacks.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Feedback enviado com sucesso! Obrigado pela sua contribuição! 💚");
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "", feedbackType: "sugestao", rating: 5 });
        setSubmitted(false);
      }, 3000);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    feedbackMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-[oklch(0.82_0.18_85)] py-12">
        <div className="container text-center">
          <MessageCircle className="w-14 h-14 text-[oklch(0.28_0.12_145)] mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[oklch(0.20_0.08_145)] mb-3">Entre em Contato</h1>
          <p className="text-[oklch(0.28_0.12_145)]/80 text-lg max-w-2xl mx-auto">
            Sua opinião é valiosa! Nos ajude a melhorar o portal Turista no Pará com suas sugestões, críticas ou elogios.
          </p>
        </div>
      </div>

      <div className="container py-12 flex-1">
        {submitted ? (
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Obrigado! 💚</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Seu feedback foi recebido com sucesso. Vamos analisar e usar suas sugestões para melhorar ainda mais!
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Enviar outro feedback
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Formulário de Feedback</h2>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Seu Nome *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Como você gostaria de ser chamado?"
                    className="mt-2"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Seu E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu.email@exemplo.com"
                    className="mt-2"
                  />
                </div>

                {/* Feedback Type */}
                <div>
                  <Label htmlFor="type" className="text-foreground font-medium">
                    Tipo de Feedback *
                  </Label>
                  <select
                    id="type"
                    value={formData.feedbackType}
                    onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value as any })}
                    className="mt-2 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="sugestao">💡 Sugestão de Melhoria</option>
                    <option value="elogio">👍 Elogio</option>
                    <option value="reclamacao">⚠️ Reclamação</option>
                    <option value="outro">❓ Outro</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject" className="text-foreground font-medium">
                    Assunto *
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Resumo do seu feedback"
                    className="mt-2"
                  />
                </div>

                {/* Rating */}
                <div>
                  <Label className="text-foreground font-medium">Avaliação (opcional)</Label>
                  <div className="flex gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating
                              ? "fill-[oklch(0.82_0.18_85)] text-[oklch(0.82_0.18_85)]"
                              : "text-muted"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="text-foreground font-medium">
                    Sua Mensagem *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Conte-nos o que você acha. Seja específico e construtivo!"
                    rows={5}
                    className="mt-2 resize-none"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={feedbackMutation.isPending}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                  {feedbackMutation.isPending ? "Enviando..." : "Enviar Feedback"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Seus dados serão armazenados com segurança e usados apenas para melhorar nossos serviços.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-3">Por que seu feedback é importante?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  Nos ajuda a identificar problemas e melhorias
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  Contribui para uma melhor experiência de todos os usuários
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  Mostra que você se importa com o projeto
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  Pode resultar em novas funcionalidades e conteúdos
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
