// Fetch memes from Reddit via a free proxy API (meme-api.com)
// to bypass Reddit's strict OAuth/403 blocks on direct/proxied API requests.
export async function fetchRedditMemes(afterToken = null) {
  const subreddits = ['memes', 'dankmemes', 'me_irl'];
  
  const fetches = subreddits.map(sub => 
    fetch(`https://meme-api.com/gimme/${sub}/20`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .catch(err => {
        console.error(`Failed to fetch from r/${sub}:`, err);
        return { memes: [] }; // fallback to empty
      })
  );

  const results = await Promise.all(fetches);

  // Merge all memes retrieved from different subreddits
  const allMemes = results.flatMap(res => res.memes || []);

  if (allMemes.length === 0) {
    throw new Error('Meme API returned no memes');
  }

  const memes = allMemes
    .filter(post => {
      if (post.nsfw || post.spoiler) return false;
      if (!post.url || !post.url.match(/\.(jpg|jpeg|png)$/i)) return false;
      return true;
    })
    .map(post => {
      const parts = post.postLink.split('/');
      const id = parts[parts.length - 1] || Math.random().toString(36).substring(2, 9);
      return {
        id: `reddit-${id}`,
        name: post.title,
        url: post.url,
        width: 500,
        height: 500,
      };
    });

  // Since meme-api returns random memes, we don't have a standard offset cursor.
  // We return a dummy non-null "after" token so that the UI can keep paging infinitely.
  return { 
    memes, 
    after: `next-page-${Date.now()}` 
  };
}
