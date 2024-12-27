const express = require("express")
const router = express.Router()
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../../models/UserModel")
const crypto = require('crypto');
const jwt = require("jsonwebtoken")
const { getEditProfile, authProfile, TikTokLogin, getResetPassword, authProfileSaveAnime, EditBanner } = require("../../Controllers/authController")
const { getAiVtuber } = require("../../Controllers/AiController")
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { authorizeRole, authhorizeRoleAdmin } = require("../../Middlewares/authorizeMiddleware")
const { checkSurveyAttempt } = require("../../Middlewares/checkSurveyAttempt")

const { getTrending } = require("../../Controllers/trendingController")
const { getDashboard, getDashboardManageArticle, getNotifications, getNotificationisRead, Getedit, GetRewardCode, gatPlaymentEdit, deletePostArticle } = require("../../Controllers/DashboardController")

const { getRecommen } = require("../../Controllers/RecommenController") 
const { getAnime, getAddAnimeScheduleTimeline, getCharacters, getPVAnime, getEditAnime, getEditAnimeTitle, getAddActorToCharacter, getEditActorToCharacter, getSchedule, getInfiniteScroll, getAnimeStreem, getEditAnimeAddSchedule, getAnimeStreemYoutube } = require("../../Controllers/AnimeController") 
const { getAnimeInfo, getAnimeAnilist, getAnimeSeason, getAnilistAPI, getAnimeScheduleTimeline, getFilterAnime, getAnimeStream } = require("../../Controllers/ScheduleAnimeController")
const { getChannel } = require("../../Controllers/ChannelController")

const { getTags } = require("../../Controllers/TagController")
const { getSurvey, getStartSurvey, getSurveryquestionId, getSurveryAnswers, getSurverycomplete } = require("../../Controllers/SurveyControler")
const { getWithdraw, getWithdrawTrueMoneyWallet, getWithdrawTrueMoneyWalletCreate } = require("../../Controllers/PlaymentsController")

const {Term, getPrivacyPolicy, getTermsService} = require("../../Controllers/TermController")
const { getSearch, getSearchJson } = require("../../Controllers/SearchControler")
const { getIndexSitemap, getAnimeSitemap, getArticlesSitemap } = require("../../Controllers/SitemapController")

const { getMeme, getDashboardManageMeme, GeteditMeme, getPostMeme, getCreateMeme } = require("../../Controllers/MemeController")
const { AUTH_URL, oAuth2Client, getAdSenseReport } = require('../../adsense');
require("dotenv").config()

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://www.ani-night.online/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่โดยใช้ googleId หรือ email
            const existingUser = await User.findOne({
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            });

            if (existingUser) {
                // ผู้ใช้มีอยู่แล้ว
                return done(null, existingUser);
            }

            // กำหนดชื่อผู้ใช้เริ่มต้น
            let username = profile.displayName;

            // ตรวจสอบว่าชื่อผู้ใช้มีอยู่แล้วหรือไม่
            let userWithSameUsername = await User.findOne({ username });

             // หากมีชื่อผู้ใช้อยู่แล้วให้สุ่มตัวอักษรเพิ่มท้ายชื่อ
             while (userWithSameUsername) {
                const randomSuffix = crypto.randomBytes(3).toString('hex'); // สุ่ม 6 ตัวอักษร
                username = `${profile.displayName}_${randomSuffix}`;
                userWithSameUsername = await User.findOne({ username });
            }

            // สร้างผู้ใช้ใหม่
            const newUser = await new User({
                username: username,
                email: profile.emails[0].value,
                googleId: profile.id,
                profilePicture: profile.photos[0].value
            }).save();

            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    }
));


router.get("/auth/login", (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    if (userID) {
        return res.redirect("/dashboard");
    }

    res.render("./th/pages/authPages/login", { active: "login", userID, translations: req.translations, lang })
})
router.get("/auth/register", (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    const siteKey = process.env.SITE_KEY;
    res.render("./th/pages/authPages/register", {
        active: "register",
        userID,
        translations: req.translations,
        lang,
        siteKey
    })
})

router.get("/oauth/tiktok", TikTokLogin)

