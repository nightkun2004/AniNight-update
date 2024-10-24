const ApiKey = require('../models/ApiKeyModel')
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // นำเข้าโมเดลผู้ใช้ (กรณีที่ต้องการใช้ข้อมูลเพิ่มเติม)

const authorizeUser = async (req, res, next) => {
    try {
        // ดึง JWT จาก Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access Denied: No token provided' });
        }

        const token = authHeader.split(' ')[1]; // แยก Bearer ออกจาก token

        // ตรวจสอบและยืนยัน JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        // ค้นหาผู้ใช้ในฐานข้อมูลด้วย id ที่ได้จาก JWT
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // เพิ่มข้อมูลผู้ใช้ใน request เพื่อให้ใช้ในฟังก์ชันถัดไปได้
        req.user = user;

        // ตรวจสอบบทบาทผู้ใช้ (เช่น admin, user, หรือ moderator)
        if (user.role !== 'admin') {  // ตัวอย่างการตรวจสอบ role
            return res.status(403).json({ error: 'Access Denied: You do not have permission' });
        }

        // ถ้าผู้ใช้มีสิทธิ์ให้ไปที่ฟังก์ชันถัดไป
        next();
    } catch (error) {
        console.error('Authorization Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Middleware สำหรับตรวจสอบ API Key
const verifyApiKey = async (req, res, next) => {
    const userId = req.params.id; 

    // ตรวจสอบว่ามี userId หรือไม่
    if (!userId || userId.length !== 24) {
        return res.status(404).json({ error: 'ไม่พบ user public token id หรือ ID ไม่ถูกต้อง' });
    }

    const user = await User.findOne({ _id: userId });

    // ตรวจสอบว่า user มีอยู่หรือไม่
    if (!user) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    const apiKey = req.headers['x-api-key'];
    const currentTime = new Date().toLocaleString(); // เวลา ณ ขณะนั้น
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`; // ดึง URL เต็ม

    // ตรวจสอบว่า API key ถูกส่งมาหรือไม่
    if (!apiKey) {
        return res.status(403).send(`
            <h1>403 Forbidden</h1>
            <p>Message: API key missing</p>
            <p>Time: ${currentTime}</p>
            <hr>
            <p>URL: ${fullUrl}</p>
        `);
    }

    // ตรวจสอบว่า API key ที่ส่งมาถูกต้องหรือไม่
    const key = await ApiKey.findOne({ key: apiKey });
    if (!key) {
        return res.status(403).send(`
            <h1>403 Forbidden</h1>
            <div style="padding: 12px;">
                <p>Message: Invalid API key</p>
                <p>Time: ${currentTime}</p>
                <hr>
                <p>URL: ${fullUrl}</p>
            </div>
        `);
    }

    // ตรวจสอบว่า user มี points เพียงพอหรือไม่
    if (user.points < 5) {
        return res.status(403).json({ error: 'คุณไม่มี points เพียงพอในการทำการร้องขอนี้' });
    }

    // ลดจำนวน points
    user.points -= 5; // ลดลง 5 points
    await user.save(); // บันทึกข้อมูลใหม่

    next(); // ส่งต่อไปยัง middleware ถัดไป
};


module.exports = {
    verifyApiKey,
    authorizeUser
}