import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

export default function BreakingNewsBanner() {
  const [headline, setHeadline] = useState(null);

  useEffect(() => {
    const handleNews = (data) => {
      setHeadline(data.headline);
      setTimeout(() => setHeadline(null), 8000); 
    };
    socket.on('breaking_news', handleNews);
    return () => socket.off('breaking_news', handleNews);
  }, []);

  if (!headline) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-lg flex justify-between items-center relative z-40">
      <div className="flex items-center gap-3 font-semibold">
        <span className="uppercase tracking-widest text-xs bg-white text-red-600 px-2 py-1 rounded">Breaking</span>
        <p>{headline}</p>
      </div>
      <button onClick={() => setHeadline(null)} className="text-white hover:text-red-200">&times;</button>
    </div>
  );
}
