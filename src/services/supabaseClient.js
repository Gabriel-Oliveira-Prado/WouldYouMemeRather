import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Safely initialize the Supabase client only if keys are present and not placeholders.
const isConfigured = supabaseUrl &&
  supabaseUrl !== 'https://seu-projeto.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'sua-chave-anon-aqui';

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Increment vote and view stats for both memes in a single transaction via RPC
export async function incrementMemeStats(chosenId, rejectedId) {
  if (!supabase) return;
  const { error } = await supabase.rpc('increment_meme_stats', {
    chosen_id: chosenId,
    rejected_id: rejectedId
  });
  if (error) {
    console.error('Failed to increment meme stats:', error);
    throw error;
  }
}

// Fetch stats for a batch of meme IDs
export async function fetchMemesStats(ids) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('meme_stats')
    .select('meme_id, votes, views')
    .in('meme_id', ids);

  if (error) {
    console.error('Error fetching meme stats:', error);
    return [];
  }
  return data || [];
}

// Track game session details (visits, votes count, active duration, streaks)
export async function trackSession(sessionId, votesCount, maxHotStreak, maxColdStreak, startTime) {
  if (!supabase) return;
  const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
  const { error } = await supabase
    .from('game_sessions')
    .upsert({
      id: sessionId,
      last_active_at: new Date().toISOString(),
      votes_count: votesCount,
      max_hot_streak: maxHotStreak,
      max_cold_streak: maxColdStreak,
      session_duration: durationSeconds
    }, { onConflict: 'id' });

  if (error) {
    console.error('Failed to track game session:', error);
  }
}
