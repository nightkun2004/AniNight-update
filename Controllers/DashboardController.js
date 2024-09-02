const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Payment = require("../models/PaymentModel")
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const getDashboard = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + 29); // 29 days from today
    const daysLeft = Math.max(Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)), 0); // Calculate days left

    try {
        const userDatas = await User.findById(req.user.id).populate('articles').exec();
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


// POST: /api/v2/edit/post/article/:id
const EditPostArticle = async (req, res, next) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const postId = req.body.update_id;
        let { title, tags, content, categories, published, urlslug } = req.body;

        const searcharticle = await Article.findById(postId).exec();

        if (!searcharticle) {
            return res.status(404).render('./th/pages/dashboard/edits/article', { error: "Post not found.", userID, translations: req.translations,lang   });
        }

        if (!title || !content) {
            return res.status(400).render('./th/pages/dashboard/edits/article', { error: "Title and content are required.", userID, translations: req.translations,lang  , article: searcharticle });
        }

        const tagsArray = tags ? tags.split(' ').map(tag => tag.replace('#', '').trim()).filter(tag => tag) : [];

        const validCategories = ["อาหาร", "การท่องเที่ยว", "ข่าวสาร", "การ์ตูน", "เพลง", "บันเทิง", "อนิเมะ"];
        categories = Array.isArray(categories) ? categories : [categories];
        categories = categories.filter(cat => validCategories.includes(cat));

        published = published === 'on' || published === true;

        let updateData = { title, tags: tagsArray, content, categories, published, urlslug };

        if (req.files && req.files.thumbnail) {
            const { thumbnail } = req.files;
            if (thumbnail.size > 5000000) {
                return res.status(400).render('./th/pages/dashboard/edits/article', { error: `Image size exceeds 5MB limit`, translations: req.translations,lang  , userID, article: searcharticle });
            }

            const fileName = thumbnail.name;
            const splittedFilename = fileName.split('.');
            const newFilename = crypto.randomUUID() + "." + splittedFilename[splittedFilename.length - 1];
            const newThumbnailPath = path.join(__dirname, '..', 'public/uploads/thumbnails', newFilename);

            try {
                await thumbnail.mv(newThumbnailPath);
                updateData.thumbnail = newFilename;

                // Delete old thumbnail if exists
                if (searcharticle.thumbnail) {
                    const oldThumbnailPath = path.join(__dirname, '..', 'public/uploads/thumbnails', searcharticle.thumbnail);
                    fs.unlink(oldThumbnailPath, (err) => {
                        if (err) console.error("Error deleting old thumbnail:", err);
                    });
                }
            } catch (err) {
                return res.status(500).render('./th/pages/dashboard/edits/article', { error: `Error uploading new thumbnail: ${err}`, userID, translations: req.translations,lang  , article: searcharticle });
            }
        }

        const updatedPost = await Article.findByIdAndUpdate(postId, updateData, { new: true });

        if (!updatedPost) {
            return res.status(400).render('./th/pages/dashboard/edits/article', { error: "Couldn't update post.", userID, translations: req.translations,lang  , article: searcharticle });
        }

        res.status(200).render('./th/pages/dashboard/edits/article', { message: `อัปเดตสำเร็จ`, userID, translations: req.translations,lang  , article: updatedPost });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/dashboard/edits/article', {
            error: errorMessage,
            userID,
            article: updatedPost,
            translations: req.translations,lang  
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
    Getedit,
    gatManagePlayment,
    gatPlaymentEdit,
    EditPostArticle,
    deletePostArticle
}