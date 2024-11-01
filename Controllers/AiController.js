const getResponse = require("../openai")
const User = require("../models/UserModel")


const getAiVtuber = async (req,res) => {
    const userID = req.session.userlogin; 
    const lang = res.locals.lang; 
    try {
        res.render("./th/pages/aivtuber", {userID, lang})
    } catch (error) {
        res.json({ message: error})
    }
}


const aiVtuber = async (req, res) => {
    const userID = req.session.userlogin; 
    const lang = res.locals.lang; 
    const fallbackMessage = "ขออภัยครับ ขณะนี้ระบบมีการใช้งานสูง กรุณาลองใหม่ในภายหลังหรือสอบถามเรื่องอื่นแทน.";
    try {
        const { usermessage } = req.body;
        const user = await User.findById(req.user.id);

        // เรียกใช้ getResponse เพื่อให้ AI Vtuber ตอบกลับ
        const aiResponse = await getResponse(user.role, user.username, usermessage);

        // ส่งข้อมูลกลับไปยังหน้า aivtuber พร้อมกับข้อความตอบกลับจาก AI
        res.json( { userID, lang, aiResponse });
    } catch (error) {
        console.error("Error in aiVtuber:", error); 
        res.json({ userID, lang, aiResponse: fallbackMessage }); 
    }
};

module.exports = {
    getAiVtuber,
    aiVtuber
}