const express = require("express")
const router = express.Router()
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { verifyApiKey } = require("../../Middlewares/ApiKeyMiddleware")
const { getAnimeSesstionNext, getSchedule, getScheduleInfo } = require("../../Controllers/ScheduleAnimeController")
const { getPlay, getPlayEpisodes } = require("../../Controllers/apiAuthController")
const { getAPINextdoraemon } = require("../../Controllers/PostsController")

router.get("/season/next", getAnimeSesstionNext)
router.get("/animes", verifyApiKey, getSchedule)
router.get("/anime/info/:urlslug", verifyApiKey, getScheduleInfo)
router.get("/next/ep/doraemon/:tags", getAPINextdoraemon)
router.get("/getPlay/:videoid", getPlay)
router.get("/getPlay/:videoid/:episodeid", getPlayEpisodes)

module.exports = router;