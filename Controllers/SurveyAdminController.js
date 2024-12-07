const SurveyAdmin = require("../models/SurveyAddModel")
const User = require("../models/UserModel")


const getListsSurvey = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;

    try {
        // ดึงรายการแบบสำรวจทั้งหมดจากฐานข้อมูล
        const surveys = await SurveyAdmin.find().lean();

        // เรนเดอร์หน้าจัดการแบบสำรวจพร้อมส่งข้อมูลแบบสำรวจไปยังหน้าเว็บ
        res.render("./manage/manage_survey", { 
            active: "tags", 
            userID, 
            translations: req.translations,
            lang,
            surveys,
            active: "getListsSurvey"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}

const getAdminSurveyCreate = async (req,res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;
    try {
        res.render("./add/survey/creratesurvey", { 
            active: "tags",
            userID, 
            translations: req.translations,
            lang, 
            active: "AdminSurveyCreate"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage
        })
    }
}

// ============================================================ EditSurvey GET =================================================
const EditSurvey = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;
    const surveyId = req.params.id; 

    try {
        // ดึงข้อมูลแบบสำรวจจากฐานข้อมูลโดยใช้ surveyId
        const survey = await SurveyAdmin.findById(surveyId);
        if (!survey) {
            return res.status(404).send('Survey not found');
        }

        // ส่งข้อมูลแบบสำรวจไปยังฟอร์มแก้ไข
        res.render('./edit/survey/editsurvey', {
            survey,
            userID,
            translations: req.translations,
            lang,
            active: "Editsurvey"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
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
                options: question.options && Array.isArray(question.options) 
                    ? question.options.map(option => String(option).trim()) 
                    : []  // หากไม่มี options หรือไม่ได้เป็นอาร์เรย์ ให้เป็นอาร์เรย์ว่าง
            };
        });
        
        

        await survey.save();
        console.log("edit" ,survey )
        res.redirect(`/admin/edit/survey/${surveyId}`);
    } catch (error) {
        console.error(error);
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
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