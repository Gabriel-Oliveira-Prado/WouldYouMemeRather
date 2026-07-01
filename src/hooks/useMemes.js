import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { fetchMemes as fetchImgflip } from '../services/imgflipApi';
import { fetchRedditMemes } from '../services/redditApi';
import { fetchMemesStats } from '../services/supabaseClient';

// In-place array shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Pair memes for slides
function pairMemes(memes) {
  const pairs = [];
  for (let i = 0; i < memes.length - 1; i += 2) {
    pairs.push({
      id: `${memes[i].id}-${memes[i + 1].id}`,
      optionA: memes[i],
      optionB: memes[i + 1],
    });
  }
  return pairs;
}

// Main hook for fetching and pairing memes
export function useMemes() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Pagination references
  const redditAfterToken = useRef(null);
  const hasMore = useRef(true);
  const unpairMemeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel but handle failures gracefully
        const [imgflipRes, redditRes] = await Promise.allSettled([
          fetchImgflip(),
          fetchRedditMemes(null)
        ]);

        if (cancelled) return;

        let imgflipMemes = [];
        let redditMemes = [];

        if (imgflipRes.status === 'fulfilled') {
          imgflipMemes = imgflipRes.value;
        } else {
          console.error("Imgflip API failed to load:", imgflipRes.reason);
        }

        if (redditRes.status === 'fulfilled') {
          redditMemes = redditRes.value.memes;
          redditAfterToken.current = redditRes.value.after;
          if (!redditRes.value.after) {
            hasMore.current = false;
          }
        } else {
          console.error("Reddit API failed to load:", redditRes.reason);
          redditAfterToken.current = null;
          hasMore.current = false;
        }

        // If both failed, we show an error screen
        if (imgflipRes.status === 'rejected' && redditRes.status === 'rejected') {
          throw new Error("Ambas as fontes de memes falharam em iniciar. Verifique sua conexão.");
        }

        // Process data
        const combined = shuffle([...imgflipMemes, ...redditMemes]);

        // Fetch stats from Supabase in batch
        const ids = combined.map(m => m.id);
        const stats = await fetchMemesStats(ids);
        const statsMap = {};
        stats.forEach(row => {
          statsMap[row.meme_id] = { votes: row.votes, views: row.views };
        });

        // Merge stats with memes
        const combinedWithStats = combined.map(meme => ({
          ...meme,
          votes: statsMap[meme.id]?.votes || 0,
          views: statsMap[meme.id]?.views || 0,
        }));

        let toPair = combinedWithStats;

        if (combinedWithStats.length % 2 !== 0) {
          unpairMemeRef.current = combinedWithStats[combinedWithStats.length - 1];
          toPair = combinedWithStats.slice(0, -1);
        } else {
          unpairMemeRef.current = null;
        }

        setPairs(pairMemes(toPair));
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();
    return () => { cancelled = true; };
  }, []);

  async function loadMore() {
    if (loading || loadingMore || !hasMore.current) return;

    try {
      setLoadingMore(true);
      const redditData = await fetchRedditMemes(redditAfterToken.current);

      redditAfterToken.current = redditData.after;
      if (!redditData.after) {
        hasMore.current = false;
      }

      // Include leftover meme
      let newMemes = [];
      if (unpairMemeRef.current) {
        newMemes.push(unpairMemeRef.current);
        unpairMemeRef.current = null;
      }
      newMemes = newMemes.concat(redditData.memes);

      const shuffled = shuffle(newMemes);

      // Fetch stats from Supabase in batch
      const ids = shuffled.map(m => m.id);
      const stats = await fetchMemesStats(ids);
      const statsMap = {};
      stats.forEach(row => {
        statsMap[row.meme_id] = { votes: row.votes, views: row.views };
      });

      // Merge stats with memes
      const shuffledWithStats = shuffled.map(meme => ({
        ...meme,
        votes: statsMap[meme.id]?.votes || 0,
        views: statsMap[meme.id]?.views || 0,
      }));

      let toPair = shuffledWithStats;
      if (shuffledWithStats.length % 2 !== 0) {
        unpairMemeRef.current = shuffledWithStats[shuffledWithStats.length - 1];
        toPair = shuffledWithStats.slice(0, -1);
      }

      const newPairs = pairMemes(toPair);

      setPairs(prev => [...prev, ...newPairs]);

    } catch (err) {
      console.error("Erro ao carregar mais memes:", err);
      Swal.fire({
        icon: 'error',
        title: 'Erro de conexão',
        text: 'Não foi possível carregar mais memes. Verifique sua internet.',
        background: 'var(--color-surface, #1a1a1d)',
        color: 'var(--color-text, #ffffff)',
        confirmButtonColor: 'var(--color-accent, #ff4d4d)'
      });
      // Silent fail on loadMore otherwise
    } finally {
      setLoadingMore(false);
    }
  }

  return { pairs, loading, error, loadMore, loadingMore, hasMore: hasMore.current };
}