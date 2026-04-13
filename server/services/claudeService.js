const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELS = [
  'llama-3.3-70b-versatile', 
  'llama-3.1-8b-instant', 
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGroq = async (systemPrompt, userPrompt, maxTokens = 300, retries = 2) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  // Try each model in sequence if one hits a limit
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`Trying Groq with model: ${modelName}...`);
        const response = await axios.post(GROQ_API_URL, {
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.2
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.choices[0].message.content;
      } catch (error) {
        const isRateLimit = error.response?.status === 429;
        
        // If it's a TPD (Daily) limit for this specific model, move to NEXT model immediately
        if (isRateLimit && error.response?.data?.error?.message?.includes('tokens per day')) {
            console.log(`Model ${modelName} daily limit reached. Switching to next model...`);
            break; // Break inner loop to try next modelName
        }

        if (isRateLimit && attempt < retries) {
          console.log(`Groq rate limited (${modelName}), retrying in ${3 * (attempt + 1)}s...`);
          await delay(3000 * (attempt + 1));
          continue;
        }
        
        console.error(`Groq error with ${modelName}:`, error.response?.data?.error?.message || error.message);
        break; // If it's another error, try next model
      }
    }
  }
  return null;
};

// Smart Local Fallback for when AI is rate limited or token limit reached
const localCategorize = (articles) => {
  const KEYWORDS = {
    Politics: ['politics', 'election', 'government', 'minister', 'modi', 'bjp', 'congress', 'vote', 'cabinet', 'parliament', 'opposition', 'mla', 'mp', 'constituency', 'policy', 'cm', 'pm', 'yatra', 'rally', 'seat', 'candidate'],
    Crime: ['crime', 'murder', 'arrest', 'police', 'robbery', 'theft', 'killed', 'jail', 'fraud', 'scam', 'accused', 'court', 'stabbing', 'investigation', 'scandals', 'homicide', 'suspect', 'custody', 'fined', 'complaint'],
    Sports: ['sports', 'cricket', 'ipl', 'football', 'match', 'score', 'wicket', 'goal', 'tournament', 'tennis', 'olympic', 'world cup', 'athlete', 'player', 'batting', 'bowling', 'stadium', 'trophy', 'fifa', 'win', 'lose'],
    Business: ['business', 'stock', 'market', 'economy', 'ceo', 'company', 'startup', 'profit', 'investment', 'nifty', 'sensex', 'bank', 'startup', 'funding', 'revenue', 'tax', 'industry', 'trade', 'merged', 'shares', 'gold rate'],
    Technology: ['tech', 'software', 'ai', 'app', 'google', 'apple', 'microsoft', 'digital', 'cyber', 'robot', 'semiconductor', 'gadget', 'launch', 'smartphone', 'internet', 'cloud', 'data', 'hardware', 'startup tech', 'meta'],
    Entertainment: ['entertainment', 'bollywood', 'movie', 'film', 'actor', 'actress', 'music', 'celebrity', 'netflix', 'series', 'show', 'trailer', 'song', 'cinema', 'theatre', 'oscar', 'award', 'box office', 'glamour'],
    Education: ['education', 'school', 'college', 'iit', 'iim', 'exam', 'result', 'course', 'student', 'university', 'admission', 'ugc', 'cbse', 'icse', 'syllabus', 'teacher', 'degree', 'graduation', 'academic', 'learning', 'literacy'],
    Health: ['health', 'hospital', 'doctor', 'covid', 'vaccine', 'virus', 'medical', 'disease', 'surgery', 'patient', 'health ministry', 'treatment', 'fitness', 'wellness', 'pharma']
  };

  return articles.map(article => {
    const text = `${article.title} ${article.description || ''}`.toLowerCase();
    
    // 1. SAFETY & High-Priority Politics Detection (Prioritize Context)
    const isTragedy = text.includes('death') || text.includes('killed') || text.includes('falls from') || text.includes('dead') || text.includes('suicide') || text.includes('murder');
    const isPoliticsContext = text.includes('minister') || text.includes('rajnath') || text.includes('modi') || text.includes('yogi') || text.includes('cm ') || text.includes('pm ') || text.includes('government') || text.includes('sansad') || text.includes('election');
    
    if (isTragedy) return 'Crime';
    if (isPoliticsContext) return 'Politics';

    const isHospital = text.includes('hospital') || text.includes('patient') || text.includes('surgery') || text.includes('medical');
    if (isHospital) return 'General';

    // 2. SPECIFIC WHITELISTS
    if (text.includes('iit') || text.includes('iim') || text.includes('course') || text.includes('admission')) return 'Education';
    if (text.includes('ipl') || text.includes('cricket') || text.includes('wicket')) return 'Sports';
    if (text.includes('arrest') || text.includes('police')) return 'Crime';

    // 3. KEYWORD LOOP
    for (const [category, words] of Object.entries(KEYWORDS)) {
      if (words.some(word => text.includes(word))) return category;
    }
    return 'General';
  });
};

