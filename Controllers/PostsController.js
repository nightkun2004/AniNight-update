const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const { getRecommendations } = require("../lib/generateRecommen")

// ============================= get SINGLE POST
// HOME PAGE MAIn
const getPosts = async (req, res, next) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        // Fetch all posts and populate the 'creator.id' field
        const Posts = await Article.find().populate('creator.id').sort({createdAt: -1 }).limit(10).exec();
        const TopViews = await Article.find().populate('creator.id').sort({ views: -1}).limit(10)

        // Pass 'posts' to the template
        res.render(`./th/index`, { Posts, userID, TopViews, translations: req.translations,  lang});
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/index', {
            error: errorMessage,
            userID,
            lang ,
            translations: req.translations, 
        });
    }
};



// ============================= get API Doraemon Thailand
const getAPINextdoraemon = async (req, res, next) => {
    const { urlslug } = req.params;
    try {
        const Posts = await Article.find({ urlslug }).populate('creator.id').sort({ createdAt: -1 }).exec();
        res.json({ msg: "ข้อมูลโดราเอมอน", Posts });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        });
    }
};

module.exports = {
    getPosts,
    getAPINextdoraemon
}