const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")
const Play = require("../models/PlayModel")

// trending PAGE MAIN
const getTrending = async (req, res, next) => {
    const userID = req.session.userlogin; 
    const lang = res.locals.lang; 
    const template = lang === 'th_TH' ? './th/trending' : './en/trending';
    try {

        const topViewedArticle = await Article.find() .populate('creator.id').sort({ views: -1 }).limit(20);
      

        res.render(template, {
            active: "Trending",
            topViewedArticle,
            lang,
            userID
        });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        console.error("Error fetching posts:", error);
        res.status(500).render('./th/trending', {
            error: errorMessage,
            userID,
            lang,
        });
    }
};



module.exports = {
    getTrending,
}