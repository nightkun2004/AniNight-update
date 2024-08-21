const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const { getRecommendations } = require("../lib/generateRecommen")

// ============================= get SINGLE POST
// GET : /api/posts
const getPosts = async (req, res, next) => {
    const userID = req.session.userlogin;
    try {
        // Fetch all posts and populate the 'creator.id' field
        const Posts = await Article.find().populate('creator.id').sort({createdAt: -1 }).limit(10).exec();
        const TopViews = await Article.find().populate('creator.id').sort({ views: -1}).limit(10)

        // Pass 'posts' to the template
        res.render("index", { Posts, userID, TopViews });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('index', {
            error: errorMessage,
            userID
        });
    }
};


module.exports = {
    getPosts
}