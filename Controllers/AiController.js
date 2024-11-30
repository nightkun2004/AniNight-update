const { getAiResponse } = require('../services/aiService');
const User = require("../models/UserModel")
const Chat = require("../models/chatModel")
const axios = require('axios');
require('dotenv').config();

const getAiVtuber = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {

        // const chatHistory = await Chat.find({ 'user_id.id': req.user.id })
        //     .sort({ createdAt: 1 })
        //     .select("user_message ai_response createdAt");

        // แปลงข้อมูลประวัติการสนทนาให้อยู่ในรูปแบบที่เหมาะสมสำหรับการแสดงผล
        // const formattedHistory = chatHistory.map(chat => ({
        //     user_message: chat.user_message,
        //     ai_response: chat.ai_response,
        //     createdAt: chat.createdAt
        // }));
        // console.log(formattedHistory)

        res.render("./th/pages/aivtuber", { userID, lang })
    } catch (error) {
        console.error("Error in getAiVtuber:", error.message);
        res.status(500).json({ message: "Cannot load chat history." });
    }
}


const aiVtuber = async (req, res) => {
    const userID = req.session?.userlogin; // ป้องกัน error หาก session ไม่มีค่า
    const lang = res.locals?.lang || "en"; // ตั้งค่า default language เป็น "en"
    const fallbackMessage = "ขออภัยครับ ขณะนี้ระบบมีการใช้งานสูง กรุณาลองใหม่ในภายหลังหรือสอบถามเรื่องอื่นแทน.";

    try {
        const { user_message } = req.body;

        // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว
        if (!req.user || !req.user.id) {
            throw new Error("User not logged in or user ID not found.");
        }

        // ดึงข้อมูลผู้ใช้
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new Error("User not found.");
        }

        // เรียก AI เพื่อรับคำตอบ
        const ai_response = await getAiResponse(user_message, user._id);
        // await saveChatHistory(req.user.id, user_message, ai_response);

        // บันทึกประวัติการสนทนาใน MongoDB
        const newChat = new Chat({
            user_message: user_message,
            ai_response: ai_response,
            user_id: user._id
        });

        await newChat.save();

        // ส่งข้อมูลกลับไปยังผู้ใช้
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