const { google } = require('googleapis');
require("dotenv").config()

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:5000/auth/google/callback';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// URL สำหรับการรับสิทธิ์
const AUTH_URL = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/adsense.readonly'],
});


// ฟังก์ชันดึงรายงาน AdSense
async function getAdSenseReport(accessToken, startDate, endDate) {
    oAuth2Client.setCredentials({ access_token: accessToken });
  
    const adsense = google.adsense({
      version: 'v2',
      auth: oAuth2Client,
    });
  
    const response = await adsense.accounts.reports.generate({
      account: 'accounts/pub-6579807593228261', // ใช้ Publisher ID ของคุณ
      startDate: startDate, // วันที่เริ่มต้น เช่น '2024-11-01'
      endDate: endDate, // วันที่สิ้นสุด เช่น '2024-11-10'
      metrics: ['EARNINGS', 'IMPRESSIONS', 'CLICKS'], // รายการที่ต้องการ
    });
  
    return response.data;
  }
  
  module.exports = { AUTH_URL, oAuth2Client, getAdSenseReport };