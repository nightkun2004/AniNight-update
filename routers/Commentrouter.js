const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { addComment , getComments} = require("../Controllers/CommentController")

// AddComment
// Method: POST // API endpoint: /api/v2/add/comment/article
router.post("/add/comment/article", authMiddleware, addComment)
router.post("/article/comments/:articleId", getComments)

module.exports = router;