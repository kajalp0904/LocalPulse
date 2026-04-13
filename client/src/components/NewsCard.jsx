import React from 'react';

export default function NewsCard({ article }) {
  const { title, description, url, source, publishedAt, urlToImage, aiSummary } = article;
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden mb-6 flex flex-col xl:flex-row">
      {urlToImage && (
        <div className="h-48 xl:h-auto xl:w-1/3 bg-cover bg-center" style={{ backgroundImage: `url(${urlToImage})` }}></div>
      )}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">{source || 'News'}</span>
             <span className="text-xs text-gray-400">{new Date(publishedAt).toLocaleDateString()}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 border border-blue-100/50 relative mt-5">
             <span className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] uppercase font-bold py-0.5 px-2 rounded-full">AI Summary</span>
             <p className="text-sm italic text-gray-700 leading-relaxed mt-1">
                {aiSummary || description || "Summary temporarily unavailable."}
             </p>
          </div>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-block mt-2">
          Read Full Article &rarr;
        </a>
      </div>
    </div>
  );
}
