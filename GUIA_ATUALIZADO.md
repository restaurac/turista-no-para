# Guia de Configuração Atualizado - Turista no Pará

Este projeto foi atualizado para funcionar de forma independente no **Vercel** com banco de dados **Neon (PostgreSQL)**.

## 🚀 Passo a Passo para Publicação

### 1. Banco de Dados (Neon.tech)
1. Crie um projeto no [Neon.tech](https://neon.tech).
2. No Console do Neon, vá em **SQL Editor**.
3. Copie o conteúdo do arquivo `init_database_postgres.sql` e execute-o para criar as tabelas.
4. Pegue sua **Connection String** (ex: `postgresql://user:password@host/dbname?sslmode=require`).

### 2. Google Maps
1. Obtenha uma API Key no [Google Cloud Console](https://console.cloud.google.com/).
2. Ative a "Maps JavaScript API".

### 3. Variáveis de Ambiente (Vercel)
No painel do seu projeto no Vercel, adicione as seguintes variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Sua string de conexão do Neon | `postgresql://...` |
| `VITE_GOOGLE_MAPS_API_KEY` | Sua chave do Google Maps | `AIza...` |
| `ADMIN_EMAIL` | E-mail para acessar o painel admin | `admin@seuemail.com` |
| `ADMIN_PASSWORD` | Senha para o painel admin | `suasenha123` |
| `JWT_SECRET` | Uma frase aleatória para segurança | `qualquer-frase-longa` |
| `OWNER_OPEN_ID` | ID do admin (pode manter o padrão) | `admin-user` |

### 4. Como fazer Login
1. Acesse seu site e clique em **Entrar** ou vá direto para `/login`.
2. Use o e-mail e senha que você configurou nas variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
3. Após o login, você terá acesso ao botão **Admin** na barra de navegação.

## 🛠 Mudanças Realizadas
- **Banco de Dados:** Migrado de MySQL para PostgreSQL (compatível com Neon).
- **Fotos:** Corrigidas para usar links públicos (Unsplash), removendo a dependência do proxy interno.
- **Mapa:** Agora carrega diretamente da API do Google usando sua chave.
- **Login:** Sistema simplificado e independente, sem depender de serviços externos do Manus.
- **Admin:** Painel de Feedback e gerenciamento totalmente funcionais.

---
*Dica: Após subir para o Vercel, acesse a página inicial uma vez para que o sistema popule o banco de dados com os pontos turísticos iniciais automaticamente.*
