const SurveyAdmin = require("../models/SurveyAddModel")
const User = require("../models/UserModel")


const getListsSurvey = async (req, res) => {
    const lang = req.params.lang || 'th'; 
    const userID = req.session.userlogin || null;

    try {
        // ดึงรายการแบบสำรวจทั้งหมดจากฐานข้อมูล
        const surveys = await SurveyAdmin.find().lean();

        // เรนเดอร์หน้าจัดการแบบสำรวจพร้อมส่งข้อมูลแบบสำรวจไปยังหน้าเว็บ
        res.render("./pages/admin/manage/mana_survey", { 
            active: "tags", 
            userID, 
            translations: req.translations,
            lang,
            surveys // ส่งรายการแบบสำรวจไปยังหน้าเว็บ
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/manage/mana_survey', {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang  
        });
    }
}

const getAdminSurveyCreate = async (req,res) => {
    const lang = req.params.lang || 'th'; 
    const userID = req.session.userlogin || null;
    try {
        res.render("./pages/admin/add/survey/add", { 
            active: "tags", 
            userID, 
            translations: req.translations,
            lang, 
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/add/survey/add', {
            error: errorMessage,
            userID,
            translations: req.translations, lang  
        });
    }
}

// ============================================================ EditSurvey GET =================================================
const EditSurvey = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin || null;
    const surveyId = req.params.id; // รับ ID ของแบบสำรวจจากพารามิเตอร์ URL

    try {
        // ดึงข้อมูลแบบสำรวจจากฐานข้อมูลโดยใช้ surveyId
        const survey = await SurveyAdmin.findById(surveyId);
        if (!survey) {
            return res.status(404).send('Survey not found');
        }

        // ส่งข้อมูลแบบสำรวจไปยังฟอร์มแก้ไข
        res.render('./pages/admin/edit/survey/edit', {
            survey,
            userID,
            translations: req.translations,
            lang,
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/edit/survey/edit', {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang,
        });
    }
};

// ============================================================ CreateSurvey =================================================
const CreateSurvey = async (req,res) => {
    const lang = req.params.lang || 'th'; 
    const userID = req.session.userlogin || null;
    const { surveyName, questions, score, published } = req.body;

    try {
        const survey = new SurveyAdmin({
            surveyName,
            questions: questions.map(q => ({
                questionText: q.questionText,
                inputType: q.inputType,
                options: Array.isArray(q.options) ? q.options : [] 
            })),
            score,
            published: published === 'on'
        });
        
          await survey.save();
          console.log(survey)
          await User.findByIdAndUpdate(req.user.id, { $push: { surveyadmin: survey._id } }, { new: true });
          res.redirect('/admin/create/survey');
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/add/survey/add', {
            error: errorMessage,
            userID,
            translations: req.translations, lang  
        });
    }
}

// ============================================================ UpdateSurvey =================================================
const UpdateSurvey = async (req, res) => {
    const { surveyId } = req.params; // รับ surveyId จาก URL parameters
    const { surveyName, questions = [], score, published } = req.body;
    const lang = req.params.lang || 'th'; 
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
        res.status(500).render('./pages/admin/edit/survey/edit', {
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