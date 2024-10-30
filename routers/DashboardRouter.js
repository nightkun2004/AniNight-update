const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { getDashboard, EditPostArticle, deletePostArticle } = require("../Controllers/DashboardController")
const { saveTrueMoney, savebankaccount } = require("../Controllers/authController")

router.post("/edit/post/article", authMiddleware, checkAuth, EditPostArticle)
// router.post("/post/article/delete/:id", authMiddleware, checkAuth, deletePostArticle)

router.post('/save/truemoney/user/:userId', checkAuth, authMiddleware, saveTrueMoney);
router.post('/save/bank/user/:userId', checkAuth, authMiddleware,  savebankaccount);

module.exports = router;