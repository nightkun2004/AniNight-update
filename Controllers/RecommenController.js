const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const { getRecommendations } = require("../lib/generateRecommen")

const getRecommen = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        const sortBy = req.query.sortBy || 'views';
        const page = parseInt(req.query.page) || 1; // หน้าปัจจุบัน (ค่าเริ่มต้นคือ 1)
        const limit = 10; // จำนวนบทความที่แสดงต่อหน้า
        const skip = (page - 1) * limit; // จำนวนบทความที่ต้องข้าม

        // ค้นหาบทความที่มียอดวิวหรือยอดไลค์เยอะสุด
        const articles = await Article.find({ published: true })
            .sort({ [sortBy]: -1 }) // เรียงตามยอดวิวหรือยอดไลค์จากมากไปน้อย
            .skip(skip) // ข้ามบทความที่ไม่ใช่ในหน้านี้
            .limit(limit) // จำกัดจำนวนบทความต่อหน้า
            .exec();

        const totalArticles = await Article.countDocuments({ published: true });
        const totalPages = Math.ceil(totalArticles / limit);

        res.render(`${lang}/pages/recommendations`, { articles, currentPage: page, totalPages, sortBy , userID, translations: req.translations,lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/recommendations`, {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}

module.exports = {
    getRecommen
}