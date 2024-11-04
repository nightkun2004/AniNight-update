const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")
const Play = require("../models/PlayModel")
const { getRecommendations } = require("../lib/generateRecommen")
const { getRecommendedContent } = require("../Controllers/RecommenController")

const checkScheduledArticles = async () => {
    try {
        const now = new Date();
        const articles = await Article.find({ scheduledAt: { $lte: now }, published: false });

        if (articles.length > 0) {
            for (const article of articles) {
                article.published = true;
                await article.save();
                console.log(`Article "${article.title}" has been published.`);
            }
        }
    } catch (error) {
        console.error("Error checking scheduled articles:", error);
    }
};

setInterval(checkScheduledArticles, 60000); // ตั้งเวลาให้ทำงานทุกๆ 1 นาที (60000 มิลลิวินาที)

// ============================= get SINGLE POST
// HOME PAGE MAIN
const getPosts = async (req, res, next) => {
    const userID = req.session.userlogin; 
    const usertoken = userID?.user?._id; 
    const lang = res.locals.lang; 
    const page = parseInt(req.params.page) || 1;
    const limit = 15; 

    try {
        const Posts = await Article.find()
            .populate('creator.id')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();

        const totalPosts = await Article.countDocuments();
        const TopViews = await Article.find()
            .populate('creator.id')
            .sort({ views: -1 })
            .limit(10)
            .exec();

        const Animelists = await Anime.find()
            .sort({ createdAt: -1 })
            .exec();

        const template = lang === 'th_TH' ? './th/index' : './th/index';

        let recommendedContent = [];
        if (userID) {
            recommendedContent = await getRecommendedContent(usertoken);
        }

        // ส่งตัวแปรทั้งหมดไปยัง EJS
        res.render(template, {
            active: "Home",
            Posts: Posts || [],
            Animelists,
            userID,
            TopViews,
            page,
            totalPages: Math.ceil(totalPosts / limit),
            lang,
            recommendedContent,
        });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        console.error("Error fetching posts:", error);
        res.status(500).render('./th/index', {
            error: errorMessage,
            userID,
            lang,
            translations: req.translations,
            Posts: [],
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