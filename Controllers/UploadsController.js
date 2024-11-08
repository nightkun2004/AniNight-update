const Article = require("../models/ArticleModel")
const User = require("../models/UserModel")
const crypto = require("crypto")
const path = require("path")
const fs = require("fs")
const sharp = require('sharp');

// ==================== CREATE Article POST
// POST /api/v2/post/article/create

// อัปโหลดภาพประกอบ
// let imageUrls = [];
// if (Array.isArray(images)) {
//     for (let image of images) {
//         let newFilename = generateFilename(image);
//         let uploadPath = path.join(__dirname, '..', 'public/uploads/articlesImages', newFilename);
//         await image.mv(uploadPath);
//         imageUrls.push(`${newFilename}`);
//     }
// } else {
//     let newFilename = generateFilename(images);
//     let uploadPath = path.join(__dirname, '..', 'public/uploads/articlesImages', newFilename);
//     await images.mv(uploadPath);
//     imageUrls.push(`${newFilename}`);
// }


// if (!images || images.length === 0) {
//     return res.status(404).json( {msg: "ไม่พบรูปภาพประกอบ", userID, translations: req.translations,lang  })
// }

const CreateArticle = async (req, res, next) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    try {
        const { title, tags, content, categories, urlslug, scheduledAt } = req.body;
        const { thumbnail } = req.files;
        // console.log(thumbnail);

        if (!thumbnail) {
            return res.status(400).json({ msg: "ไม่พบรูปภาพ", userID, translations: req.translations, lang });
        }

        const tagsArray = tags ? tags.split('#').map(tag => tag.trim()).filter(tag => tag) : [];

        const generateFilename = (file) => {
            let splittedFilename = file.name.split('.');
            return splittedFilename[0] + crypto.randomUUID() + '.webp'; // เปลี่ยนเป็น .webp
        };

        let postId = crypto.randomUUID();

        // แปลงภาพเป็น WebP ก่อนอัปโหลด
        let thumbnailFilename = generateFilename(thumbnail);
        let thumbnailUploadPath = path.join(__dirname, '..', 'public/uploads/thumbnails', thumbnailFilename);

        // ใช้ sharp แปลงไฟล์เป็น WebP
        await sharp(thumbnail.data)  // ใช้ .data แทน .tempFilePath
            .webp({ quality: 80 })
            .toFile(thumbnailUploadPath);

        const useridnew = await User.findById(req.user.id);
        if (!useridnew) {
            return res.status(404).json({ msg: "ไม่พบผู้ใช้", userID, translations: req.translations, lang });
        }

        const postcreate = {
            title: title,
            content: content,
            categories: Array.isArray(categories) ? categories : [categories],
            tags: tagsArray,
            thumbnail: `${thumbnailFilename}`,
            urlslug: urlslug || postId,
            published: req.body.published === 'on' && !scheduledAt,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,  // กำหนดเวลาการโพสต์
            creator: {
                id: useridnew._id,
                username: useridnew.username,
                profilePicture: useridnew.profilePicture
            },
            createdAt: Date.now()
        };

        const Articlesave = new Article(postcreate);
        await Articlesave.save();
        console.log(Articlesave);
        await User.findByIdAndUpdate(req.user.id, { $push: { articles: Articlesave._id } }, { new: true });

        res.json({ status: 'ok', Articlesave, msg: "ทำการสร้างโพสต์สำเร็จ", userID, translations: req.translations, lang });
    } catch (error) {
        console.error('Error creating article:', error); // เพิ่มบรรทัดนี้เพื่อติดตามข้อผิดพลาด
        res.status(500).json({
            userID,
            msg: error.message || 'เกิดข้อผิดพลาดในการสร้างบทความ',
            translations: req.translations,
            lang
        });
    }
};



module.exports = {
    CreateArticle
}