// Route สำหรับการเข้าสู่ระบบด้วย Google
router.get('/auth/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));


// Route สำหรับ callback หลังจาก Google OAuth
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
    req.session.userlogin = { user: req.user };


    try {

        // สร้าง JWT โดยใช้ข้อมูลจาก req.user
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username, role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );
        const tksave = jwt.sign(
            { id: req.user._id },
            process.env.JWT_SECRET,
            { expiresIn: "5d" }
        );

        // ส่ง token ใน HTTP header
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('tksave', tksave, { httpOnly: false, secure: false });

        // Redirect ไปยังหน้าที่ต้องการ
        const returnTo = req.session.returnTo || `/@${req.user.username}`;
        delete req.session.returnTo;
        res.redirect(returnTo);
    } catch (error) {
        console.error("Error getting access token:", error);
        res.status(500).send("Error getting access token");
    }
});


router.get("/reset-password", getResetPassword)

// ================================================== Route Tags ================================================
// ==============================================================================================================
router.get("/tag/:tagname", getTags)
router.get("/search", getSearch)
router.get("/search/result", getSearchJson)


// ================================================== Route Sitemap ================================================
// ==============================================================================================================
router.get("/sitemap.xml", getIndexSitemap)
router.get("/animes/sitemap.xml", getAnimeSitemap)
router.get("/articles/sitemap.xml", getArticlesSitemap)


// ================================================== Route AI  ================================================
// ==============================================================================================================
router.get("/ai/vtuber", ensureAuthenticated, getAiVtuber)

// ================================================== Route getFilterAnime  ================================================
// ==============================================================================================================
router.get("/filter/anime", getFilterAnime)


// ================================================== Route Trending ================================================
// ==============================================================================================================

router.get("/Trending/th", getTrending)

// ================================================== Route Term ================================================
// ==============================================================================================================
router.get("/term", Term)
router.get("/PrivacyPolicy", getPrivacyPolicy)
router.get("/TermsService", getTermsService)


// ================================================== Route Meme ================================================
// ==============================================================================================================
router.get("/memes", getMeme)
router.get("/post/:id", getPostMeme)
router.get('/memes/page/:page', getMeme);
router.get("/create/meme/new", ensureAuthenticated, getCreateMeme)


// ================================================== Route Tags ================================================
// ==============================================================================================================
router.get("/survey/reward", ensureAuthenticated, getSurvey)
router.get("/survey/start/:surverid", getStartSurvey);
router.get("/survey/:id", checkSurveyAttempt, getSurveryAnswers)
router.get("/survey/:id/:questionId", checkSurveyAttempt, getSurveryquestionId)
router.post("/survey/:id/complete", getSurverycomplete);


// ================================================== Route Einthdraws ================================================
// ==============================================================================================================
router.get("/reward/withdraws", getWithdraw)
router.get("/reward/withdraws/truemoney", getWithdrawTrueMoneyWallet)


// ================================================= Route Recomments ============================================
// ==============================================================================================================
router.get("/foryou", getRecommen)

// ================================================= Route Dashboard ============================================
// ==============================================================================================================
router.get("/dashboard", authMiddleware, ensureAuthenticated, getDashboard)
router.get("/dashboard/code/reward", ensureAuthenticated, GetRewardCode)
router.get("/dashboard/manage/articles", authMiddleware, ensureAuthenticated, getDashboardManageArticle)
router.get("/dashboard/manage/memes", authMiddleware, ensureAuthenticated, getDashboardManageMeme)
router.get("/notifications/:id", authMiddleware, ensureAuthenticated, getNotifications)
router.get("/notifications/:notificationId/read", authMiddleware, ensureAuthenticated, getNotificationisRead)
router.get("/edit/post/article", authMiddleware, checkAuth, Getedit)
router.get("/edit/post/meme", authMiddleware, checkAuth, GeteditMeme)
router.get("/post/article/delete/:id", authMiddleware, checkAuth, deletePostArticle)

