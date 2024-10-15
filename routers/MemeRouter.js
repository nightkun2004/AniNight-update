const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { createMeme, likeMeme, addComment, likeMemeComment, addReply, postComment } = require("../Controllers/MemeController")

router.post("/post/meme/new",ensureAuthenticated, checkAuth, authMiddleware,  createMeme)
// router.post("/api/comments",ensureAuthenticated, checkAuth, authMiddleware,  postComment)
router.post("/api/comment",ensureAuthenticated, checkAuth, authMiddleware,  addComment)
router.post("/api/like/meme/:id",ensureAuthenticated, checkAuth, authMiddleware,  likeMeme)
router.post("/meme/:id/comments/:commentId/like",ensureAuthenticated, checkAuth, authMiddleware,  likeMemeComment)
router.post('/meme/:id/comment', checkAuth, authMiddleware, addComment);
router.post('/meme/:id/comment/:commentId/reply', checkAuth, authMiddleware, addReply);


module.exports = router;