const addPaymenthtml = (method, name, truemoneynumber) => {
    return `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>แจ้งเตือนการอัปเดตการชำระเงิน</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                }
              .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden; 
        }

                .header {
                    background-color: #4A90E2;
                    color: #ffffff;
                    padding: 10px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    color: #ffffff;
                    background-color: #4A90E2;
                    text-decoration: none;
                    border-radius: 4px;
                    margin-top: 20px;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #666666;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>การอัปเดตการชำระเงิน</h2>
                </div>
                <div class="content">
                    <p>เรียน คุณ ${name}</p>
                    <p>เราขอแจ้งให้คุณทราบว่า มีการบันทึกหรือเปลี่ยนแปลงการชำระเงินในบัญชีของคุณเรียบร้อยแล้ว</p>
                    <p><strong>รายละเอียดการชำระเงิน:</strong></p>
                    <ul>
                        <li>ประเภท: ${method}</li>
                        <li>ชื่อบัญชี: ${name}</li>
                        <li>หมายเลขบัญชี: ${truemoneynumber}</li>
                    </ul>
                    <p>หากคุณมีข้อสงสัยเกี่ยวกับการชำระเงินนี้ โปรดติดต่อฝ่ายบริการลูกค้าของเรา</p>
                    <a href="https://www.ani-night.online/term" class="button">ติดต่อฝ่ายบริการลูกค้า</a>
                </div>
                <div class="footer">
                    <p>ขอบคุณที่ใช้บริการของเรา!</p>
                    <p>&copy; 2024 AniNight.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    addPaymenthtml
};
