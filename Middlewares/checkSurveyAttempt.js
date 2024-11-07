// middleware/checkSurveyAttempt.js

const SurveyAdmin = require('../models/SurveyAddModel');

const checkSurveyAttempt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {idUser} = req.query
        const userId = req.session.userlogin;  // ตรวจสอบ user ID จาก session

        // ค้นหาแบบสำรวจจาก surveyId และตรวจสอบว่าผู้ใช้ได้ทำแบบสำรวจนี้แล้วหรือยัง
        const survey = await SurveyAdmin.findOne({
            _id: id,
            'responses.userID': idUser  // ตรวจสอบว่าผู้ใช้มีใน responses หรือไม่
        });

        if (survey) {
            // หากพบว่า user มีอยู่ใน responses ของแบบสำรวจนี้ แสดงว่าทำไปแล้ว
            return res.status(403).send('คุณได้ทำแบบสำรวจนี้แล้ว ไม่สามารถทำซ้ำได้');
        }

        next();
    } catch (error) {
        console.error('Error checking survey attempt:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการตรวจสอบข้อมูลการทำแบบสำรวจ');
    }
};


module.exports = {checkSurveyAttempt};