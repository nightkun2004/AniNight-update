const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Notification = require("../models/NotificationModel");
const { sendEmail } = require("../transporter"); // นำเข้า transporter
require("dotenv").config();

const addViewToArticle = async (articleId, userId) => {
    try {
        const article = await Article.findById(articleId);
        const user = await User.findById(userId);

        if (!article || !user) return;

        // Increment article views and user's earnings
        article.views += 1;
        user.earnings += 0.40;

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

        // สร้าง HTML สำหรับอีเมล
        const emailHtml = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4A90E2;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
        }
        .content p {
            line-height: 1.6;
            color: #333333;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background-color: #f1f1f1;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>การแจ้งเตือนรายได้</h1>
        </div>
        <div class="content">
            <p>สวัสดี ${user.username},</p>
            <p>คุณผู้ใช้ <strong>${user.username}</strong> ได้รับรายได้ <strong>${user.earnings.toFixed(2)}</strong> บาทจากบทความ <strong>${article.title}</strong>.</p>
            <p>ขอบคุณที่เป็นส่วนหนึ่งของเรา!</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Ani-Night. สงวนสิทธิ์.</p>
        </div>
    </div>
</body>
</html>
`;

        await sendEmail(user.email, 'แจ้งเตือนรายได้จากบทความ', emailHtml);
        console.log(`อีเมลถูกส่งไปยัง ${user.email}`);

        // บันทึกการเปลี่ยนแปลง
        await Promise.all([article.save(), user.save()]);
        console.log("ผู้ใช้ได้ทั้งหมด", user.earnings);
        console.log(notificationMessage);
        console.log("Notification create", lognotification);
    } catch (error) {
        console.error("Error adding view to article:", error);
    }
};


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

        if (!post) {
            return res.status(404).render(`${lang}/read`, {
                post: { title: "ไม่พบข้อมูล" },
                error: 'ไม่พบบทความหรือบทความอาจจะถูกลบแล้ว',
                userID,
                translations: req.translations,
                lang
            });
        }

        // Save user interaction if logged in
        if (userID) {
            // console.log("ผู้ใช้เข้าสู่ระบบ", usertoken);

            // Log the interaction with the correct contentId
            const saveinteraction = await User.findByIdAndUpdate(usertoken, {
                $push: {
                    interactions: {
                        contentId: post._id, // Correctly using post._id
                        viewedAt: new Date(),
                        liked: post.likes.length > 0, // Checks if there are any likes
                        watchedDuration: post.views || 0
                    }
                }
            });

            // console.log("บันทึกสิ่งที่น่าสนใน", saveinteraction.interactions);

        }

        // Increment the view count
        post.views = (post.views || 0) + 1;
        addViewToArticle(post._id, post.creator.id);
        // console.log()
        await post.save("ครีเอตเอร์บทความ", post.creator.id);

        // Check if the post is saved by the user
        let isSaved = false;
        if (userID && post.savearticles) {
            isSaved = post.savearticles.includes(userID.toString());
        }

        // Render the read page with the post details
        res.render(`./th/read`, { active: "read", post, recentUpdates, userID, isSaved, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/read`, {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang
        });
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


module.exports = {
    getRead,
    saveArticle,
    LikeArticle,
    updateAdsDisplayed,
    getReadAPI
}