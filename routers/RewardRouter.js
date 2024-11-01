const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { adminAddReward, userRedeemReward, DeleteReward } = require("../Controllers/RewardController")

// app.use("/api/v2", RewardRoute)

router.post("/admin/add/reward", authMiddleware, adminAddReward)
router.post("/redeem/add/reward", authMiddleware, userRedeemReward)
router.delete("/admin/delete/reward/:id", DeleteReward)

module.exports = router;