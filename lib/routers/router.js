const express = require("express")
const router = express.Router()
const { getEditProfile, authProfile, getChannel, EditBanner} = require("../../Controllers/authController")
const { checkAuth } = require("../../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../../Middlewares/authMiddleware")
const { authorizeRole, authhorizeRoleAdmin } = require("../../Middlewares/authorizeMiddleware")
const { getDashboard,Getedit } = require("../../Controllers/DashboardController")
const { getRecommen } = require("../../Controllers/RecommenController")

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

// ==================================================== Route Admin Page ========================================
// ==============================================================================================================
const { getAdmin, filterUsers } = require("../../Controllers/AdminController")

router.get("/admin", authMiddleware, authhorizeRoleAdmin('admin', 'moderator'), getAdmin)
router.get("/admin/filter-users", filterUsers)


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
router.get("/schedule/anime", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/schedulePages/index", {userID})
})


// ===================================== GET UPLOADS ========================================================
// ==========================================================================================================

router.get("/uploads/create/article", ensureAuthenticated, authorizeRole('content_creator', 'partners'), (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/uploads/createarticle", {userID})
})


module.exports = router;