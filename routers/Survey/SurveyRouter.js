const express = require("express")
const router = express.Router()
const { CreateSurvey,UpdateSurvey, deleteSurvey } = require("../../Controllers/SurveyAdminController")

router.post("/admin/create-survey", CreateSurvey)
router.post("/admin/update-survey/:surveyId", UpdateSurvey)
router.post("/admin/delete/survey/:surveyId", deleteSurvey)


module.exports = router;