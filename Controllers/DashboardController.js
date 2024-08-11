const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const getDashboard = async (req, res) => {
    const userID = req.session.userlogin;
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + 29); // 29 days from today
    const daysLeft = Math.max(Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)), 0); // Calculate days left

    try {
        const userDatas = await User.findById(req.user.id).populate('articles').exec();
        const publishedArticlesCount = userDatas.articles.filter(article => article.published).length;
        res.render("./pages/dashboard/index", { userID, userDatas, daysLeft, publishedArticlesCount });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/dashboard/index', {
            error: errorMessage,
            userID
        });
    }
};

// GET: /api/v2/edit/post/article
const Getedit = async (req, res) => {
    const userID = req.session.userlogin;
    const articleID = req.query.articleid;
    if (!articleID) {
        return res.status(400).render('./errors/error', {
            error: 'Article ID is required',
            userID
        });
    }
    try {
        const article = await Article.findById(articleID).exec();
        if (!article) {
            return res.status(404).render('./errors/error', {
                error: 'Article not found',
                userID
            });
        }
        // console.log(article)
        res.render("./pages/dashboard/edits/article", { userID, article });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/dashboard/edits/article', {
            error: errorMessage,
            userID
        });
    }
}


// POST: /api/v2/edit/post/article/:id
const EditPostArticle = async (req, res, next) => {
    const userID = req.session.userlogin;
    try {
        const postId = req.body.update_id;
        let { title, tags, content, categories, published, urlslug } = req.body;

        const searcharticle = await Article.findById(postId).exec();

        if (!searcharticle) {
            return res.status(404).render('./pages/dashboard/edits/article', { error: "Post not found.", userID });
        }

        if (!title || !content) {
            return res.status(400).render('./pages/dashboard/edits/article', { error: "Title and content are required.", userID, article: searcharticle });
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
                return res.status(400).render('./pages/dashboard/edits/article', { error: `Image size exceeds 5MB limit`, userID, article: searcharticle });
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
                return res.status(500).render('./pages/dashboard/edits/article', { error: `Error uploading new thumbnail: ${err}`, userID, article: searcharticle });
            }
        }

        const updatedPost = await Article.findByIdAndUpdate(postId, updateData, { new: true });

        if (!updatedPost) {
            return res.status(400).render('./pages/dashboard/edits/article', { error: "Couldn't update post.", userID, article: searcharticle });
        }

        res.status(200).render('./pages/dashboard/edits/article', { message: `อัปเดตสำเร็จ`, userID, article: updatedPost });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/dashboard/edits/article', {
            error: errorMessage,
            userID,
            article: updatedPost
        });
    }
};



module.exports = {
    getDashboard,
    Getedit,
    EditPostArticle
}