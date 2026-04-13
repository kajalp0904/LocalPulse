const axios = require('axios');

const fetchJobsByCity = async (city) => {
  try {
    const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/in/search/1`, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        where: city,
        results_per_page: 10
      }
    });

    const jobs = response.data.results || [];
    return jobs.map(job => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary: job.salary_min ? `${job.salary_min} - ${job.salary_max}` : 'Not specified',
      url: job.redirect_url,
      description: job.description
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return [];
  }
};

module.exports = { fetchJobsByCity };
