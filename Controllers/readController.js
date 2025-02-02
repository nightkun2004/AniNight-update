const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Banner = require("../models/bannnerModel")
const Notification = require("../models/NotificationModel");
const { sendEmail } = require("../transporter");
const { emailHtmlAddViewsArticle } = require("../emailHtml/addViewToArticle")
require("dotenv").config();

const addViewToArticle = async (articleId, userId) => {
    try {
        const article = await Article.findByIdAndUpdate(
            articleId,
            { $inc: { views: 1 } }, // เพิ่มยอดวิว
            { new: true } // ให้คืนค่าบทความที่ถูกอัปเดตใหม่
        );
        const user = await User.findById(userId);

        if (!article || !user) return;

        const pointsPerView = 1;
        const ratePerPoint = 0.10;
        user.earnings += pointsPerView * ratePerPoint;

        // Update interactions
        const interaction = user.interactions.find(interaction => interaction.contentId.equals(articleId));
        if (interaction) {
            interaction.viewedAt = new Date();
            interaction.watchedDuration = (interaction.watchedDuration || 0) + 1;
        } else {
            user.interactions.push({
                contentId: articleId,
                viewedAt: new Date(),
                watchedDuration: 1 // Initial watch duration
            });
        }

        const notificationMessage = `คุณผู้ใช้ ${user.username} ได้รับรายได้ ${user.earnings.toFixed(2)} จากบทความ "${article.title}".`;
        const lognotification = await Notification.create({
            ownerId: article.creator.id,
            message: notificationMessage,
            articleId: article._id,
        });

        // Save user interaction
        await user.save();

        // console.log(notificationMessage);
        // console.log("Notification create", lognotification);
    } catch (error) {
        console.error("Error adding view to article:", error);
    }
};


// await sendEmail(
//     user.email, 
//     `ถึง ${user.username} แจ้งเตือนรายได้จากผู้ใช้ที่อ่านเรื่อง ${article.title}`, 
//     emailHtmlAddViewsArticle(user.username, user.earnings.toFixed(2), article.urlslug, article.title)
// );
// console.log(`อีเมลถูกส่งไปยัง ${user.email}`);

// ============================= get SINGLE POST
// GET : /api/posts 
const getRead = async (req, res, next) => {
    const { urlslug } = req.params;
    const lang = res.locals.lang;
    const userID = req.session.userlogin; // Ensure user ID is correctly extracted
    const usertoken = req.session.userlogin?.user?._id; // Ensure user ID is correctly extracted

    try {
        // Fetch the article and populate the creator field
        const post = await Article.findOne({ urlslug }).populate('creator.id').exec();
        const recentUpdates = await Article.find().sort({ createdAt: -1 }).limit(4).populate('creator.id').exec();

        const currentDate = new Date();
        const banners = await Banner.find({ expiryDate: { $gt: currentDate } });


        if (!post) {
            return res.status(404).json({
                status: 404,
                error: 'ไม่พบบทความหรือบทความอาจจะถูกลบแล้ว',
            })
        }

        if (userID) {
            await User.findByIdAndUpdate(usertoken, {
                $push: {
                    interactions: {
                        contentId: post._id,
                        viewedAt: new Date(),
                        liked: post.likes.length > 0,
                        watchedDuration: post.views || 0
                    }
                }
            });
        }

        const lastRead = req.cookies[`lastRead_${post._id}`];
        const now = new Date();

        if (!lastRead || (now - new Date(lastRead)) >= 10 * 60 * 1000) {
            post.views = (post.views || 0) + 1;
            addViewToArticle(post._id, post.creator.id);
            await post.save("ครีเอตเอร์บทความ", post.creator.id);

            res.cookie(`lastRead_${post._id}`, now.toISOString(), { maxAge: 10 * 60 * 1000, httpOnly: true });
        }

        let isSaved = false;
        if (userID && post.savearticles) {
            isSaved = post.savearticles.includes(userID.toString());
        }

        let content = post.content;

        // Function สำหรับสร้าง HTML ของโฆษณา
        function createAdBanner() {
            return `
    <div class="ad-banner bg-white rounded-lg shadow-lg my-6 mx-auto mb-6 p-4 mt-6 w-full max-w-[728px]">
        <p class="text-center text-sm text-gray-500 mb-2">ได้รับการสนับสนุน</p>
        <ins class="adsbygoogle"
            style="display:block; text-align:center;"
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client="ca-pub-6579807593228261"
            data-full-width-responsive="true"
            data-ad-slot="5850425226"></ins>
        <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
    </div>
  `;
        }


        // จำกัดจำนวนโฆษณาสูงสุด
        const maxAds = 3;
        let adCount = 0;

        // แบ่งเนื้อหาเป็นอาร์เรย์ตามแท็ก <p>
        let contentArray = content.split('</p>');

        // แทรกโฆษณาทุกๆ 3 ย่อหน้าโดยจำกัดจำนวนที่ 3
        let adFrequency = 3;
        for (let i = adFrequency; i < contentArray.length && adCount < maxAds; i += adFrequency + 1) {
            contentArray.splice(i, 0, createAdBanner());
            adCount++;
        }

        // รวมเนื้อหากลับเป็น HTML
        let newContent = contentArray.join('</p>');

        function stripHtmlTags(html) {
            // ลบแท็ก HTML ทั้งหมด
            let text = html.replace(/<[^>]*>?/gm, '');

            // ลบอักขระพิเศษ HTML เช่น &nbsp; &amp; ฯลฯ
            text = text.replace(/&nbsp;/g, ' '); // แทน &nbsp; ด้วยช่องว่าง
            text = text.replace(/&[a-zA-Z]+;/g, ''); // ลบอักขระพิเศษ HTML ที่เหลือ

            return text.trim(); // ตัดช่องว่างส่วนเกินที่หัวท้าย
        }
        const descriptionContent = stripHtmlTags(post.content);
        // console.log(descriptionContent)

        const baseURL = `${req.protocol}://${req.get('host')}`;
        const fullURL = `${baseURL}/read/${post.urlslug}`;

        res.render(`./th/read`, {
            active: "read",
            post,
            recentUpdates,
            userID,
            isSaved,
            Bannerlists: banners,
            translations: req.translations,
            lang,
            newContent: newContent,
            fullURL,
            descriptionContent
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            msg: errorMessage
        })
    }
};


