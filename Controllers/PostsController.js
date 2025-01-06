const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")
const Play = require("../models/PlayModel")
const { getRecommendations } = require("../lib/generateRecommen")
const { getRecommendedContent } = require("../Controllers/RecommenController")
const { getAiResponseForTranslation } = require("../services/aiService")

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

setInterval(checkScheduledArticles, 60000);

const getTranslation = async (req, res) => {
    const postId = req.params.postId;
    const lang = req.query.lang; // ภาษาเป้าหมาย (เช่น 'en')

    try {
        // ดึงข้อมูลบทความจากฐานข้อมูล
        const post = await Article.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'บทความไม่พบ' });
        }

        // เรียกฟังก์ชันแปล
        const translatedTitle = await getAiResponseForTranslation(post.title, lang);

        // ส่งผลลัพธ์การแปลกลับ
        res.json({ translatedTitle });
    } catch (error) {
        console.error('Error in translation API:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแปล' });
    }
}

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


        const LatestPosts = await Article.find().sort({ createdAt: -1 }).limit(2).exec();
        const Animelists = await Anime.find()
            .sort({ createdAt: -1 })
            .exec();
        const Nextseason = await Anime.find({ year: 2025, season: "Winter" }).sort({ createdAt: -1 }).exec();

        // กำหนดเทมเพลตตามภาษา
        const templates = {
            th: './th/index',
            en: './home/en/index',
            jp: './home/jp/index', // เพิ่มตัวเลือกภาษาญี่ปุ่น
        };
        const template = templates[lang] || templates.th;
        // console.log(template)
        // แปลหัวข้อบทความตามภาษาที่เลือก

        let recommendedContent = [];
        if (userID) {
            recommendedContent = await getRecommendedContent(usertoken);
        }

        // ส่งตัวแปรทั้งหมดไปยัง EJS
        res.render(template, {
            active: "Home",
            Posts: Posts || [],
            Animelists,
            LatestPosts,
            Nextseason,
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
    getTranslation,
    getAPINextdoraemon
}