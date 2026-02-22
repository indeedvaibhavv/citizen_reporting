/**
 * Unsplash API Service
 * Fetch random images based on search query
 */

const UNSPLASH_API = 'https://api.unsplash.com';
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
console.log('Unsplash API Key:', ACCESS_KEY ? 'Loaded ✅' : 'Missing ❌');

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

/**
 * Search for images by query
 */
export async function searchImages(
  query: string,
  count: number = 1
): Promise<UnsplashImage[]> {
  try {
    const response = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error('Unsplash API request failed');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
}

/**
 * Get a random image by topic
 */
export async function getRandomImage(
  query?: string
): Promise<UnsplashImage | null> {
  try {
    const url = query
      ? `${UNSPLASH_API}/photos/random?query=${encodeURIComponent(query)}&client_id=${ACCESS_KEY}`
      : `${UNSPLASH_API}/photos/random?client_id=${ACCESS_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Unsplash API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Unsplash random image error:', error);
    return null;
  }
}

/**
 * Get category-specific background image
 */
export async function getCategoryImage(
  category: 'air' | 'garbage' | 'construction' | 'water'
): Promise<string> {
  const queryMap = {
    air: 'air pollution smoke factory',
    garbage: 'garbage waste pollution',
    construction: 'construction dust site',
    water: 'water pollution river',
  };

  console.log('🔍 Fetching image for category:', category); // ← ADD THIS

  try {
    const url = `${UNSPLASH_API}/photos/random?query=${encodeURIComponent(queryMap[category])}&client_id=${ACCESS_KEY}`;
    console.log('📡 API URL:', url); // ← ADD THIS
    
    const response = await fetch(url);
    console.log('📥 Response status:', response.status); // ← ADD THIS

    if (!response.ok) {
      console.error('❌ API error:', response.status, response.statusText); // ← ADD THIS
      return '';
    }

    const data: UnsplashImage = await response.json();
    console.log('✅ Image received:', data.urls.regular); // ← ADD THIS
    return data.urls.regular || '';
  } catch (error) {
    console.error('💥 Unsplash error:', error); // ← ADD THIS
    return '';
  }
}

/**
 * Get city skyline image
 */
export async function getCityImage(cityName: string): Promise<string> {
  const image = await getRandomImage(`${cityName} city skyline`);
  return image?.urls.regular || '';
}

/**
 * Trigger download (required by Unsplash API guidelines)
 * Call this when user views an image
 */
export async function triggerDownload(downloadUrl: string): Promise<void> {
  try {
    await fetch(`${downloadUrl}?client_id=${ACCESS_KEY}`);
  } catch (error) {
    console.error('Unsplash download trigger error:', error);
  }
}