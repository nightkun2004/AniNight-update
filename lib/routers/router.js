const express = require("express")
const router = express.Router()
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../../models/UserModel")
const jwt = require("jsonwebtoken")
const { getEditProfile, authProfile, authProfileSaveAnime, EditBanner } = require("../../Controllers/authController")
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { authorizeRole, authhorizeRoleAdmin } = require("../../Middlewares/authorizeMiddleware")
const { getDashboard, Getedit, gatManagePlayment, gatPlaymentEdit, deletePostArticle } = require("../../Controllers/DashboardController")
const { getRecommen } = require("../../Controllers/RecommenController")
const { getAnime, getEditAnime, getSchedule, getInfiniteScroll, getAnimeStreem } = require("../../Controllers/AnimeController")
const { getAnimeInfo, getAnimeStream } = require("../../Controllers/ScheduleAnimeController")
const { getChannel } = require("../../Controllers/ChannelController")

const { getTags } = require("../../Controllers/TagController")
const { getSurvey } = require("../../Controllers/SurveyControler")
const { getWithdraw, getWithdrawTrueMoneyWallet, getWithdrawTrueMoneyWalletCreate } = require("../../Controllers/PlaymentsController")

const {Term} = require("../../Controllers/TermController")
require("dotenv").config()

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
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

            // สร้างผู้ใช้ใหม่
            const newUser = await new User({
                username: profile.displayName,
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


router.get("/:lang(en|th|jp)?/auth/login", (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    res.render("./pages/authPages/login", { userID, translations: req.translations, lang })
})
router.get("/:lang(en|th|jp)?/auth/register", (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    const siteKey = process.env.SITE_KEY;
    res.render("./pages/authPages/register", {
        userID,
        translations: req.translations,
        lang,
        siteKey
    })
})

// Route สำหรับการเข้าสู่ระบบด้วย Google
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));


// Route สำหรับ callback หลังจาก Google OAuth
router.get('/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        req.session.userlogin = { user: req.user};
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

        // console.log("Google loginin",req.user)
        const returnTo = req.session.returnTo || `/${req.user.username}`;
        delete req.session.returnTo;
        res.redirect(returnTo);
    }
);

// ================================================== Route Tags ================================================
// ==============================================================================================================
router.get("/tag/:tagname", getTags)





// ================================================== Route Term ================================================
// ==============================================================================================================
router.get("/term", Term)


// ================================================== Route Tags ================================================
// ==============================================================================================================
router.get("/survey/reward", ensureAuthenticated, getSurvey)


// ================================================== Route Einthdraws ================================================
// ==============================================================================================================
router.get("/reward/withdraws", getWithdraw)
router.get("/reward/withdraws/truemoney", getWithdrawTrueMoneyWallet)


// ================================================= Route Recomments ============================================
// ==============================================================================================================
router.get("/:lang(en|th|jp)?/foryou", getRecommen)

// ================================================= Route Dashboard ============================================
// ==============================================================================================================
router.get("/:lang(en|th|jp)?/dashboard", authMiddleware, ensureAuthenticated, getDashboard)
router.get("/:lang(en|th|jp)?/edit/post/article", authMiddleware, checkAuth, Getedit)
router.get("/:lang(en|th|jp)?/post/article/delete/:id", authMiddleware, checkAuth, deletePostArticle)

// ==================================================== Route Admin Page ========================================
// ==============================================================================================================
const { getAdmin, ManageAnimes, filterUsers } = require("../../Controllers/AdminController")
const { getListsSurvey, getAdminSurveyCreate, EditSurvey } = require("../../Controllers/SurveyAdminController")

router.get("/admin", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdmin)
router.get("/admin/manage/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), ManageAnimes)
router.get("/admin/manage/playments", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), gatManagePlayment)
router.get("/admin/filter-users", filterUsers)

// ================================================== Route Admin Survey add ================================================
// ==============================================================================================================
router.get("/admin/manage/survey", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getListsSurvey)
router.get("/admin/create/survey", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdminSurveyCreate)
router.get("/admin/create/reward", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getWithdrawTrueMoneyWalletCreate)
router.get('/admin/edit/survey/:id', authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), EditSurvey);
router.get('/admin/edit/reward/:id', authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), gatPlaymentEdit);


// ================================================= Route Anime ================================================
// ==============================================================================================================
router.get("/admin/add/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAnime)
router.get("/admin/add/anime/streem", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAnimeStreem)
router.get("/admin/edit/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getEditAnime)


// ================================================= Route Channel ==============================================
// ==============================================================================================================

router.get("/:lang(en|th|jp)?/channel/:username", getChannel)
router.get("/:lang(en|th|jp)?/editor/:username", getChannel)

// ================================================= Router Profile ==============================================
// ===============================================================================================================
router.get("/:lang(en|th|jp)?/:username", checkAuth, authMiddleware, authProfile)
router.get("/:lang(en|th|jp)?/:username/saveanime", checkAuth, authMiddleware, authProfileSaveAnime)
router.get("/profile/:username/editprofile", checkAuth, authMiddleware, getEditProfile)
router.get("/profile/:username/editbanner/add", checkAuth, authMiddleware, EditBanner)

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/:lang(en|th|jp)?/schedule/anime", getSchedule)
router.get("/api/load/Infinite/anime", getInfiniteScroll)

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/:lang(en|th|jp)?/anime/:urlslug", getAnimeInfo)
router.get("/:lang(en|th|jp)?/anime/:urlslug/stream", getAnimeStream)

// ===================================== GET UPLOADS ========================================================
// ==========================================================================================================

router.get("/:lang(en|th|jp)?/uploads/create/article", ensureAuthenticated, authorizeRole('content_creator', 'partners'), (req, res) => {
    const userID = req.session.userlogin;
    const lang = req.params.lang || 'th';
    res.render("./pages/uploads/createarticle", {
        userID, userID,
        translations: req.translations, lang
    })
})


module.exports = router;