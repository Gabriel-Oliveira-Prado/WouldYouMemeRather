# 🤔 Would You Meme Rather? — Meme Edition

A modern and interactive web application where users make tough choices in a *"Would You Rather"* style between two classic and viral meme images fetched from Reddit and Imgflip. The interface displays real-time voting statistics (showing which option the majority chose) and tracks player streaks.

---

## 🚀 Key Features

- **Infinite Vertical Navigation**: Fluid vertical slide transitions powered by **Swiper.js**, allowing users to browse pairs using mouse scroll wheel, keyboard arrows, or touch swipes.
- **Real-Time Statistics**: Once a choice is made, the system displays the percentage of user votes each meme has received.
- **Combined Meme Generator (Infinite Scroll)**: Initially loads popular templates from the **Imgflip API** and infinitely fetches/paginates memes from the **Reddit API** (using subreddits like `r/memes`, `r/dankmemes`, and `r/me_irl`).
- **Streak System**:
  - **Hot Streak 🔥**: Increases when the player picks the choice aligned with the community majority.
  - **Cold Streak ❄️**: Increases when the player picks the minority choice.
  - Tracks the peak hot/cold streak achieved during the active session.
- **Supabase Integration**:
  - Tracks active game sessions (`game_sessions`) with duration, total votes, and peak streaks.
  - Performs atomic increments of votes and views using database Remote Procedure Calls (RPC).
- **Premium Design & Themes**:
  - Responsive design optimized for both mobile and desktop screens.
  - Features **Expanded (Full)** and **Compact** view mode toggles.
  - Dark Mode by default, toggleable to Light Mode using CSS variables.
  - Smooth, elegant micro-animations controlled by **GSAP**.

---

## 🛠️ Tech Stack & Dependencies

- **Core**: [React](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: Vanilla CSS with CSS custom properties for native light/dark theme toggles.
- **Animations**: [GSAP](https://greensock.com/gsap/) for custom micro-animations.
- **Slider/Swipe**: [Swiper.js](https://swiperjs.com/) for the vertical viewport-slider.
- **Modals/Alerts**: [SweetAlert2](https://sweetalert2.github.io/) for pleasant error diagnostics.
- **Backend/Database**: [Supabase](https://supabase.com/) for real-time global statistics and analytics.

---

## 📁 Project Structure

```text
WouldYouMemeRather/
├── public/
├── src/
│   ├── assets/             # Static assets
│   ├── components/         # Reusable React components
│   │   ├── Header/          # Navbar containing logo, theme toggle, and view expander
│   │   ├── Loader/          # Lottie/CSS animated loading screen
│   │   ├── MemeSlide/       # Dueling card logic and statistics bar
│   │   └── StreakCounter/   # Current active streak flame/ice animation overlay
│   ├── hooks/
│   │   └── useMemes.js     # Custom hook for shuffling, paging, and API composition
│   ├── services/
│   │   ├── imgflipApi.js   # Imgflip template integration API
│   │   ├── redditApi.js    # Reddit trending memes fetch API
│   │   └── supabaseClient.js # Supabase clients, hooks, and persistence calls
│   ├── App.css             # Main application layout styles
│   ├── App.jsx             # State orchestration, Swiper container, and logic entry
│   ├── index.css           # Global resets and CSS variables (theme configuration)
│   └── main.jsx            # React root mount point
├── .env.local              # Local environment variables (Git ignored)
├── package.json
└── vite.config.js
```

---

## ⚙️ Database Schema & Bootstrap Setup

Create the following tables and RPC functions inside your Supabase project's SQL Editor to set up statistics tracking:

### 1. Table `meme_stats`
```sql
create table meme_stats (
  meme_id text primary key,
  votes bigint default 0,
  views bigint default 0
);
```

### 2. Table `game_sessions`
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

### 3. RPC Function `increment_meme_stats`
```sql
create or replace function increment_meme_stats(chosen_id text, rejected_id text)
returns void as $$
begin
  -- Update or insert stats for chosen option
  insert into meme_stats (meme_id, votes, views)
  values (chosen_id, 1, 1)
  on conflict (meme_id)
  do update set 
    votes = meme_stats.votes + 1,
    views = meme_stats.views + 1;

  -- Update or insert stats for rejected option
  insert into meme_stats (meme_id, votes, views)
  values (rejected_id, 0, 1)
  on conflict (meme_id)
  do update set 
    views = meme_stats.views + 1;
end;
$$ language plpgsql security definer;
```

---

## 🔌 Connecting to Your Database

To connect this application to your own Supabase database, follow either of the methods below:

### Method A: Environment File (Recommended)
1. In the root of the project, create a `.env.local` file.
2. Add your Supabase project keys:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
   ```
*(If these variables are omitted or contain placeholders, the app will run locally and simulate vote statistics dynamically without throwing errors).*

### Method B: Supabase CLI Integration
If you wish to log in, initialize local configurations, or link your workspace directly to your Supabase project via terminal:

1. **Log in to Supabase CLI:**
   ```bash
   npx supabase login
   ```

2. **Initialize Supabase in the project folder:**
   ```bash
   npx supabase init
   ```

3. **Link to your remote project:**
   ```bash
   npx supabase link --project-ref <your-supabase-project-ref-id>
   ```

4. **Pull database schemas (Optional):**
   ```bash
   npx supabase db pull
   ```

---

## 🔧 Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone <REPOSITORY_URL>
   cd WouldYouMemeRather
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
The app will run and be available at the local address printed on your terminal (usually `http://localhost:5173/`).

4. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📄 License

Distributed under the MIT License. Feel free to clone, edit, and play! 🚀
