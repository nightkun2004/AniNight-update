const ResetPasswordHtml = (resetLink) => {
    return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #4A90E2; 
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                padding: 20px;
                font-size: 16px;
                color: #333;
            }
            a {
                color: #3498db; /* สีของลิงก์ */
                text-decoration: none; /* ลบเส้นใต้ */
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                text-align: center;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ลืมรหัสผ่าน?</h1>
            </div>
            <div class="content">
                <p>สวัสดี!</p>
                <p>คุณได้รับการร้องขอให้รีเซ็ตรหัสผ่านของคุณสำหรับบัญชีของคุณ กรุณาคลิกปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่าน:</p>
                <p>ลิงก์นี้จะหมดอายุใน 10 นาที</p>
                <a href="${resetLink}" class="button">รีเซ็ตรหัสผ่าน</a>
                <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่านนี้ โปรดเพิกเฉยต่ออีเมลนี้</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} AniNight.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    ResetPasswordHtml
};
