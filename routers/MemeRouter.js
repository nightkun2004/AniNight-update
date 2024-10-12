const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { createMeme, addComment,postComment } = require("../Controllers/MemeController")

router.post("/post/meme/new",ensureAuthenticated, checkAuth, authMiddleware,  createMeme)
router.post("/api/comments",ensureAuthenticated, checkAuth, authMiddleware,  postComment)
router.post("/api/comment",ensureAuthenticated, checkAuth, authMiddleware,  addComment)


module.exports = router;