// ==================================================== Route Admin Page ========================================
// ==============================================================================================================
const { getAdmin, getAdminManageUser, getAdminReward, getAdminAPIKEY, getAdminAddBanner, gatManagePlayment, ManageBanner, ManageAnimes, getAdminRewardManage, ManageActor, ManageActPIKey, ManageVideos, getListseriesEP, filterUsers } = require("../../Controllers/AdminController")
const { getListsSurvey, getAdminSurveyCreate, EditSurvey } = require("../../Controllers/SurveyAdminController")

router.get("/admin", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdmin)
router.get("/admin/manage/users", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdminManageUser)
router.get("/admin/generate-api-key", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdminAPIKEY)
router.get("/admin/manage/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), ManageAnimes)
router.get("/admin/manage/apikey", authMiddleware, authhorizeRoleAdmin('admin'), ManageActPIKey)
router.get("/admin/edit/actor", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), ManageActor)
router.get("/admin/manage/videos", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), ManageVideos)
router.get("/admin/manage/series/Episode/:videoid", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getListseriesEP)
router.get("/admin/manage/playments", authMiddleware, authhorizeRoleAdmin('admin'), gatManagePlayment)
router.get("/admin/mamage/rewards", authMiddleware, authhorizeRoleAdmin('admin'), getAdminRewardManage)
router.get("/admin/mamage/banner", authMiddleware, authhorizeRoleAdmin('admin'), ManageBanner)
router.get("/admin/filter-users", filterUsers)

// ================================================== Route Admin add ================================================
// ==============================================================================================================
router.get("/admin/add/Reward", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdminReward)
router.get("/admin/add/banner", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdminAddBanner)
router.get("/admin/manage/survey", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getListsSurvey)
router.get("/admin/create/survey", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdminSurveyCreate)
router.get("/admin/create/reward", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getWithdrawTrueMoneyWalletCreate)
router.get('/admin/edit/survey/:id', authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), EditSurvey);
router.get('/admin/edit/reward/:id', authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), gatPlaymentEdit);


// ================================================= Route Anime ================================================
// ==============================================================================================================
router.get("/admin/add/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAnime)
router.get("/admin/add/anime/:id/schedule/time", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAddAnimeScheduleTimeline)
router.get("/admin/add/characters", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getCharacters)
router.get("/admin/add/pv/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getPVAnime)
router.get("/admin/add/anime/:id/streem", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAnimeStreem)
router.get("/admin/add/anime/streem/youtube", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAnimeStreemYoutube)
router.get("/admin/edit/:id/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getEditAnime)
router.get("/admin/edit/:id/title", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getEditAnimeTitle)
router.get("/admin/edit/:id/schedule/add", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getEditAnimeAddSchedule)
router.get("/admin/edit/anime/voice/actor", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAddActorToCharacter)
router.get("/admin/edit/anime/voice/actor/edit/new", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getEditActorToCharacter)


// ================================================= Route Channel ==============================================
// ==============================================================================================================

router.get("/channel/:username", getChannel)
router.get("/channel/:username/page/:page", getChannel)
router.get("/editor/:username", getChannel)
router.get("/editor/:username/page/:page", getChannel)

// ================================================= Router Profile ==============================================
// ===============================================================================================================
router.get("/:username", checkAuth, authMiddleware, authProfile)
router.get("/:username/saveanime", checkAuth, authMiddleware, authProfileSaveAnime)
router.get("/profile/:username/editprofile", checkAuth, authMiddleware, getEditProfile)
router.get("/profile/:username/editbanner/add", checkAuth, authMiddleware, EditBanner)

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/schedule/anime", getSchedule)
router.get("/schedule/timeline", getAnimeScheduleTimeline)
router.get("/anime/search/:season/:year", getAnimeSeason)
router.get("/search/anime", getAnimeAnilist)
router.get("/api/load/Infinite/anime", getInfiniteScroll)
router.get("/api/load/graphql/anime/lists", getAnilistAPI)

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/anime/:urlslug", getAnimeInfo)
router.get("/anime/:urlslug/stream", getAnimeStream)

// ===================================== GET UPLOADS ========================================================
// ==========================================================================================================

router.get("/uploads/create/article", ensureAuthenticated, authorizeRole('user', 'content_creator', 'partners', 'admin'), (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    res.render("./th/pages/uploads/createarticle", {
        userID, active: "CreateArticle"
    })
})


module.exports = router;