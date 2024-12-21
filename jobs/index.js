const cron = require('node-cron');
const updateAnimeNewStatus = require('./updateAnimeNewStatus');

// ตั้งค่า Cron Job รันทุกวันเวลาเที่ยงคืน
const scheduleJobs = () => {
    cron.schedule('0 0 * * *', () => {
        console.log('Running Cron Job: updateAnimeNewStatus');
        updateAnimeNewStatus();
    });
};

module.exports = scheduleJobs;