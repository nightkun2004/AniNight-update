const express = require("express")
const router = express.Router()
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { verifyApiKey } = require("../../Middlewares/ApiKeyMiddleware")
const { getAnimeSesstionNext, getSchedule, getScheduleInfo, getAnimeStreamAPI, getAnimeWinterAPI } = require("../../Controllers/ScheduleAnimeController")
const { getPlay, getPlayEpisodes } = require("../../Controllers/apiAuthController")
const { getAPINextdoraemon } = require("../../Controllers/PostsController")

router.get("/season/next", getAnimeSesstionNext)
router.get("/season/anime", getAnimeWinterAPI)
router.get("/animes", verifyApiKey, getSchedule)
router.get("/anime/info/:urlslug", verifyApiKey, getScheduleInfo)
router.get("/anime/info/:urlslug/stream", verifyApiKey, getAnimeStreamAPI)
router.get("/next/ep/doraemon/:tags", getAPINextdoraemon)
router.get("/getPlay/:videoid", getPlay)
router.get("/getPlay/:videoid/:episodeid", getPlayEpisodes)

module.exports = router;