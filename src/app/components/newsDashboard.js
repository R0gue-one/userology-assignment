'use client';
import { useEffect, useState } from 'react';
import { Newspaper, Clock } from 'lucide-react';

export default function NewsDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await fetch('/api/news');
        const data = await res.json();
        setArticles(data);
      } catch (err) {
        console.error('News fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const pubDate = new Date(dateString);
    const diffMs = now - pubDate;
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <section id="news" className="space-y-6 p-6 md:p-10 lg:p-16">

      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="text-blue-400" size={24} />
          <h2 className="text-2xl font-semibold">Crypto News</h2>
        </div>
        
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-roboto">
  {Array.isArray(articles) && articles.length > 0 ? (
    articles.map(function (article, i) {
      return (
        <a
          key={i}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group cursor-pointer"
        >
          <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-blue-500/30 hover:bg-gray-700/50 transition-all duration-300 h-full">
            <div className="relative">
              {article.image_url ? (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = `/api/placeholder/400/200?text=${encodeURIComponent(article.source_id)}`;
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">{article.source_id}</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <span className="font-medium">{article.source_id}</span>
                <span className="text-gray-500">|</span>
                <Clock size={12} className="text-gray-400" />
                <span>{getTimeAgo(article.pubDate)}</span>
              </div>

              <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>

              {article.description && (
                <p className="text-sm text-gray-300 line-clamp-3">
                  {article.description}
                </p>
              )}
            </div>
          </div>
        </a>
      );
    })
  ) : (
    <div className="col-span-2 text-gray-400 text-center py-8">
      No news articles available at the moment
    </div>
  )}
</div>

      )}
    </section>
  );
}