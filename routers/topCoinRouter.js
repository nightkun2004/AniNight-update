const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")

router.get("/top/coin", checkAuth, (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./th/Topcoin", {userID , active: "topcoin"})
})

router.get("/top/coin/Successful", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/playments/Successful", {userID , active: "topcoin"})
})

router.get("/top/coin/Cancel", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/playments/Cancel", {userID, active: "topcoin"})
})

module.exports = router;