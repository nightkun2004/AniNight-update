const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
const { getFollow, getUnfollow } = require("../Controllers/ChannelController")

router.post("/user/follow/:userId", authMiddleware, getFollow) 
router.delete("/user/unfollow/:userId", authMiddleware, getUnfollow);


module.exports = router;