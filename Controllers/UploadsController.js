const Article = require("../models/ArticleModel")
const User = require("../models/UserModel")
const crypto = require("crypto")
const path = require("path")
const fs = require("fs")
const { generateFilename } = require("../lib/generateFilename")

// ==================== CREATE Article POST
// POST /api/v2/post/article/create
const CreateArticle = async (req, res, next) => {
    const userID = req.session.userlogin;
    try {
        const { title, tags, content, categories } = req.body;
        const { thumbnail, images } = req.files;

        if (!thumbnail) {
            return res.status(404).render("./pages/uploads/createarticle", {message: "ไม่พบรูปภาพ", userID})
        }

        if (!images || images.length === 0) {
            return res.status(404).render("./pages/uploads/createarticle", {message: "ไม่พบรูปภาพประกอบ", userID})
        }

        const tagsArray = tags ? tags.split('#').map(tag => tag.trim()).filter(tag => tag) : [];

        let postId = crypto.randomUUID();

        // อัปโหลดภาพปก
        let thumbnailFilename = generateFilename(thumbnail);
        let thumbnailUploadPath = path.join(__dirname, '..', 'public/uploads/thumbnails', thumbnailFilename);
        await thumbnail.mv(thumbnailUploadPath);

        // อัปโหลดภาพประกอบ
        let imageUrls = [];
        if (Array.isArray(images)) {
            for (let image of images) {
                let newFilename = generateFilename(image);
                let uploadPath = path.join(__dirname, '..', 'public/uploads/articlesImages', newFilename);
                await image.mv(uploadPath);
                imageUrls.push(`${newFilename}`);
            }
        } else {
            let newFilename = generateFilename(images);
            let uploadPath = path.join(__dirname, '..', 'public/uploads/articlesImages', newFilename);
            await images.mv(uploadPath);
            imageUrls.push(`${newFilename}`);
        }


        const useridnew = await User.findById(req.user.id)

        const postcreate = {
            title: title,
            content: content,
            categories: Array.isArray(categories) ? categories : [categories],
            tags: tagsArray,
            thumbnail: `${thumbnailFilename}`, // ภาพ thumbnail
            imagesarticle: imageUrls, // ภาพประกอบหลายไฟล์
            urlslug: postId,
            published: req.body.published === 'on',
            creator: {
                id: useridnew._id,
                username: useridnew.username,
                profilePicture: useridnew.profilePicture
            },
            createdAt: Date.now()
        };

        const Articlesave = new Article(postcreate);
        await Articlesave.save();
        await User.findByIdAndUpdate(req.user.id, { $push: { articles: Articlesave._id } }, { new: true });
        console.log(Articlesave)
        res.status(200).render("./pages/uploads/createarticle", {message: "ทำการสร้างโพสต์สำเร็จ", userID, Articlesave})
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render("./pages/uploads/createarticle", {
            userID,
            error: errorMessage
        });
    }
}


module.exports = {
    CreateArticle
}