const emailHtmlWelcomeUser = () => {
    return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ยินดีต้อนรับสู่ชุมชนของเรา</title>
    <style>
        body {
            background-color: #f7fafc; /* bg-gray-100 */
            font-family: sans-serif;
            line-height: 1.6;
            padding: 0;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            width: 80px;
            height: 80px;
        }
        .header h1 {
            font-size: 24px;
            color: #3b82f6; /* text-blue-500 */
        }
        .header p {
            color: #4b5563; /* text-gray-600 */
        }
        .body {
            color: #374151; /* text-gray-700 */
        }
        .body h2 {
            font-size: 20px;
            font-weight: bold;
            color: #ec4899; /* text-pink-500 */
        }
        .body ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        .button {
            display: inline-block;
            background-color: #3b82f6; /* bg-blue-500 */
            color: white;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 20px;
            text-decoration: none;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #2563eb; /* hover:bg-blue-600 */
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280; /* text-gray-500 */
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <img src="https://www.ani-night.online/annight/logo_mini.png" alt="Welcome Icon">
            <h1>ยินดีต้อนรับสู่ชุมชนของเรา!</h1>
            <p>ขอบคุณที่เข้าร่วมกับเรา เราพร้อมที่จะมอบประสบการณ์ที่ดีที่สุดให้คุณ</p>
        </div>

        <!-- Body Section -->
        <div class="body">
            <h2>สิ่งที่คุณจะได้รับ:</h2>
            <ul>
                <li>อัปเดตข่าวสารเกี่ยวกับบทความและวิดีโอล่าสุด</li>
                <li>เข้าถึงชุมชนที่สนุกและมีส่วนร่วม</li>
                <li>สะสมคะแนนและแลกของรางวัลสุดพิเศษ</li>
            </ul>
            <p>มาเริ่มกันเถอะ! เข้าร่วมและเป็นส่วนหนึ่งของการผจญภัยกับเรา</p>
        </div>

        <!-- Call to Action Button -->
        <div class="text-center">
            <a href="https://ani-night.online/auth/login" class="button">
                เข้าสู่ระบบแล้วเริ่มต้นสำรวจเลย
            </a>
        </div>

        <!-- Footer Section -->
        <div class="footer">
            <p>ขอบคุณที่ไว้วางใจในบริการของเรา 💙</p>
            <p>&copy; 2024 ani-night.online</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = {
    emailHtmlWelcomeUser
}