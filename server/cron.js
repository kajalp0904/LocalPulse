const cron = require('node-cron');
const User = require('./models/User');
const claudeService = require('./services/claudeService');
const newsService = require('./services/newsService');
const weatherService = require('./services/weatherService');
const jobsService = require('./services/jobsService');
const socketModule = require('./socket');

function initCron() {
    // Run every day at 7:00 AM
    cron.schedule('0 7 * * *', async () => {
        console.log('Running daily brief generation at 7:00 AM');
        try {
            // Fetch all unique cities from User collection
            const cities = await User.distinct('city');
            
            for (const city of cities) {
                // Fetch external data for the city
                const [news, weather, jobs] = await Promise.all([
                    newsService.fetchNewsByCity(city),
                    weatherService.fetchWeatherByCity(city),
                    jobsService.fetchJobsByCity(city)
                ]);

                // Generate AI morning brief
                const brief = await claudeService.generateMorningBrief(city, news, weather, jobs);

                // Update users belonging to this city with the new brief
                await User.updateMany(
                    { city: city }, 
                    { $set: { latestBrief: brief, latestBriefDate: new Date() } }
                );

                // Emit Socket.io event 'morning_brief_ready' to the city room
                try {
                     const io = socketModule.getIo();
                     const roomName = city.toLowerCase().replace(/\s+/g, '_');
                     io.to(roomName).emit('morning_brief_ready', { city, brief });
                     console.log(`Broadcasted brief to room: ${roomName}`);
                } catch (socketError) {
                     console.log('Socket.io not ready to broadcast brief', socketError.message);
                }
            }
        } catch (error) {
            console.error('Error running daily cron job:', error);
        }
    });
}

module.exports = { initCron };
