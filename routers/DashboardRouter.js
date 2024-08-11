const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { getDashboard, EditPostArticle, deletePostArticle } = require("../Controllers/DashboardController")

router.post("/edit/post/article", authMiddleware, checkAuth, EditPostArticle)
// router.post("/post/article/delete/:id", authMiddleware, checkAuth, deletePostArticle)

module.exports = router;