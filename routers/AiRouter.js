const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { aiVtuber} = require("../Controllers/AiController")

// app.use("/api/v2", AiRoute)

router.post("/user/ai/res/vtuber", authMiddleware, aiVtuber)
 
module.exports = router;