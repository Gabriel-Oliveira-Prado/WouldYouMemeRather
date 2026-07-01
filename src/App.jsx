import { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Keyboard } from 'swiper/modules';
import 'swiper/css';

import Header from './components/Header/Header';
import MemeSlide from './components/MemeSlide/MemeSlide';
import Loader from './components/Loader/Loader';
import StreakCounter from './components/StreakCounter/StreakCounter';
import { useMemes } from './hooks/useMemes';
import { trackSession } from './services/supabaseClient';
import Swal from 'sweetalert2';

export default function App() {
  const { pairs, loading, error, loadMore, loadingMore, hasMore } = useMemes();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Streak state
  const [streak, setStreak] = useState({ type: null, count: 0 });
  const [maxHotStreak, setMaxHotStreak] = useState(0);
  const [maxColdStreak, setMaxColdStreak] = useState(0);

  // Session Analytics State
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('game_session_id');
    if (!sid) {
      sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('game_session_id', sid);
    }
    return sid;
  });
  
  const [votesCount, setVotesCount] = useState(0);
  const [sessionStartTime] = useState(() => Date.now());

  // Initialize session and send heartbeats every 15s
  useEffect(() => {
    // Initial heartbeat/register
    trackSession(sessionId, votesCount, maxHotStreak, maxColdStreak, sessionStartTime);

    // Heartbeat timer
    const interval = setInterval(() => {
      trackSession(sessionId, votesCount, maxHotStreak, maxColdStreak, sessionStartTime);
    }, 15000);

    return () => clearInterval(interval);
  }, [sessionId, sessionStartTime, maxHotStreak, maxColdStreak]);

  // Sync vote updates to Supabase instantly when votesCount or streaks change
  useEffect(() => {
    if (votesCount > 0) {
      trackSession(sessionId, votesCount, maxHotStreak, maxColdStreak, sessionStartTime);
    }
  }, [votesCount, sessionId, sessionStartTime, maxHotStreak, maxColdStreak]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (error && pairs.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: error,
        background: 'var(--color-surface, #1a1a1d)',
        color: 'var(--color-text, #ffffff)',
        confirmButtonColor: 'var(--color-accent, #ff4d4d)',
        confirmButtonText: 'Tentar novamente'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  }, [error, pairs.length]);

  const handleChoiceResult = useCallback((isMajority) => {
    setVotesCount(prev => prev + 1);
    setStreak(prev => {
      const nextType = isMajority ? 'hot' : 'cold';
      const nextCount = prev.type === nextType ? prev.count + 1 : 1;
      
      if (nextType === 'hot') {
        setMaxHotStreak(m => Math.max(m, nextCount));
      } else {
        setMaxColdStreak(m => Math.max(m, nextCount));
      }

      return { type: nextType, count: nextCount };
    });
  }, []);

  if (loading && pairs.length === 0) {
    return <Loader />;
  }

  if (error && pairs.length === 0) {
    return (
      <div className="error-screen" id="error-screen">
        <div className="error-content">
          <span className="error-icon">😵</span>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button className="error-retry" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const handleSlideChange = (swiper) => {
    if (swiper.activeIndex >= pairs.length - 3) {
      loadMore();
    }
  };

  return (
    <div className={`app ${isExpanded ? 'expanded-view' : ''}`} id="app">
      <Header 
        onToggleExpand={() => setIsExpanded(!isExpanded)} 
        isExpanded={isExpanded} 
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <StreakCounter type={streak.type} count={streak.count} />

      <Swiper
        modules={[Mousewheel, Keyboard]}
        direction="vertical"
        slidesPerView={1}
        speed={600}
        mousewheel={{ sensitivity: 1 }}
        keyboard={{ enabled: true }}
        grabCursor
        className="app-swiper"
        onSlideChange={handleSlideChange}
      >
        {pairs.map((pair, index) => (
          <SwiperSlide key={pair.id}>
            <MemeSlide
              optionA={pair.optionA}
              optionB={pair.optionB}
              slideIndex={index}
              onChoice={handleChoiceResult}
            />
          </SwiperSlide>
        ))}

        {loadingMore && (
          <SwiperSlide>
            <div className="end-slide" id="loading-more-slide">
              <span className="end-icon" style={{ animation: 'loader-pulse 2s infinite' }}>🔄</span>
              <h2 className="end-title" style={{ fontSize: '1.2rem' }}>Fetching more memes...</h2>
              <p className="end-text">Straight from Reddit</p>
            </div>
          </SwiperSlide>
        )}

        {!hasMore && !loadingMore && pairs.length > 0 && (
          <SwiperSlide>
            <div className="end-slide" id="end-slide">
              <span className="end-icon">🏁</span>
              <h2 className="end-title">End of the line!</h2>
              <p className="end-text">You've seen all available memes for now.</p>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
