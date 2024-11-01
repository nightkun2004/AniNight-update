const emailRewardHtml = (userName, rewardDetails) => {
    return `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333333;
            }
            .reward-details {
                margin-top: 20px;
                padding: 10px;
                background-color: #e8f0fe;
                border-left: 5px solid #4a90e2;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 0.9em;
                color: #777777;
            }
            a {
                color: #4a90e2;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>ยินดีด้วย, ${userName}!</h1>
            <p>คุณได้รับรางวัลจากการแลกรับรางวัลในระบบของเรา!</p>
            <div class="reward-details">
                <h2>รายละเอียดรางวัล</h2>
                <p><strong>ชื่อรางวัล:</strong> ${rewardDetails.reward}</p>
                <p><strong>ข้อความ:</strong> ${rewardDetails.message}</p>
                <p><strong>ลิงก์รางวัล:</strong> <a href="${rewardDetails.linkreward}" target="_blank">${rewardDetails.linkreward}</a></p>
            </div>
            <p>ขอบคุณที่ใช้บริการของเรา! หากคุณมีคำถามหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเราที่ <a href="mailto:aninight.info@gmail.com">aninight.info@gmail.com</a>.</p>
            <div class="footer">
                <p>ทีมงานของเรา</p>
                <p>© ${new Date().getFullYear()} AniNight.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    emailRewardHtml
};
