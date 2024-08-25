const express = require("express")
const router = express.Router()
const { getEditProfile, authProfile, authProfileSaveAnime, EditBanner} = require("../../Controllers/authController")
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { authorizeRole, authhorizeRoleAdmin } = require("../../Middlewares/authorizeMiddleware")
const { getDashboard,Getedit,deletePostArticle } = require("../../Controllers/DashboardController")
const { getRecommen } = require("../../Controllers/RecommenController")
const { getAnime, getEditAnime, getSchedule, getInfiniteScroll, getAnimeStreem } = require("../../Controllers/AnimeController")
const { getAnimeInfo, getAnimeStream } = require("../../Controllers/ScheduleAnimeController")
const { getChannel } = require("../../Controllers/ChannelController")

router.get("/:lang(en|th|jp)?/auth/login", (req,res)=>{
    const lang = req.params.lang || 'th'; 
    const userID = req.session.userlogin;
    res.render("./pages/authPages/login", {userID, translations: req.translations,lang  })
})
router.get("/:lang(en|th|jp)?/auth/register", (req,res)=>{
    const lang = req.params.lang || 'th'; 
    const userID = req.session.userlogin;
    res.render("./pages/authPages/register", {userID, translations: req.translations,lang  })
})


// ================================================= Route Recomments ============================================
// ==============================================================================================================
router.get("/:lang(en|th|jp)?/foryou", getRecommen)

// ================================================= Route Dashboard ============================================
// ==============================================================================================================
router.get("/:lang(en|th|jp)?/dashboard",authMiddleware , ensureAuthenticated, getDashboard)
router.get("/:lang(en|th|jp)?/edit/post/article",authMiddleware , checkAuth , Getedit)
router.get("/:lang(en|th|jp)?/post/article/delete/:id",authMiddleware , checkAuth , deletePostArticle)

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

router.get("/:lang(en|th|jp)?/channel/:username", getChannel)

// ================================================= Router Profile ==============================================
// ===============================================================================================================
router.get("/:lang(en|th|jp)?/:username", checkAuth, authMiddleware , authProfile)
router.get("/:lang(en|th|jp)?/:username/saveanime", checkAuth, authMiddleware , authProfileSaveAnime)
router.get("/profile/:username/editprofile",checkAuth, authMiddleware , getEditProfile)
router.get("/profile/:username/editbanner/add", checkAuth, authMiddleware, EditBanner)

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/:lang(en|th|jp)?/schedule/anime",getSchedule) 
router.get("/api/load/Infinite/anime", getInfiniteScroll) 

// ================================================== เส้นทาง ตารางอนิเมะ ===========================================
// ===============================================================================================================
router.get("/:lang(en|th|jp)?/anime/:urlslug", getAnimeInfo)
router.get("/:lang(en|th|jp)?/anime/:urlslug/stream", getAnimeStream)

// ===================================== GET UPLOADS ========================================================
// ==========================================================================================================

router.get("/:lang(en|th|jp)?/uploads/create/article", ensureAuthenticated, authorizeRole('content_creator', 'partners'), (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/uploads/createarticle", {userID})
})


module.exports = router;