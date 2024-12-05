const { google } = require('googleapis');
const fs = require('fs'); // เพิ่มการนำเข้า fs
require('dotenv').config();

const keyFilePath = ''; // ไฟล์ JSON ของ Service Account
const viewId = 'ga:208069749'; // ใส่ View ID ของคุณ (ตรวจสอบว่าเป็น Universal Analytics)

async function getAnalyticsData() {
  try {
    const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf-8'));

    // สร้างการเชื่อมต่อผ่าน Service Account
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/analytics.readonly']
    );

    const analytics = google.analytics('v3');

    // เรียกข้อมูลจาก Google Analytics
    const response = await analytics.data.ga.get({
      auth: auth,
      ids: viewId,
      'start-date': '30daysAgo',
      'end-date': 'today',
      metrics: 'ga:sessions',
      dimensions: 'ga:date',
    });

    console.log('Analytics Data:', response.data);
    return response.data; // ส่งคืนข้อมูล
  } catch (error) {
    console.error('Error fetching analytics data:', error.message);
    throw error;
  }
}

getAnalyticsData().catch(console.error);

module.exports = getAnalyticsData;
