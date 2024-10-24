const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")
const Play = require("../models/PlayModel")
const { getRecommendations } = require("../lib/generateRecommen")

// ============================= get SINGLE POST
// HOME PAGE MAIN
const getPosts = async (req, res, next) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const page = parseInt(req.params.page) || 1;
    const limit = 15;
    try {
        // Fetch all posts and populate the 'creator.id' field
        const Posts = await Article.find()
            .populate('creator.id')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        const totalPosts = await Article.countDocuments(); 

        const TopViews = await Article.find().populate('creator.id').sort({ views: -1 }).limit(10);
        const Animelists = await Anime.find().sort({ createdAt: -1 }).exec();

        const template = req.language === 'th_TH' ? './th/index' : './en/index';

        res.render(template, { 
            active: "Home", 
            Posts, 
            Animelists,
            userID, 
            TopViews, 
            page, 
            totalPages: Math.ceil(totalPosts / limit), 
            lang 
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/index', {
            error: errorMessage,
            userID,
            lang,
            translations: req.translations,
        });
    }
};


// ============================= get API Doraemon Thailand
const getAPINextdoraemon = async (req, res, next) => {
    const { tags } = req.params;
    try {
        const Posts = await Article.find({ tags }).sort({ createdAt: -1 }).exec();
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