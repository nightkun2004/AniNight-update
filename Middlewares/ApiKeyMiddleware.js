const ApiKey = require('../models/ApiKeyModel')

// Middleware สำหรับตรวจสอบ API Key
const verifyApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const currentTime = new Date().toLocaleString(); // เวลา ณ ขณะนั้น
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`; // ดึง URL เต็ม

    if (!apiKey) {
        return res.status(403).send(`
            <h1>403 Forbidden</h1>
            <p>Message: API key missing</p>
            <p>Time: ${currentTime}</p>
            <hr>
            <p>URL: ${fullUrl}</p>
        `);
    }

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

    next();
};


module.exports = {
    verifyApiKey
}