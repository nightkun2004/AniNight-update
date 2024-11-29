const { getAiResponse } = require('../services/aiService');
const User = require("../models/UserModel")
const Chat = require("../models/chatModel")
const axios = require('axios');
require('dotenv').config();

const getAiVtuber = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        res.render("./th/pages/aivtuber", { userID, lang })
    } catch (error) {
        res.json({ message: error })
    }
}


const aiVtuber = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const fallbackMessage = "ขออภัยครับ ขณะนี้ระบบมีการใช้งานสูง กรุณาลองใหม่ในภายหลังหรือสอบถามเรื่องอื่นแทน.";

    try {
        const { user_message } = req.body;

        // ดึงข้อมูลผู้ใช้ (ในกรณีที่จำเป็น)
        const user = await User.findById(req.user.id);
        const ai_response = await getAiResponse(user_message);

        // บันทึกประวัติการสนทนาลง MongoDB
        const newChat = new Chat({
            user_message: user_message,
            ai_response: ai_response,
            user_id: user._id
        });

        await newChat.save();

        // ส่งข้อมูลกลับไปยังหน้า
        res.json({ userID, lang, ai_response });
    } catch (error) {
        console.error("Error in aiVtuber:", error.message);
        res.status(500).json({ userID, lang, ai_response: fallbackMessage });
    }
};

// WebSocket Handler
const handleWebSocketMessage = async (ws, message) => {
    try {
        const ai_response = await getAiResponse(message);
        ws.send(JSON.stringify({ user: message, ai: ai_response }));
    } catch (error) {
        console.error('WebSocket error:', error);
    }
};

module.exports = {
    getAiVtuber,
    aiVtuber,
    handleWebSocketMessage
}