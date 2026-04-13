import React from 'react';

export default function WeatherWidget({ weather }) {
  if (!weather || !weather.temp) return (
     <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-48 w-full flex items-center justify-center text-gray-400">Add OpenWeather API Key</div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
       <div className="absolute -right-10 -top-10 text-white/10 text-9xl">☁️</div>
       <div className="relative z-10">
          <h2 className="text-lg font-semibold text-blue-100 mb-1">Current Weather</h2>
          <div className="flex items-center gap-4 mb-6">
             <img src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="weather icon" className="w-20 h-20 -ml-2 filter drop-shadow-md" />
             <div>
                <div className="text-4xl font-extrabold">{Math.round(weather.temp)}&deg;C</div>
                <div className="text-lg capitalize font-medium">{weather.condition}</div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6 border-t border-white/20 pt-4">
             <div>
                 <p className="text-white/70 text-xs uppercase font-bold tracking-wider">Humidity</p>
                 <p className="font-semibold">{weather.humidity}%</p>
             </div>
             <div>
                 <p className="text-white/70 text-xs uppercase font-bold tracking-wider">Wind</p>
                 <p className="font-semibold">{weather.wind} m/s</p>
             </div>
          </div>
          
          {weather.forecast && weather.forecast.length > 0 && (
             <div className="border-t border-white/20 pt-4 mt-2">
                <p className="text-white/70 text-xs uppercase font-bold tracking-wider mb-3">5-Day Forecast</p>
                <div className="flex justify-between items-center">
                   {weather.forecast.slice(0, 5).map((f, i) => (
                      <div key={i} className="text-center">
                         <p className="text-xs font-medium">{new Date(f.date).toLocaleDateString('en-US', {weekday:'short'})}</p>
                         <img src={`http://openweathermap.org/img/wn/${f.icon}.png`} alt="icon" className="w-8 h-8 mx-auto my-1" />
                         <p className="text-xs font-bold">{Math.round(f.temp)}&deg;</p>
                      </div>
                   ))}
                </div>
             </div>
          )}
       </div>
    </div>
  );
}
