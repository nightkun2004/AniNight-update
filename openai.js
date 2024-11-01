const OpenAI = require("openai");
require("dotenv").config();
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

// ข้อความเตรียมไว้เมื่อเรทหมด
const fallbackMessage = "ขออภัยครับ ขณะนี้ระบบมีการใช้งานสูง กรุณาลองใหม่ในภายหลังหรือสอบถามเรื่องอื่นแทน.";

const getResponse = async (role, user, content) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "AI โคจัง", content: "สวัสดีครับผมชื่อโคจัง." },
                {
                    "role": role,
                    "content": content
                }
            ],
            max_tokens: 100,
        });

        // ส่งคืนข้อความที่ตอบกลับจาก AI
        return completion.choices[0].message.content; // แก้ไขให้ดึงค่าจาก message.content
    } catch (error) {
        console.error("Error fetching response:", error);
        
        // ตรวจสอบสถานะข้อผิดพลาดเพื่อส่งคืน fallbackMessage
        if (error.response && error.response.status === 429) {
            return fallbackMessage; // ส่งคืนข้อความที่เตรียมไว้เมื่อเรทหมด
        }

        return `An error occurred while fetching the response. ${error.message}`;
    }
};

module.exports = getResponse;
