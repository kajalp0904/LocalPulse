import React from 'react';

export default function CityVibe({ city, posts }) {
  // Simple algorithm: analyze categories and count engagement
  const categories = posts.map(p => p.category);
  const totalUpvotes = posts.reduce((acc, p) => acc + (p.upvotes?.length || 0), 0);
  
  let vibe = "Calm";
  let color = "from-blue-400 via-indigo-400 to-indigo-500";
  let icon = "🌊";
  let description = `Neighbors in ${city} are keeping things steady.`;

  if (categories.includes('alert')) {
    vibe = "Alerted";
    color = "from-orange-400 via-red-400 to-red-600";
    icon = "🚨";
    description = "Recent local alerts have the community on edge.";
  } else if (categories.includes('event')) {
    vibe = "Vibrant";
    color = "from-pink-400 via-purple-400 to-indigo-500";
    icon = "✨";
    description = `Excitement is building for upcoming local events!`;
  } else if (totalUpvotes > 20) {
    vibe = "Connected";
    color = "from-emerald-400 via-teal-400 to-blue-500";
    icon = "🤝";
    description = "Highly active community with great engagement.";
  }

  return (
    <div className={`p-6 rounded-3xl bg-gradient-to-br ${color} text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group`}>
       <div className="absolute top-[-20%] right-[-10%] text-9xl opacity-10 group-hover:rotate-12 transition-transform duration-700">
          {icon}
       </div>
       <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] mb-1 opacity-70">Community Pulse</p>
          <h2 className="text-3xl font-black mb-3 font-serif flex items-center gap-3">
             {vibe} {icon}
          </h2>
          <p className="text-sm font-medium leading-relaxed opacity-90 max-w-[80%]">
             {description}
          </p>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center h-full">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/10 flex items-center justify-center text-[10px] font-bold">
                     #{i}
                  </div>
                ))}
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Updated Live
             </div>
          </div>
       </div>
    </div>
  );
}
