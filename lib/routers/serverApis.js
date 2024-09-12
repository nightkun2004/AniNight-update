const express = require("express")
const router = express.Router()
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { getAnimeSesstionNext } = require("../../Controllers/ScheduleAnimeController")
const { getPlay, getPlayEpisodes } = require("../../Controllers/apiAuthController")
const { getAPINextdoraemon } = require("../../Controllers/PostsController")

router.get("/season/next", getAnimeSesstionNext)
router.get("/next/ep/doraemon", getAPINextdoraemon)
router.get("/getPlay/:videoid", getPlay)
router.get("/getPlay/:videoid/:episodeid", getPlayEpisodes)

module.exports = router;