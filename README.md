# Would You Meme Rather? 🎭 — Meme Edition

Uma aplicação web moderna e interativa onde os usuários tomam decisões difíceis no estilo *"Would You Rather"* (Você Prefere) entre duas imagens de memes clássicos e virais do Reddit e Imgflip. A interface exibe dados de estatísticas em tempo real (qual opção a maioria escolheu) e acompanha o desempenho do usuário por meio de sequências de acertos (*streaks*).

---

## 🚀 Funcionalidades Principais

- **Navegação Vertical Infinita**: Interface fluida de slides verticais alimentada por **Swiper.js**, permitindo navegar pelas comparações usando a roda do mouse, teclado ou toque na tela.
- **Estatísticas em Tempo Real**: Após fazer uma escolha, o sistema exibe dinamicamente a porcentagem de preferência da comunidade para cada meme.
- **Gerador de Memes Combinado (Infinite Scroll)**: Carrega imagens populares do **Imgflip API** e faz paginação contínua obtendo novos memes do **Reddit API** (buscando de subreddits como `r/memes`, `r/dankmemes` e `r/me_irl`).
- **Sistema de Sequências (Streaks)**:
  - **Hot Streak (Fogo) 🔥**: Aumenta sempre que o usuário escolhe a opção mais votada pela comunidade (a maioria).
  - **Cold Streak (Gelo) ❄️**: Aumenta quando o usuário escolhe a opção menos popular (a minoria).
  - Acompanhamento em tempo real da maior sequência obtida na sessão.
- **Integração com Supabase (Backend)**:
  - Registro de sessões de usuário (`game_sessions`) com tempo de atividade, contagem de votos e maiores pontuações de sequências.
  - Incremento atômico de visualizações e votos no banco de dados através de funções remotas (RPC).
- **Interface Premium e Temas**:
  - Design responsivo adaptável a dispositivos móveis e desktops.
  - Modos de visualização **Expandido (Full)** e **Compacto**.
  - Modo Escuro (Dark Mode) por padrão com alternador para Modo Claro (Light Mode).
  - Animações robustas e discretas controladas por **GSAP**.

---

## 🛠️ Tecnologias e Dependências

O projeto foi estruturado com as seguintes tecnologias modernas:

- **Core**: [React](https://react.dev/) + [Vite](https://vite.dev/) (Rápido HMR e Build Otimizado)
- **Estilização**: Vanilla CSS com variáveis CSS para suporte nativo a temas (Light / Dark mode).
- **Animações**: [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform) para micro-interações refinadas.
- **Slide / Swipe Engine**: [Swiper.js](https://swiperjs.com/) para o fluxo vertical nativo de slides.
- **Notificações & Modais**: [SweetAlert2](https://sweetalert2.github.io/) para tratamento visual e amigável de erros de rede.
- **Backend / Database**: [Supabase](https://supabase.com/) para dados distribuídos de estatísticas globais e sessões.

---

## 📁 Estrutura de Arquivos

Abaixo está o layout organizacional dos arquivos principais do projeto:

```text
WouldYouMemeRather/
├── public/
├── src/
│   ├── assets/             # Arquivos de mídia estática
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── Header/          # Barra superior (logo, tema, alternar visualização)
│   │   ├── Loader/          # Tela de carregamento animada
│   │   ├── MemeSlide/       # Estrutura do slide contendo o duelo dos dois memes
│   │   └── StreakCounter/   # Contador e animação da sequência atual (fogo/gelo)
│   ├── hooks/
│   │   └── useMemes.js     # Hook personalizado para carregamento, mistura e paginação
│   ├── services/
│   │   ├── imgflipApi.js   # Integração com a API da Imgflip
│   │   ├── redditApi.js    # Integração com a API de busca de memes do Reddit
│   │   └── supabaseClient.js # Configuração do cliente Supabase e chamadas de persistência
│   ├── App.css             # Estilo da aplicação principal
│   ├── App.jsx             # Fluxo lógico de estado, sessões e renderização raiz
│   ├── index.css           # Estilos globais e sistema de tokens de design CSS (Temas)
│   └── main.jsx            # Arquivo de entrada da aplicação
├── .env.local              # Variáveis de ambiente locais (Ignorado no Git)
├── package.json
└── vite.config.js
```

---

## ⚙️ Configuração do Banco de Dados (Supabase)

Para o funcionamento correto de estatísticas e sessões globais, crie as seguintes tabelas e funções RPC no editor SQL do seu painel do Supabase:

### 1. Tabela `meme_stats`
Armazena a quantidade de votos e visualizações totais de cada meme.
```sql
create table meme_stats (
  meme_id text primary key,
  votes bigint default 0,
  views bigint default 0
);
```

### 2. Tabela `game_sessions`
Armazena as estatísticas anônimas de engajamento de cada sessão de jogo.
```sql
create table game_sessions (
  id text primary key,
  last_active_at timestamp with time zone default now(),
  votes_count integer default 0,
  max_hot_streak integer default 0,
  max_cold_streak integer default 0,
  session_duration integer default 0
);
```

### 3. Função RPC `increment_meme_stats`
Utilizada para atualizar de forma segura e atômica os contadores do meme vencedor e do meme rejeitado em uma única transação no banco de dados.
```sql
create or replace function increment_meme_stats(chosen_id text, rejected_id text)
returns void as $$
begin
  -- Atualizar ou inserir estatísticas para o meme escolhido
  insert into meme_stats (meme_id, votes, views)
  values (chosen_id, 1, 1)
  on conflict (meme_id)
  do update set 
    votes = meme_stats.votes + 1,
    views = meme_stats.views + 1;

  -- Atualizar ou inserir estatísticas para o meme rejeitado
  insert into meme_stats (meme_id, votes, views)
  values (rejected_id, 0, 1)
  on conflict (meme_id)
  do update set 
    views = meme_stats.views + 1;
end;
$$ language plpgsql security definer;
```

---

## 🔧 Configuração e Execução

### Passos iniciais

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd WouldYouMemeRather
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=https://sua-url-do-supabase.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publica
   ```
   *(Caso não adicione as chaves ou utilize placeholders, o aplicativo continuará rodando localmente sem persistência global, simulando as porcentagens localmente de forma segura).*

### Executando em ambiente local de desenvolvimento

Para iniciar o servidor local com Hot Module Replacement (HMR):
```bash
npm run dev
```
O console exibirá o endereço local (geralmente `http://localhost:5173/` ou similar).

### Build de Produção

Para compilar e otimizar os arquivos estáticos para produção na pasta `/dist`:
```bash
npm run build
```

Para pré-visualizar a build localmente antes de realizar o deploy:
```bash
npm run preview
```

---

## 📄 Licença

Este projeto está disponível sob a licença MIT. Sinta-se à vontade para clonar, sugerir alterações ou criar suas próprias edições de memes! 🚀
