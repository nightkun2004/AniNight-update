const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const {getPosts} = require("../Controllers/apiAuthController")
const { saveArticle, likeArticle,updateAdsDisplayed } = require("../Controllers/readController")



router.post("/save/article", checkAuth, authMiddleware, ensureAuthenticated, saveArticle)
router.post("/articles/like", checkAuth, authMiddleware, ensureAuthenticated, likeArticle)
router.post('/track-ad-display/:articleId', async (req, res) => {
    const { articleId } = req.params;
    try {
        await updateAdsDisplayed(articleId);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});













// ============================== API =====================================================
// ========================================================================================

router.get("/posts/:id", getPosts)

module.exports = router;