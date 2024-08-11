const express = require("express")
const router = express.Router()

router.get("/top/coin", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("Topcoin", {userID})
})

router.get("/top/coin/Successful", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/playments/Successful", {userID})
})

router.get("/top/coin/Cancel", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./pages/playments/Cancel", {userID})
})

module.exports = router;