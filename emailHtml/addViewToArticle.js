const emailHtmlAddViewsArticle = (username, earnings, urlslug, title) => {
    return `
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* กำหนดสไตล์พื้นฐานสำหรับเอกสาร */
        body {
            font-family: Arial, sans-serif; /* ฟอนต์ที่ใช้ */
            background-color: #f9f9f9; /* สีพื้นหลัง */
            margin: 0; /* ขอบด้านนอกเป็น 0 */
            padding: 0; /* ระยะห่างภายในเป็น 0 */
        }

        /* กำหนดสไตล์สำหรับคอนเทนเนอร์หลัก */
        .container {
            max-width: 600px; /* ความกว้างสูงสุด */
            margin: 20px auto; /* กำหนดระยะห่างจากขอบ */
            background-color: #ffffff; /* สีพื้นหลังของคอนเทนเนอร์ */
            border-radius: 8px; /* มุมโค้ง */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* เงา */
            overflow: hidden; /* ซ่อนเนื้อหาที่เกินขอบ */
        }

        /* กำหนดสไตล์สำหรับส่วนหัว */
        .header {
            background-color: #4A90E2; /* สีพื้นหลังของส่วนหัว */
            color: #ffffff; /* สีตัวอักษร */
            padding: 20px; /* ระยะห่างภายใน */
            text-align: center; /* จัดกึ่งกลาง */
        }

        .header h1 {
            margin: 0; /* ขอบด้านบนและด้านล่างเป็น 0 */
            font-size: 24px; /* ขนาดตัวอักษร */
        }

        /* กำหนดสไตล์สำหรับข้อความที่เน้น */
        .highlight {
            color: #4A90E2; /* สีข้อความที่เน้น */
            font-weight: bold; /* ตัวหนา */
        }

        /* กำหนดสไตล์สำหรับไอคอนเหรียญ */
        .icon_coin {
            width: 50px; /* ความกว้างของไอคอน */
            display: flex; /* ใช้ Flexbox */
            justify-content: center; /* จัดกึ่งกลาง */
            align-items: center; /* จัดกลางแนวตั้ง */
            flex-direction: column; /* แนวตั้ง */
        }

        /* กำหนดสไตล์สำหรับเนื้อหา */
        .content {
            padding: 20px; /* ระยะห่างภายใน */
        }

        .content p {
            line-height: 1.6; /* ระยะห่างระหว่างบรรทัด */
        }

        /* กำหนดสไตล์สำหรับปุ่มลิงก์ */
        .btn_url {
            background-color: #ff0050; /* สีพื้นหลังปุ่ม */
            border: none; /* ไม่มีขอบ */
            border-radius: 50px; /* ขอบมน */
            padding: 10px 20px; /* ระยะห่างภายใน */
            cursor: pointer; /* แสดงเคอร์เซอร์เป็นมือ */
            transition: background-color 0.3s, transform 0.3s; /* เอฟเฟกต์การเปลี่ยนสีและการขยาย */
            display: inline-block; /* ให้ปุ่มอยู่ในบรรทัดเดียว */
        }

        .btn_url a {
            color: #ffffff; /* สีตัวอักษรในลิงก์ */
            text-decoration: none; /* ไม่มีขีดเส้นใต้ */
            font-size: 16px; /* ขนาดฟอนต์ */
        }

        .btn_url:hover {
            background-color: #e6004d; /* สีพื้นหลังเมื่อชี้ไปที่ปุ่ม */
            transform: scale(1.05); /* ขยายขนาดเล็กน้อย */
        }

        /* กำหนดสไตล์สำหรับส่วนท้าย */
        .footer {
            text-align: center; /* จัดกึ่งกลาง */
            padding: 10px; /* ระยะห่างภายใน */
            background-color: #f1f1f1; /* สีพื้นหลัง */
            font-size: 12px; /* ขนาดฟอนต์ */
            color: #777777; /* สีตัวอักษร */
        }

        .current-rate {
    margin: 15px 0; /* ระยะห่างด้านบนและล่าง */
    font-size: 16px; /* ขนาดตัวอักษร */
    color: #333; /* สีตัวอักษร */
}

.notification {
    margin: 15px 0; /* ระยะห่างด้านบนและล่าง */
    font-size: 14px; /* ขนาดตัวอักษร */
    color: #d9534f; /* สีตัวอักษรเป็นสีแดงเพื่อเตือน */
}

.thank-you {
    margin: 20px 0; /* ระยะห่างด้านบนและล่าง */
    font-size: 16px; /* ขนาดตัวอักษร */
    font-weight: bold; /* ตัวหนา */
    color: #4A90E2; /* สีตัวอักษร */
}

    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>การแจ้งเตือนรายได้</h1> <!-- ชื่อหัวข้อ -->
        </div>
        <div class="content">
            <p>สวัสดี <span class="highlight">${username}</span>,</p> <!-- ข้อความทักทาย -->
            <div class="icon_coin">
                <img style="width: 50px;" src="https://m1r.ai/dZ8L.png" alt="icon"> <!-- ไอคอนเหรียญ -->
            </div>
           
            <p>คุณผู้ใช้ <strong>${username}</strong> ได้รับรายได้ <strong>${earnings}</strong>
                บาทจากบทความ.</p> <!-- ข้อความแสดงรายได้ -->

            <button class="btn_url">
                <a href="https://www.ani-night.online/read/${urlslug}" target="_blank">อ่านบทความนี้ ${title}</a> <!-- ลิงก์ไปยังบทความ -->
            </button>
            <p class="current-rate">
                <strong>เรทปัจจุบัน:</strong> <span class="highlight">1 คะแนน = 0.10 บาท/คะแนน</span>
            </p> <!-- แสดงเรทคะแนน -->
            <p class="notification">
                <strong>*โปรดทราบ:</strong> รายได้ของคุณอาจจะยังไม่เข้าบัญชีหากคุณยังไม่ผ่านกฎของเรา หากผ่านกฎแล้วให้เพิ่มข้อมูลชำระเงินเพื่อรับเงินจากผลงาน
            </p> <!-- ข้อความเตือน -->
            <p class="thank-you">
                ขอบคุณที่เป็นส่วนหนึ่งของเรา!
            </p> <!-- ข้อความขอบคุณ -->
             <!-- ข้อความขอบคุณ -->
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Ani-Night.</p> <!-- ปีปัจจุบัน -->
        </div>
    </div>
</body>

</html>
    `;
};

module.exports = {
    emailHtmlAddViewsArticle
}