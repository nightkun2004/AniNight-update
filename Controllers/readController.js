const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")

// ============================= get SINGLE POST
// GET : /api/posts
const getRead = async (req, res, next) => {
    const { urlslug } = req.params;
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        // Fetch all posts and populate the 'creator.id' field
        const post = await Article.findOne({ urlslug: urlslug}).populate('creator.id').exec();
        const recentUpdates = await Article.find().sort({ createdAt: -1 }).limit(4).populate('creator.id').exec();
        if (!post) {
            return res.status(404).render(`${lang}/read`, {
                post: { title: "ไม่พบข้อมูล"},
                error: 'ไม่พบบทความหรือบทความอาจจะถูกลบแล้ว',
                userID,
                translations: req.translations,lang  
            });
        }

        post.views = (post.views || 0) + 1;
        await post.save();

        let isSaved = false;
        if (userID && userID.user._id && post.savearticles) {
            isSaved = post.savearticles.includes(userID.user._id.toString());
        }
        // console.log(post)
        // Pass 'posts' to the template
        res.render(`${lang}/read`, { post, recentUpdates, userID, isSaved , translations: req.translations,lang  });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/read`, {
            error: errorMessage,
            userID, 
            translations: req.translations,lang  
        });
    }
};


const saveArticle = async (req,res) => {
    const userID = req.session.userlogin;
    try {
        const user = await User.findById(req.user.id);
          
        if (!user) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        const { articleId } = req.body;

        if (!articleId) {
            return res.status(400).json({ success: false, message: 'ไม่พบ ID ของบทความ' });
        }

        // เพิ่มบทความลงในรายการบันทึก
        // if (!user.savearticles.includes(articleId)) {
        //     user.savearticles.push(articleId);
        //     await user.save();
        //     return res.status(200).json({ success: true, message: '' });
        // } else {
        //     return res.status(400).json({ success: false, message: 'บทความนี้ถูกบันทึกแล้ว' });
        // }

        const articleIndex = user.savearticles.indexOf(articleId);

        // Toggle save/remove logic
        if (articleIndex === -1) {
            // Save the article
            user.savearticles.push(articleId);
            await user.save();
            return res.status(200).json({ success: true, message: 'บันทึกบทความสำเร็จ' });
        } else {
            // Remove the article
            user.savearticles.splice(articleIndex, 1);
            await user.save();
            return res.status(200).json({ success: true, message: 'ยกเลิกการบันทึกบทความแล้ว' });
        }

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: errorMessage });
    }
}


const likeArticle = async (req, res) => {
    try {
        const userId = req.user.id;
        const { articleId } = req.body;

        if (!userId) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        if (!articleId) {
            return res.status(400).json({ success: false, message: 'ไม่พบ ID ของบทความ' });
        }

        // ค้นหาบทความที่ต้องการ
        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ success: false, message: 'ไม่พบบทความ' });
        }

        // ตรวจสอบว่าผู้ใช้เคยไลค์บทความนี้หรือยัง
        const hasLiked = article.likes.includes(userId);

        if (hasLiked) {
            // ถ้าผู้ใช้เคยไลค์แล้ว ให้ลบไลค์
            article.likes = article.likes.filter(like => !like.equals(userId));
            await article.save();
            return res.status(200).json({ success: true, message: 'ลบไลค์บทความแล้ว' });
        } else {
            // ถ้าผู้ใช้ยังไม่ไลค์ ให้เพิ่มไลค์
            article.likes.push(userId);
            await article.save();
            return res.status(200).json({ success: true, message: 'เพิ่มไลค์บทความแล้ว' });
        }

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: errorMessage });
    }
}

const updateAdsDisplayed = async (articleId) => {
    try {
        await Article.findByIdAndUpdate(articleId, { $inc: { adsDisplayed: 1 } });
    } catch (error) {
        console.error('Error updating adsDisplayed:', error);
    }
};


module.exports = {
    getRead,
    saveArticle,
    likeArticle,
    updateAdsDisplayed
}