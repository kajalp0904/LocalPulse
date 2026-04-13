const axios = require('axios');

const fetchWeatherByCity = async (city) => {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    
    // Fetch Current Weather
    const currentResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: { q: city, appid: key, units: 'metric' }
    });
    
    // Fetch 5-Day Forecast
    const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { q: city, appid: key, units: 'metric' }
    });

    const current = currentResponse.data;
    
    // Forecast returns data every 3 hours; extract 1 per day at noon
    const dailyForecast = forecastResponse.data.list.filter(item => item.dt_txt.includes('12:00:00')).map(item => ({
        date: item.dt_txt,
        temp: item.main.temp,
        condition: item.weather[0].main,
        icon: item.weather[0].icon
    }));

    return {
      temp: current.main.temp,
      condition: current.weather[0].main,
      icon: current.weather[0].icon,
      humidity: current.main.humidity,
      wind: current.wind.speed,
      forecast: dailyForecast
    };
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    return null;
  }
};

module.exports = { fetchWeatherByCity };
