const express = require("express")
const router = express.Router()
const { getEditProfile, authProfile, getChannel, EditBanner} = require("../../Controllers/authController")
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { authorizeRole, authhorizeRoleAdmin } = require("../../Middlewares/authorizeMiddleware")
const { getDashboard,Getedit,deletePostArticle } = require("../../Controllers/DashboardController")
const { getRecommen } = require("../../Controllers/RecommenController")
const { getAnime, getEditAnime, getSchedule, getInfiniteScroll, getAnimeStreem } = require("../../Controllers/AnimeController")
const { getAnimeInfo, getAnimeStream } = require("../../Controllers/ScheduleAnimeController")

router.get("/auth/login", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/authPages/login", {userID})
})
router.get("/auth/register", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/authPages/register", {userID})
})


// ================================================= Route Recomments ============================================
// ==============================================================================================================
router.get("/foryou", ensureAuthenticated, getRecommen)

// ================================================= Route Dashboard ============================================
// ==============================================================================================================
router.get("/dashboard",authMiddleware , ensureAuthenticated, getDashboard)
router.get("/edit/post/article",authMiddleware , checkAuth , Getedit)
router.get("/post/article/delete/:id",authMiddleware , checkAuth , deletePostArticle)

// ==================================================== Route Admin Page ========================================
// ==============================================================================================================
const { getAdmin, ManageAnimes, filterUsers } = require("../../Controllers/AdminController")

router.get("/admin", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdmin)
router.get("/admin/manage/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), ManageAnimes)
router.get("/admin/filter-users", filterUsers)


// ================================================= Route Anime ================================================
// ==============================================================================================================
router.get("/admin/add/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAnime)
router.get("/admin/add/anime/streem", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAnimeStreem)
router.get("/admin/edit/anime", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getEditAnime)


// ================================================= Route Channel ==============================================
// ==============================================================================================================

router.get("/channel/:username/:id", getChannel)

// ================================================= Router Profile ==============================================
// ===============================================================================================================
router.get("/:username", checkAuth, authMiddleware , authProfile)
router.get("/profile/:username/editprofile",checkAuth, authMiddleware , getEditProfile)
router.get("/profile/:username/editbanner/add", checkAuth, authMiddleware, EditBanner)

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/schedule/anime",getSchedule)
router.get("/api/load/Infinite/anime", getInfiniteScroll)

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/anime/:urlslug", getAnimeInfo)
router.get("/anime/:urlslug/stream", getAnimeStream)

// ===================================== GET UPLOADS ========================================================
// ==========================================================================================================

router.get("/uploads/create/article", ensureAuthenticated, authorizeRole('content_creator', 'partners'), (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/uploads/createarticle", {userID})
})


module.exports = router;