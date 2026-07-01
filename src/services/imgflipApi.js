const API_URL = 'https://api.imgflip.com/get_memes';

// Fetch templates from Imgflip
export async function fetchMemes() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Imgflip API error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error('Imgflip API returned unsuccessful response');
  }

  return json.data.memes;
}
