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

        res.render(`./th/pages/recommendations`, { 
            articles, 
            currentPage: page, 
            totalPages, 
            sortBy , 
            userID, 
            active: "foryou",
            lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/recommendations`, {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}


async function getRecommendedContent(userId) {
    const user = await User.findById(userId).populate('interactions.contentId');
  
    // ตรวจสอบว่าผู้ใช้มีข้อมูลหรือไม่
    if (!user || !user.interactions.length) {
        return []; // หากไม่มีการมีส่วนร่วม แนะนำว่าไม่ต้องแสดงเนื้อหา
    }

    // เก็บหมวดหมู่และแท็กที่ผู้ใช้เคยดูหรือมีส่วนร่วม
    const viewedCategories = new Set();
    const viewedTags = new Set();
    const viewedUrlslug = new Set();

    user.interactions.forEach((interaction) => {
        const content = interaction.contentId;
        if (content) {
            viewedCategories.add(content.category);
            viewedUrlslug.add(content.urlslug);
            content.tags.forEach(tag => viewedTags.add(tag));
        }
    });

    // ค้นหาเนื้อหาที่มีหมวดหมู่และแท็กคล้ายกับที่ผู้ใช้สนใจ
    const recommendedContent = await Article.find({
        $or: [
            { categories: { $in: Array.from(viewedCategories) } },
            { tags: { $in: Array.from(viewedTags) } },
            { urlslug: { $in: Array.from(viewedUrlslug) } } 
        ]
    }).populate('creator.id').sort({ createdAt: -1 }).limit(5);

    return recommendedContent;
}

module.exports = {
    getRecommen,
    getRecommendedContent
}