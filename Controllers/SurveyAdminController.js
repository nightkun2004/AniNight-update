const SurveyAdmin = require("../models/SurveyAddModel")
const User = require("../models/UserModel")


const getListsSurvey = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;

    try {
        // ดึงรายการแบบสำรวจทั้งหมดจากฐานข้อมูล
        const surveys = await SurveyAdmin.find().lean();

        // เรนเดอร์หน้าจัดการแบบสำรวจพร้อมส่งข้อมูลแบบสำรวจไปยังหน้าเว็บ
        res.render("./th/pages/admin/manage/mana_survey", { 
            active: "tags", 
            userID, 
            translations: req.translations,
            lang,
            surveys // ส่งรายการแบบสำรวจไปยังหน้าเว็บ
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/manage/mana_survey', {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang  
        });
    }
}

const getAdminSurveyCreate = async (req,res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;
    try {
        res.render("./th/pages/admin/add/survey/add", { 
            active: "tags",
            userID, 
            translations: req.translations,
            lang, 
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/add/survey/add', {
            error: errorMessage,
            userID,
            translations: req.translations, lang  
        });
    }
}

// ============================================================ EditSurvey GET =================================================
const EditSurvey = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;
    const surveyId = req.params.id; // รับ ID ของแบบสำรวจจากพารามิเตอร์ URL

    try {
        // ดึงข้อมูลแบบสำรวจจากฐานข้อมูลโดยใช้ surveyId
        const survey = await SurveyAdmin.findById(surveyId);
        if (!survey) {
            return res.status(404).send('Survey not found');
        }

        // ส่งข้อมูลแบบสำรวจไปยังฟอร์มแก้ไข
        res.render('./th/pages/admin/edit/survey/edit', {
            survey,
            userID,
            translations: req.translations,
            lang,
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/edit/survey/edit', {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang,
        });
    }
};

// ============================================================ CreateSurvey =================================================
const CreateSurvey = async (req,res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;
    const { surveyName, questions, score, published } = req.body;

    try {
        // ตรวจสอบและสร้างโครงสร้างคำถามจาก req.body
        const formattedQuestions = questions.map(q => ({
            questionText: q.questionText,
            inputType: q.inputType,
            options: Array.isArray(q.options) ? q.options : [],  // ตรวจสอบว่า options เป็น array หรือไม่
            answers: q.answers?.map(ans => ({
                text: ans.text,
                isCorrect: ans.isCorrect || false
            })) || []  // ตรวจสอบ answers
        }));

        const survey = new SurveyAdmin({
            surveyName,
            questions: formattedQuestions,
            score,
            published: published === 'on'  // เปลี่ยน published เป็น Boolean
        });

        // บันทึกแบบสำรวจลงในฐานข้อมูล
        await survey.save();
        console.log("Survey Created:", survey);
        // เปลี่ยนเส้นทางเมื่อสำเร็จ
        res.redirect('/admin/create/survey?success=true');
    } catch (error) {
        console.error("Error creating survey:", error);
        const errorMessage = error.message || 'Internal Server Error';
        res.redirect(`/admin/create/survey?success=error&msg=${encodeURIComponent(errorMessage)}`);
    }
}

// ============================================================ UpdateSurvey =================================================
const UpdateSurvey = async (req, res) => {
    const { surveyId } = req.params; // รับ surveyId จาก URL parameters
    const { surveyName, questions = [], score, published } = req.body;
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;

    try {
        const survey = await SurveyAdmin.findById(surveyId);

        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }

        // อัพเดตข้อมูลแบบสำรวจ
        survey.surveyName = surveyName || survey.surveyName;
        survey.score = score !== undefined ? Number(score) : survey.score; // Ensure score is a number
        survey.published = published === 'on'; // Convert 'on'/'off' to boolean

        // อัพเดตคำถามในแบบสำรวจ
        survey.questions = questions.map((question, index) => {
            const existingQuestion = survey.questions[index] || {};

            return {
                questionText: question.questionText || existingQuestion.questionText,
                inputType: question.inputType || existingQuestion.inputType,
                options: Array.isArray(question.options) 
                    ? question.options.flat().map(option => String(option).trim()) 
                    : existingQuestion.options || []
            };
        });

        await survey.save();
        console.log("edit" ,survey )
        res.redirect(`/admin/edit/survey/${surveyId}`);
    } catch (error) {
        console.error(error);
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/edit/survey/edit', {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang,
        });
    }
}


const deleteSurvey = async (req, res) => {
    const { surveyId } = req.params;

    try {
        // Find and delete the survey
        const result = await SurveyAdmin.findByIdAndDelete(surveyId);

        if (!result) {
            return res.status(404).json({ message: 'Survey not found' });
        }

        // Optionally, redirect or send a success response
        res.redirect('/admin/manage/survey'); // Redirect to the list of surveys
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = {
    getListsSurvey,
    getAdminSurveyCreate,
    CreateSurvey,
    UpdateSurvey,
    EditSurvey,
    deleteSurvey
}