const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
const {authLogin, getEditProfile, authRegister, authProfile, authArticleUser, ResetPassword , checkTokenNewPassword,  EditProfileAvater, EditBannerPost, EditProfile, logout} = require("../Controllers/authController")
const { getFollow, getUnfollow } = require("../Controllers/ChannelController")

router.get("/auth/login", (req,res)=>{
    const user = req.session.userlogin;
    res.render("./pages/authPages/login", {user})
})
router.get("/auth/register", (req,res)=>{
    const user = req.session.userlogin;
    res.render("./pages/authPages/register", {user})
})

router.get("/profile/:username", authProfile)
router.get("/profile/:username/editprofile", checkAuth, authMiddleware, getEditProfile)

// เส้นทางสำหรับ Controllers
router.post("/auth/login", authLogin)
router.post("/auth/register", authRegister)
router.post("/forget/password", ResetPassword)
router.post("/new/password", checkTokenNewPassword)

router.post("/editprofile",checkAuth, authMiddleware, EditProfile);
router.post("/editprofile/changeProfile",checkAuth, authMiddleware, EditProfileAvater);
router.post("/editprofile/editbanner/add",checkAuth, authMiddleware, EditBannerPost);
router.post("/logout", checkAuth, authMiddleware , logout)



const { APIauthLogin, APIauthProfile } = require("../Controllers/apiAuthController")

// Routers API v.3
router.post("/auth/login/studio", APIauthLogin)
router.post("/auth/profile", authMiddleware, APIauthProfile)
router.post("/article/:userid/datas", authArticleUser)


module.exports = router;