// GET : API
const getReadAPI = async (req, res, next) => {
    const { urlslug } = req.params;
    const lang = res.locals.lang || 'default-lang';
    const userID = req.session.userlogin || null;

    try {
        // Fetch the post and populate the 'creator.id' field without password
        const post = await Article.findOne({ urlslug: urlslug })
            .populate({
                path: 'creator.id',
                select: '-password' // ไม่ให้แสดงฟิลด์ password
            })
            .select("-password")
            .exec();

        const recentUpdates = await Article.find()
            .sort({ createdAt: -1 })
            .limit(4)
            .populate({
                path: 'creator.id',
                select: '-password' // ไม่ให้แสดงฟิลด์ password
            })
            .select("-password")
            .exec();

        if (!post) {
            return res.status(404).json({
                post: { title: "ไม่พบข้อมูล" },
                error: 'ไม่พบบทความหรือบทความอาจจะถูกลบแล้ว',
                userID,
                translations: req.translations || {},
                lang
            });
        }

        post.views = (post.views || 0) + 1;
        await post.save();

        let isSaved = false;
        if (userID && userID.user && userID.user._id && post.savearticles) {
            isSaved = post.savearticles.includes(userID.user._id.toString());
        }

        res.json({ post, recentUpdates, userID, isSaved, translations: req.translations || {}, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            translations: req.translations || {},
            lang
        });
    }
};


const saveArticle = async (req, res) => {
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


// const likeArticle = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { articleId } = req.body;

//         if (!userId) {
//             return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
//         }

//         if (!articleId) {
//             return res.status(400).json({ success: false, message: 'ไม่พบ ID ของบทความ' });
//         }

//         const article = await Article.findById(articleId);

//         if (!article) {
//             return res.status(404).json({ success: false, message: 'ไม่พบบทความ' });
//         }

//         const hasLiked = article.likes.includes(userId);

//         if (hasLiked) {
//             article.likes = article.likes.filter(like => !like.equals(userId));
//             await article.save(); 
//             return res.status(200).json({ success: true, message: 'ลบไลค์บทความแล้ว' });
//         } else {
//             article.likes.push(userId);
//             await article.save();
//             return res.status(200).json({ success: true, message: 'เพิ่มไลค์บทความแล้ว' });
//         }

//     } catch (error) {
//         const errorMessage = error.message || 'Internal Server Error';
//         return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: errorMessage });
//     }
// }

const LikeArticle = async (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.id;

    try {
        const article = await Article.findById(articleId);

        // ตรวจสอบว่าผู้ใช้กดไลค์บทความนี้หรือยัง
        if (article.likes.includes(userId)) {
            // หากเคยกดแล้ว ให้ลบไลค์ออก
            article.likes.pull(userId);
        } else {
            // หากยังไม่เคยกด ให้เพิ่มไลค์
            article.likes.push(userId);
        }

        await article.save();
        res.json({ success: true, likesCount: article.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error liking article' });
    }
}

const updateAdsDisplayed = async (articleId) => {
    try {
        await Article.findByIdAndUpdate(articleId, { $inc: { adsDisplayed: 1 } });
    } catch (error) {
        console.error('Error updating adsDisplayed:', error);
    }
};

// อัปเดตเวลาการอ่านบทความ
const updateReadTime = async (req, res) => {
    const { id } = req.params; // รับ id จาก URL
    const { readAt } = req.body; // รับ readAt จาก body

    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // เพิ่มประวัติการอ่าน
        article.readHistory.push({ userId: req.user?.id || 'guest', readAt });
        await article.save();

        res.status(200).json({ message: 'Read time updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    getRead,
    saveArticle,
    LikeArticle,
    updateAdsDisplayed,
    getReadAPI,
    updateReadTime
}