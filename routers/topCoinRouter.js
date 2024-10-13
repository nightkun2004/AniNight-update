const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
const { createCheckoutSession } = require("../Controllers/topupController")
const stripeWebhook  = require("../webhooks/stripeWebhook")

router.get("/top/coin", checkAuth, (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./th/Topcoin", {userID , active: "topcoin"})
})

router.get("/top/coin/Successful", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./th/pages/playments/Successful", {userID , active: "topcoin"})
})

router.get("/top/coin/Cancel", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./th/pages/playments/Cancel", {userID, active: "topcoin"})
})


router.post('/create-checkout-session', authMiddleware, createCheckoutSession);
router.post('/webhook', stripeWebhook.handleWebhook);


module.exports = router;