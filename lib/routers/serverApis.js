const express = require("express")
const router = express.Router()
const { checkAuth } = require("../../lib/auth")
const { authMiddlewareAPI, authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { authenticateToken } = require("../../Middlewares/anime/authenticateToken")
const { verifyApiKey } = require("../../Middlewares/ApiKeyMiddleware")
const { getAnimeSesstionNext, getSchedule, getScheduleInfo, getAnimeStreamAPI, getAnimeWinterAPI } = require("../../Controllers/ScheduleAnimeController")
const { getScheduleAPI } = require("../../Controllers/AnimeController")
const { getArticle, EditPostArticle, getPlay, getPlayEpisodes, APIauthLogin, APIauthProfile } = require("../../Controllers/apiAuthController")
const { getAPINextdoraemon } = require("../../Controllers/PostsController")
const { getReadAPI } = require("../../Controllers/readController")

router.get("/season/next", getAnimeSesstionNext)
router.get("/test/api/:id", verifyApiKey, (req,res)=> {
    res.send("ขอต้อนรับสู่ API")
})
// router.get("/season/anime", getAnimeWnterAPI)
router.get("/read/:urlslug", getReadAPI)
router.get("/animes", verifyApiKey, getSchedule)
router.get("/schedule/anime", getScheduleAPI)
router.get("/anime/info/:urlslug", verifyApiKey, getScheduleInfo)
router.get("/anime/info/:urlslug/stream", verifyApiKey, getAnimeStreamAPI)
router.get("/next/ep/doraemon/:tags", getAPINextdoraemon)
router.get("/getPlay/:videoid", getPlay)
router.get("/getPlay/:videoid/:episodeid", getPlayEpisodes)

router.get('/edit/asrticle/item/:update_id', authMiddleware, getArticle)
router.post('/edit/asrticle/:update_id', authMiddleware, EditPostArticle)

// API Auth 
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../../models/UserModel")
const crypto = require('crypto');
const jwt = require("jsonwebtoken") 

router.post('/login/auth', APIauthLogin)
router.get('/profile/auth/info', APIauthProfile)

module.exports = router;