// Categorize AND verify city relevance in a single AI call
const categorizeArticles = async (articles, city) => {
  if (!articles || articles.length === 0) return [];

  const articleList = articles.map((a, i) => 
    `${i + 1}. Title: ${a.title}\n   Snippet: ${(a.description || '').substring(0, 120)}`
  ).join('\n');

  const result = await callGroq(
    `You are an expert news categorizer. You will receive a list of news articles and a city name.

For EACH article, you must:
1. Decide if it is TRULY related to or about the city "${city}"
2. If relevant, assign ONE category from: Politics, Crime, Sports, Business, Technology, Entertainment, Education, General
3. If NOT relevant to ${city}, assign "IRRELEVANT"

CATEGORY RULES:
- Politics: elections, government, political parties, laws, diplomats, wars, geopolitics, international conflicts, military
- Crime: murder, theft, arrest, police, fraud, scam, assault, court cases, kidnapping, drug bust
- Sports: cricket, football, IPL, match results, tournaments, athletes, scores
- Business: companies, stock market, economy, finance, startups, trade, investments, revenue, GDP, banking
- Technology: software, AI, apps, gadgets, internet, cyber, coding, semiconductor, digital transformation
- Entertainment: movies, Bollywood, music, celebrities, Netflix, TV shows, concerts, awards
- Education: schools, colleges, universities, IIT, IIM, courses, admissions, exams, results, degrees, curriculum
- General: local events, weather, infrastructure, health, community news
- IRRELEVANT: article has nothing to do with ${city}

IMPORTANT: If an article is about a university or a new course (like IIM or IIT courses), it is EDUCATION, even if the course is about business or technology.

Reply with ONLY a JSON array of strings. One per article. Same order. Example: ["Education","IRRELEVANT","Crime","Sports"]`,
    `City: ${city}\n\nArticles:\n${articleList}`,
    400
  );

  if (result) {
    try {
      const match = result.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        while (parsed.length < articles.length) parsed.push('General');
        console.log(`AI Categories for ${city}:`, parsed.slice(0, articles.length));
        return parsed.slice(0, articles.length);
      }
    } catch (e) {
      console.error('Failed to parse categories:', result);
    }
  }

  // FALLBACK: Use local keyword categorization if AI fails/rate-limits
  console.log(`Using Local Fallback categorization for ${city} (AI Rate Limited/Token Limit)`);
  return localCategorize(articles);
};

const summarizeArticle = async (articleText) => {
  if (!articleText) return "Summary unavailable.";
  const result = await callGroq(
    "You are a concise news summarizer.",
    `Summarize this news article in 2 sentences for a general audience: ${articleText}`,
    100
  );
  return result || "Summary unavailable.";
};

const generateMorningBrief = async (city, newsArray, weather, jobs) => {
  const newsTop3 = (newsArray || []).slice(0, 3).map(n => n.title).join(", ");
  const jobTop2 = (jobs || []).slice(0, 2).map(j => `${j.title} at ${j.company}`).join(", ");
  const weatherString = weather ? `${weather.temp}°C and ${weather.condition}` : 'Unknown weather';

  const result = await callGroq(
    "You are a friendly local news anchor. Be conversational and uplifting.",
    `Generate a warm, engaging 200-word morning brief for people in ${city}. Include: top 3 news stories (${newsTop3}), today's weather (${weatherString}), and 2 job opportunities (${jobTop2}). Make it conversational and uplifting.`,
    350
  );
  return result || `Good morning ${city}! Your AI Brief is currently unavailable. Please try again later.`;
};

const moderatePost = async (title, content) => {
  const result = await callGroq(
    "You are a content moderator. Respond ONLY with valid JSON, no extra text.",
    `Is this user post appropriate for a public platform? Check for hate speech, spam, or harmful content. Reply with JSON only: { "isAppropriate": true, "reason": "string" }\n\nTitle: ${title}\nContent: ${content}`,
    80
  );

  if (result) {
    try {
      const parsed = JSON.parse(result);
      return { isAppropriate: !!parsed.isAppropriate, reason: parsed.reason || "Content vetted" };
    } catch (e) {
      console.error('Failed to parse moderation result:', result);
    }
  }
  return { isAppropriate: true, reason: "Auto-approved (AI unavailable)" };
};

module.exports = {
  summarizeArticle,
  generateMorningBrief,
  moderatePost,
  categorizeArticles
};
