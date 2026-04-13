const Parser = require('rss-parser');
const axios = require('axios');

const parser = new Parser();

// Primary: Google News RSS — gives truly local news like Google's news tab
const fetchFromGoogleNews = async (city) => {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(city + ' news')}&hl=en-IN&gl=IN&ceid=IN:en`;
    const feed = await parser.parseURL(url);

    return (feed.items || []).slice(0, 20).map(item => ({
      title: item.title ? item.title.replace(/ - .*$/, '') : '', // Remove source suffix
      description: item.contentSnippet || item.content || '',
      url: item.link,
      source: item.title ? item.title.split(' - ').pop() : 'Google News',
      publishedAt: item.pubDate || new Date().toISOString(),
      urlToImage: null // Google RSS doesn't include images
    })).filter(a => a.title && a.title.length > 10);
  } catch (error) {
    console.error('Google News RSS error:', error.message);
    return [];
  }
};

// Fallback: NewsAPI
const fetchFromNewsAPI = async (city) => {
  try {
    if (!process.env.NEWS_API_KEY) return [];

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: `"${city}"`,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    return (response.data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]' && a.description)
      .slice(0, 15)
      .map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        urlToImage: article.urlToImage
      }));
  } catch (error) {
    console.error('NewsAPI error:', error.message);
    return [];
  }
};

const fetchNewsByCity = async (city) => {
  // Try Google News first (better local results)
  let articles = await fetchFromGoogleNews(city);
  
  // If Google News returned few results, supplement with NewsAPI
  if (articles.length < 5) {
    const newsApiArticles = await fetchFromNewsAPI(city);
    // Merge but avoid duplicates by title
    const existingTitles = new Set(articles.map(a => a.title.toLowerCase()));
    for (const article of newsApiArticles) {
      if (!existingTitles.has(article.title.toLowerCase())) {
        articles.push(article);
      }
    }
  }

  return articles.slice(0, 20);
};

module.exports = { fetchNewsByCity };
