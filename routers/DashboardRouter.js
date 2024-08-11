const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { getDashboard, EditPostArticle } = require("../Controllers/DashboardController")

router.post("/edit/post/article", authMiddleware, checkAuth, EditPostArticle)

module.exports = router;