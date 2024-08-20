const express = require("express")
const router = express.Router()
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { getAnimeSesstionNext } = require("../../Controllers/ScheduleAnimeController")

router.get("/season/next", getAnimeSesstionNext)

module.exports = router;