// For App Router
export const dynamic = 'force-dynamic'; // disable static caching

let cache = null;
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  const now = Date.now();

  if (cache && now - lastFetch < CACHE_DURATION) {
    return new Response(JSON.stringify(cache), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const API_KEY = process.env.NEWS_API_KEY;

  try {
    const res = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=crypto&language=en&category=business`
    );
    const data = await res.json();
    const articles = data.results.slice(0, 5);

    cache = articles;
    lastFetch = now;

    return new Response(JSON.stringify(articles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), { status: 500 });
  }
}
