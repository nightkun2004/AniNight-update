const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
const {authLogin, getEditProfile, authRegister, authProfile, getChannel, getFollow,EditProfileAvater,  getUnfollow, EditBannerPost, EditProfile, logout} = require("../Controllers/authController")

router.get("/auth/login", (req,res)=>{
    const user = req.session.userlogin;
    res.render("./pages/authPages/login", {user})
})
router.get("/auth/register", (req,res)=>{
    const user = req.session.userlogin;
    res.render("./pages/authPages/register", {user})
})

router.get("/channel/:username/:id", getChannel)

router.get("/profile/:username", authProfile)
router.get("/profile/:username/editprofile", checkAuth, authMiddleware, getEditProfile)
 


// เส้นทางสำหรับ Controllers
router.post("/auth/login", authLogin)
router.post("/auth/register", authRegister)
router.post("/channel/follow/:id", getFollow) 
router.post("/channel/followers/:id", getUnfollow);
router.post("/editprofile",checkAuth, authMiddleware, EditProfile);
router.post("/editprofile/changeProfile",checkAuth, authMiddleware, EditProfileAvater);
router.post("/editprofile/editbanner/add",checkAuth, authMiddleware, EditBannerPost);
router.post("/logout", checkAuth, authMiddleware , logout)




const { APIauthLogin, APIauthProfile } = require("../Controllers/apiAuthController")

// Routers API v.3
router.post("/auth/login/studio", APIauthLogin)
router.post("/auth/profile", authMiddleware, APIauthProfile)


module.exports = router;