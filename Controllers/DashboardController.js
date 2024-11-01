const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Payment = require("../models/PaymentModel")
const Notification = require("../models/NotificationModel");
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const FormData = require('form-data');
const axios = require('axios');

const getDashboard = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + 29); // 29 days from today
    const daysLeft = Math.max(Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)), 0); // Calculate days left

    try {
        const userDatas = await User.findById(req.user.id).populate({
            path: 'articles',
            options: { sort: { createdAt: -1 } }
        }).exec();
        const publishedArticlesCount = userDatas.articles.filter(article => article.published).length;
        res.render("./th/pages/dashboard/index", { userID, userDatas, daysLeft, publishedArticlesCount, translations: req.translations,lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/dashboard/index', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
};

const getDashboardManageArticle = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + 29); // 29 days from today
    const daysLeft = Math.max(Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)), 0); // Calculate days left

    try {
        const userDatas = await User.findById(req.user.id).populate({
            path: 'articles',
            options: { sort: { createdAt: -1 } }
        }).exec();
        const publishedArticlesCount = userDatas.articles.filter(article => article.published).length;
        res.render("./th/pages/dashboard/manage/article", { userID, userDatas, daysLeft, publishedArticlesCount, translations: req.translations,lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/dashboard/manage/article', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
};

const getNotifications = async (req, res) => {
    const userID = req.session.userlogin; // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่
    try {
        const userId = req.params.id; // รับ userID จาก parameters
        const user = await User.findById(userId); // แก้ไขเป็น userId

        // ตรวจสอบว่าผู้ใช้มีอยู่ในฐานข้อมูลหรือไม่
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ดึงรายการแจ้งเตือนทั้งหมดที่เกี่ยวข้องกับผู้ใช้
        const notifications = await Notification.find({ ownerId: userId }).sort({ createdAt: -1 }); // ใช้ ownerId
        // console.log(notifications); 

        // เรนเดอร์หน้า EJS พร้อมข้อมูลแจ้งเตือน
        res.render('th/pages/notification/notifications', { notifications, user, userID });
    } catch (error) {
        console.error('Error retrieving notifications:', error); // เพิ่มการล็อกข้อผิดพลาด
        res.render('th/pages/notification/notifications', { notifications: [], userID, err: 'Error retrieving notifications', error });
    }
};




const getNotificationisRead = async (req, res) => {
    const userID = req.session.userlogin;
    try {
        const notification = await Notification.findById(req.params.notificationId);

        // ตรวจสอบว่าการแจ้งเตือนและผู้ใช้มีอยู่จริง
        if (!notification) {
            return res.status(404).render("th/pages/notification/notifications",{ userID, message: 'Notification not found' });
        }

        // ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
        notification.isRead = true;
        await notification.save();

        // ส่งกลับข้อความที่เหมาะสม
        res.redirect(`/notifications/${userID.user._id}`);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};


// GET: /api/v2/edit/post/article
const Getedit = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const articleID = req.query.articleid;
    if (!articleID) {
        return res.status(400).render('./errors/error', {
            error: 'Article ID is required',
            userID,
            translations: req.translations,lang  
        });
    }
    try {
        const article = await Article.findById(articleID).exec();
        if (!article) {
            return res.status(404).render('./errors/error', {
                error: 'Article not found',
                userID,
                translations: req.translations,lang  
            });
        }
        // console.log(article)
        res.render("./th/pages/dashboard/edits/article", { userID, article, translations: req.translations,lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/dashboard/edits/article', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}


// =========================================================== GET Reward ================================================
// =======================================================================================================================
const GetRewardCode = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { rewardId } = req.query;
    try {
        console.log(rewardId)
        res.render("./th/pages/dashboard/Getreward", { userID, rewardId, lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.json({ message: "Server Error Internal Server Error", errorMessage})
    }
}


// =========================================================== Router Playment manage =====================================
// ========================================================================================================================
const gatManagePlayment = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    try {
        const rewards = await Payment.find().lean();
        res.render("./th/pages/admin/manage/manage_playment", { 
            userID, 
            rewards,
            translations: req.translations,
            lang   
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/manage/manage_playment', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}


// =========================================================== Router Playment manage =====================================
// ========================================================================================================================
const gatPlaymentEdit = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const rewardId = req.query.rewardId; 

    try {
        const reward = await Payment.findById(req.params.id).lean();
        
        console.log(reward)
        res.render("./th/pages/admin/edit/playment/index", { 
            userID, 
            reward,
            rewardId,
            translations: req.translations,
            lang   
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/edit/playment/index', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}

// 
// if (req.files && req.files.thumbnail) {
           
//     if (thumbnail.size > 5000000) {
//         return res.status(400).json({ msg: `Image size exceeds 5MB limit`, translations: req.translations, lang, userID, article: searcharticle });
//     }

//     const fileName = thumbnail.name;
//     const splittedFilename = fileName.split('.');
//     const newFilename = crypto.randomUUID() + "." + splittedFilename[splittedFilename.length - 1];
//     const newThumbnailPath = path.join(__dirname, '..', 'public/uploads/thumbnails', newFilename);

//     try {
//         await thumbnail.mv(newThumbnailPath); 
//         updateData.thumbnail = newFilename;

//         // Delete old thumbnail if exists
//         if (searcharticle.thumbnail) {
//             const oldThumbnailPath = path.join(__dirname, '..', 'public/uploads/thumbnails', searcharticle.thumbnail);
//             fs.unlink(oldThumbnailPath, (err) => {
//                 if (err) console.error("Error deleting old thumbnail:", err);
//             });
//         }
//     } catch (err) {
//         return res.status(500).json({ msg: `Error uploading new thumbnail: ${err}`, userID, translations: req.translations, lang, article: searcharticle });
//     }
// }

// POST: /api/v2/edit/post/article/:id
const EditPostArticle = async (req, res, next) => { 
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const template = lang === 'th_TH' ? './th/pages/dashboard/edits/article' : './th/pages/dashboard/edits/article';
    try {
        const postId = req.body.update_id;
        const { title, tags, content, categories, published, urlslug } = req.body; 
        const thumbnail = req.files?.thumbnail; // รูปภาพใหม่ที่อัปโหลด (ถ้ามี)

        const tagsArray = tags ? tags.split(' ').map(tag => tag.replace('#', '').trim()).filter(tag => tag) : [];

        const validCategories = ["อาหาร", "การท่องเที่ยว", "ข่าวสาร", "การ์ตูน", "เพลง", "บันเทิง", "อนิเมะ"];
        let selectedCategories = Array.isArray(categories) ? categories : [categories];
        selectedCategories = selectedCategories.filter(cat => validCategories.includes(cat));

        const isPublished = published === 'on' || published === true;

        let updateData = { title, tags: tagsArray, content, categories: selectedCategories, published: isPublished, urlslug };

        // เช็คว่ามีไฟล์อัปโหลดใหม่หรือไม่
        if (thumbnail) {
            // สร้าง FormData สำหรับการอัปโหลดไฟล์
            const formData = new FormData();
            formData.append('file', thumbnail.data, thumbnail.name);

            // อัปโหลดไฟล์ไปยังเซิร์ฟเวอร์
            const response = await axios.post('https://sv7.ani-night.online/api/v2/upload/post/article', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });

            // ตรวจสอบการตอบกลับจากการอัปโหลด
            if (response && response.data) {
                const imageUrl = response.data.url;
                if (!imageUrl) {
                    return res.status(400).json({ msg: "Image URL not returned from upload.", userID, translations: req.translations, lang });
                }
                updateData.thumbnail = imageUrl;
            } else {
                return res.status(400).json({ msg: "No response or data from upload.", userID, translations: req.translations, lang });
            }
        } else {
            // ถ้าไม่มีการอัปโหลดภาพใหม่ ให้ใช้ภาพเดิม
            const existingPost = await Article.findById(postId);
            if (!existingPost) {
                return res.status(400).json({ msg: "Post not found.", userID, translations: req.translations, lang });
            }
            updateData.thumbnail = existingPost.thumbnail; // ใช้ภาพเดิม
        }

        // อัปเดตโพสต์ในฐานข้อมูล
        const updatedPost = await Article.findByIdAndUpdate(postId, updateData, { new: true });
        if (!updatedPost) {
            return res.status(400).json({ msg: "Couldn't update post.", userID, translations: req.translations, lang });
        }

        res.status(200).json({ status: 'ok', msg: `อัปเดตสำเร็จ`, userID, translations: req.translations, lang, article: updatedPost });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        console.log("Error Response:", error.response ? error.response.data : errorMessage);
        res.status(500).json({
            msg: errorMessage,
            userID,
            article: null,
            translations: req.translations,
            lang  
        });
    }
};



// ============================= DELETE Post
// GET : /api/v2/post/article/delete/:id
const deletePostArticle = async (req, res, next) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + 29); // 29 days from today
    const daysLeft = Math.max(Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)), 0); // Calculate days left
    
    try {
        const postId = req.params.id;
        console.log("Received postId:", postId); 

        const userDatas = await User.findById(req.user.id).populate('articles').exec();
        const publishedArticlesCount = userDatas.articles.filter(article => article.published).length;

        // ค้นหาโพสต์
        const post = await Article.findById(postId);
        if (!post) {
            return res.status(404).render("./th/pages/dashboard/index", {
                error: "เราไม่พบโพสต์บทความของคุณ",
                userID,
                userDatas,
                daysLeft,
                publishedArticlesCount,
                translations: req.translations,lang  
            });
        }

        console.log("Post found, continuing with delete...");

        const thumbnailFileName = post.thumbnail;
        const imagesFileNames = post.imagesarticle;

        // ลบไฟล์
        const deletePromises = [];

        if (thumbnailFileName) {
            deletePromises.push(
                fs.unlink(path.join(__dirname, '..', 'public/uploads/thumbnails', thumbnailFileName))
            );
        }

        if (Array.isArray(imagesFileNames)) {
            imagesFileNames.forEach((fileName) => {
                deletePromises.push(
                    fs.unlink(path.join(__dirname, '..', 'public/uploads/articlesImages', fileName))
                );
            });
        }

        // รอให้การลบไฟล์ทั้งหมดเสร็จสิ้น
        await Promise.all(deletePromises);

        // ลบโพสต์
        await Article.findByIdAndDelete(postId);

        // ลบ ID ของบทความจาก User โมเดล
        await User.updateMany(
            { articles: postId },
            { $pull: { articles: postId } }
        );

        res.status(200).render("./th/pages/dashboard/index", {
            message: `ทำการลบโพสต์ที่มีไอดี ${postId} เสร็จแล้ว`,
            userID,
            userDatas,
            daysLeft,
            publishedArticlesCount,
            translations: req.translations,lang  
        });

    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render("./th/pages/dashboard/index", {
            userID,
            error: errorMessage,
            userDatas,
            daysLeft,
            publishedArticlesCount,
            translations: req.translations,lang  
        });
    }
};


module.exports = {
    getDashboard,
    getDashboardManageArticle,
    getNotifications,
    getNotificationisRead,
    Getedit,
    GetRewardCode,
    gatManagePlayment,
    gatPlaymentEdit,
    EditPostArticle,
    deletePostArticle
}