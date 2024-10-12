const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const { getRecommendations } = require("../lib/generateRecommen")

// ============================= get SINGLE POST
// HOME PAGE MAIN
const getPosts = async (req, res, next) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const page = parseInt(req.params.page) || 1;
    const limit = 10;
    try {
        // Fetch all posts and populate the 'creator.id' field
        const Posts = await Article.find()
            .populate('creator.id')
            .skip((page - 1) * limit) // ข้ามโพสต์ก่อนหน้านี้
            .limit(limit) // จำกัดจำนวนโพสต์ที่ดึงมา
            .exec();

        const totalPosts = await Article.countDocuments(); 

        const TopViews = await Article.find().populate('creator.id').sort({ views: -1 }).limit(10);

        res.render(`./th/index`, { 
            active: "Home", 
            Posts, 
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