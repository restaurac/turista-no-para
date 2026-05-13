# Como Configurar seu Site Turista no Pará

Este projeto foi desvinculado do ambiente Manus e está pronto para ser hospedado no **GitHub**, **Vercel**, **Neon Tech** ou **TiDB Cloud**.

## 1. Banco de Dados
O site utiliza MySQL. Você pode usar o **Neon Tech** (com modo MySQL) ou **TiDB Cloud**.
1. Crie um banco de dados em um desses serviços.
2. Execute o conteúdo do arquivo `init_database.sql` no console SQL do seu banco de dados para criar todas as tabelas necessárias.

## 2. Hospedagem (Vercel/GitHub)
1. Suba os arquivos para um repositório no **GitHub**.
2. Conecte o repositório à **Vercel**.
3. Nas configurações da Vercel, adicione as seguintes **Environment Variables** (Variáveis de Ambiente):
   - `DATABASE_URL`: A URL de conexão do seu banco de dados (ex: `mysql://usuario:senha@host:port/dbname`).
   - `JWT_SECRET`: Uma senha aleatória para as sessões do site.
   - `OWNER_OPEN_ID`: Defina como `admin-user` (ou o ID que você definiu no SQL).

## 3. Personalização de Links (WhatsApp e Doações)
Você pode alterar seus links diretamente nos seguintes arquivos:

- **WhatsApp Geral (Botão Flutuante):** Edite `client/src/components/WhatsAppButton.tsx`.
- **WhatsApp de Parcerias:** Edite `client/src/pages/Partners.tsx` (procure por `wa.me`).
- **Doações (Pix e Mercado Pago):** Edite `client/src/pages/Donations.tsx` (linhas 14 e 15).
- **Redes Sociais:** Edite `client/src/components/Footer.tsx`.

## 4. Imagens
As imagens originais que estavam no Manus foram mantidas como referências. Para novas imagens:
- Elas serão salvas na pasta `client/public/uploads`.
- Em hospedagens como Vercel, arquivos salvos em disco durante a execução são temporários. Para produção profissional, recomenda-se configurar um serviço como AWS S3 ou Cloudinary no arquivo `server/storage.ts`.

---
Pronto! Agora seu site é totalmente independente.
