const express = require("express")
const router = express.Router()
const { CreateArticle } = require("../Controllers/UploadsController")
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")

router.post("/post/article/create", authMiddleware, ensureAuthenticated, checkAuth, CreateArticle)


module.exports = router;