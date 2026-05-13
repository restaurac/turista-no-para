# 🚀 Guia de Publicação: Turista no Pará

Este guia contém o passo a passo exato para você usar suas contas do **GitHub**, **Vercel** e **Neon/TiDB** para colocar seu site online e independente.

---

## 1. Preparando o Banco de Dados (Neon Tech ou TiDB Cloud)
Como você já tem as contas, escolha uma delas para hospedar seus dados:

1.  **Acesse o Console**: Entre no painel da Neon ou TiDB.
2.  **Crie um Banco**: Se ainda não tiver, crie um novo projeto/banco chamado `turista_no_para`.
3.  **Execute o SQL**:
    *   Abra a aba "SQL Editor" ou "Console".
    *   Copie todo o conteúdo do arquivo `init_database.sql` (que está no ZIP) e cole lá.
    *   Execute os comandos. Isso criará todas as tabelas (usuários, parceiros, doações, etc).
4.  **Pegue a URL de Conexão**:
    *   Procure por "Connection String".
    *   Ela deve ser algo como: `mysql://usuario:senha@host.neon.tech/turista_no_para`
    *   **Guarde essa URL**, vamos usar na Vercel.

---

## 2. Subindo para o GitHub
1.  **Crie um Repositório**: No seu GitHub, crie um novo repositório chamado `turista-no-para` (pode ser privado ou público).
2.  **Suba os Arquivos**:
    *   Extraia o arquivo ZIP que te enviei.
    *   Suba todos os arquivos extraídos para este repositório.
    *   *Dica: Se souber usar o Git no computador é melhor, mas você também pode arrastar os arquivos direto no site do GitHub.*

---

## 3. Configurando na Vercel
1.  **Importe o Projeto**: No painel da Vercel, clique em "Add New" -> "Project" e selecione o repositório do GitHub que você acabou de criar.
2.  **Configurações de Build**: A Vercel deve detectar automaticamente que é um projeto Vite/Node.js.
3.  **Variáveis de Ambiente (CRUCIAL)**:
    Antes de clicar em "Deploy", expanda a seção **Environment Variables** e adicione estas três:
    *   `DATABASE_URL`: Cole aqui aquela URL de conexão que você pegou no Passo 1.
    *   `JWT_SECRET`: Digite qualquer sequência de letras e números aleatórios (ex: `site_turista_2024_seguro`).
    *   `OWNER_OPEN_ID`: Digite `admin-user`.
4.  **Deploy**: Clique em "Deploy". Aguarde alguns minutos e seu site estará online com um link `.vercel.app`.

---

## 4. Onde Editar seus Links (No Código)
Para deixar o site com a sua cara, você pode editar estes arquivos direto no GitHub:

| O que mudar? | Arquivo para editar | O que procurar? |
| :--- | :--- | :--- |
| **Seu WhatsApp** | `client/src/components/WhatsAppButton.tsx` | O número `559100000000` |
| **Link de Doação** | `client/src/pages/Donations.tsx` | `PIX_KEY` e `MERCADO_PAGO_LINK` |
| **Instagram/Face** | `client/src/components/Footer.tsx` | Os links de redes sociais no final do arquivo |

---

### 💡 Dica de Ouro
Se ao abrir o site ele ainda mostrar uma tela branca, verifique se a `DATABASE_URL` na Vercel está correta e se você executou o `init_database.sql` no banco de dados. Esses são os dois pontos onde a maioria dos erros acontece!

**Pronto! Agora seu site é 100% seu e independente.** 🇧🇷✨
