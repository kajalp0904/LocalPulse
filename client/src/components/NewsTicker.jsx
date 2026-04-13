import React, { useEffect, useState } from 'react';

export default function NewsTicker({ news }) {
    if (!news || news.length === 0) return null;

    return (
        <div className="bg-gray-900 overflow-hidden py-2 border-b border-white/5 whitespace-nowrap relative z-40">
            <div className="flex gap-10 animate-marquee hover:pause whitespace-nowrap flex-nowrap">
                {news.concat(news).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 group cursor-pointer inline-flex">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-blue-400 transition-colors uppercase tracking-widest whitespace-nowrap">
                            {item.source}
                        </span>
                        <p className="text-white text-sm font-medium hover:underline whitespace-nowrap">
                            {item.title}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
