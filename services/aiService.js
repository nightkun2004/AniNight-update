const axios = require('axios');
const Chat = require("../models/chatModel")
require('dotenv').config();
const fs = require('fs');
const path = require('path');


const getAiResponse = async (userMessage, userid) => {
    try {
        // ดึงข้อมูลแชทก่อนหน้า
        const previousChats = await Chat.find({ 'user_id.id': userid }).sort({ createdAt: -1 });

        // แปลงข้อมูลแชทให้เป็น format ที่ API ต้องการ
        const chatHistory = previousChats.map(chat => ({
            role: 'user',
            content: chat.user_message
        })).concat(
            previousChats.map(chat => ({
                role: 'assistant',
                content: chat.ai_response
            }))
        );

        // สร้างข้อความสำหรับส่งไปยัง AI
        const messages = [
            { role: "system", content: "You are Raochan (เรโอะちゃん), a VTuber. Speak casually and playfully." },
            { role: "system", content: "Sota is a male VTuber friend, fun and chill. Talk like close friends." },
            { role: "system", content: "Miku is a cheerful co-streamer who loves singing and dancing." },
            { role: "system", content: "Night is your passionate developer friend, always ready to discuss tech." },
            ...chatHistory, // เพิ่มข้อความจากประวัติการแชท
            { role: 'user', content: userMessage }
        ];

        const response = await axios.post('https://api.together.ai/v1/chat/completions', {
            model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
            messages: messages,
            max_tokens: 412,
            temperature: 0.8,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["<|eot_id|>", "<|eom_id|>"],
            stream: false
        }, {
            headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}` }
        });

        // บันทึกข้อความใหม่ลงในฐานข้อมูล
        const chat = new Chat({
            user_message: userMessage,
            ai_response: response.data.choices[0].message.content,
            user_id: { id: userid }
        });
        await chat.save();
        //     console.log(chat)

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error in AI service:', error);
        return 'ขออภัย เรโอะมีปัญหาในการตอบกลับ ลองใหม่อีกครั้ง!';
    }
};


const getAiResponseForTranslation = async (userMessage, targetLang) => {
    try {
        // ใช้คำสั่งที่กระชับเพื่อประหยัด tokens
        const messages = [
            { role: "system", content: "You are Raochan (เรโอะちゃん), a VTuber. Speak casually and playfully." },
            { role: "system", content: "Sota is a male VTuber friend, fun and chill. Talk like close friends." },
            { role: "system", content: "Miku is a cheerful co-streamer who loves singing and dancing." },
            { role: "system", content: "Night is your passionate developer friend, always ready to discuss tech." },
            { role: 'user', content: `Translate this text to ${targetLang}: "${userMessage}"` }
        ];

        const response = await axios.post('https://api.together.ai/v1/chat/completions', {
            model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
            messages: messages,
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.8,
            stop: ["<|eot_id|>", "<|eom_id|>"],
            stream: false
        }, {
            headers: { 'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}` }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error in AI service:', error);
        return 'ขออภัย เรโอะมีปัญหาในการแปลข้อความ ลองใหม่อีกครั้ง!';
    }
};

// const saveChatHistory = async (userID, userMessage, aiResponse) => {
//           try {
//                     // 1. กำหนดโฟลเดอร์และชื่อไฟล์
//                     const chatFolder = path.join(__dirname, '..', 'public/uploads/chat_history', userID);
//                     const chatFile = path.join(chatFolder, `${new Date().toISOString().slice(0, 10)}.json`);

//                     // 2. ตรวจสอบว่ามีโฟลเดอร์ผู้ใช้อยู่หรือยัง ถ้ายังไม่มีให้สร้าง
//                     if (!fs.existsSync(chatFolder)) {
//                               fs.mkdirSync(chatFolder, { recursive: true });
//                     }

//                     // 3. โหลดข้อมูลในไฟล์ถ้ามี
//                     let chatData = [];
//                     if (fs.existsSync(chatFile)) {
//                               const existingData = fs.readFileSync(chatFile, 'utf8');
//                               chatData = JSON.parse(existingData);
//                     }

//                     // 4. เพิ่มข้อความใหม่เข้าไปในประวัติแชท
//                     chatData.push({
//                               timestamp: new Date().toISOString(),
//                               user_message: userMessage,
//                               ai_response: aiResponse,
//                     });

//                     // 5. บันทึกข้อมูลกลับลงไฟล์
//                     fs.writeFileSync(chatFile, JSON.stringify(chatData, null, 2), 'utf8');
//                     console.log('Chat history saved successfully.');
//           } catch (error) {   
//                     console.error('Error saving chat history:', error);
//           }
// };

module.exports = { getAiResponse, getAiResponseForTranslation };