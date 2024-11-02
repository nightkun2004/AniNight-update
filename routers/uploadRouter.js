const express = require("express")
const router = express.Router()
const { CreateArticle } = require("../Controllers/UploadsController")
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { postBanner, DeteleBanner } = require("../Controllers/BannerController")
const { checkAuth } = require("../lib/auth")

router.post("/post/article/create", authMiddleware, ensureAuthenticated, checkAuth, CreateArticle)
router.post("/post/admin/add/banner", authMiddleware, ensureAuthenticated, checkAuth, postBanner)

router.delete("/post/admin/delete/banner/:id", DeteleBanner)

module.exports = router;