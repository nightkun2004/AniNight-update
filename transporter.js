const nodemailer = require('nodemailer');
require('dotenv').config();

// สร้าง transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_INFO,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// ฟังก์ชันสำหรับส่งอีเมล
const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.EMAIL_INFO,
        to,
        subject,
        html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('ส่งเมลไปยัง:', info.response);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการส่งเมล:', error);
    }
};

module.exports = {
    sendEmail,
};
