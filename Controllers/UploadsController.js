const Article = require("../models/ArticleModel")
const User = require("../models/UserModel")
const crypto = require("crypto")
const path = require("path")
const axios = require('axios');
const fs = require("fs")
const sharp = require('sharp');
require("dotenv").config();

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
    const secretKey = process.env.GOOGLE_SECRET_KEY_CAPTCHA;
    try {
        const { title, tags, content, categories, urlslug, scheduledAt, 'g-recaptcha-response': recaptchaRespons  } = req.body;
        const { thumbnail } = req.files;

        // ตรวจสอบว่ามีไฟล์ thumbnail หรือไม่
        if (!thumbnail) {
            return res.status(400).json({ error: "ไม่พบรูปภาพ" });
        }

        // ตรวจสอบการทำงานของ Google reCAPTCHA
        const recaptchaVerification = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: secretKey,
                response: recaptchaRespons,
            }
        });

        // หากการตรวจสอบไม่ผ่าน
        if (!recaptchaVerification.data.success) {
            return res.status(400).json({ error: "การตรวจสอบแคปซ่าล้มเหลว กรุณาลองใหม่อีกครั้ง" });
        }

        // ตรวจสอบว่า urlslug ซ้ำหรือไม่
        const existingSlug = await Article.findOne({ urlslug });
        if (existingSlug) {
            return res.status(400).json({ error: "URL นี้มีการใช้งานแล้ว กรุณาเลือก URL อื่น" });
        }

        const tagsArray = tags ? tags.split('#').map(tag => tag.trim()).filter(tag => tag) : [];

        const generateFilename = (file) => {
            let splittedFilename = file.name.split('.');
            return splittedFilename[0] + crypto.randomUUID() + '.webp'; // เพิ่มการคืนค่าชื่อไฟล์ที่ถูกต้อง
        };

        let postId = crypto.randomUUID();

        // แปลงภาพเป็น WebP ก่อนอัปโหลด
        let thumbnailFilename = generateFilename(thumbnail);
        let thumbnailUploadPath = path.join(__dirname, '..', 'public/uploads/thumbnails', thumbnailFilename);

        // ใช้ sharp แปลงไฟล์เป็น WebP
        await sharp(thumbnail.data)
            .webp({ quality: 80 })
            .toFile(thumbnailUploadPath);

        // ตรวจสอบผู้ใช้ก่อน
        const useridnew = await User.findById(req.user.id);
        if (!useridnew) {
            return res.status(404).json({ error: "ไม่พบผู้ใช้" });
        }

        const postcreate = {
            title: title,
            content: content,
            categories: Array.isArray(categories) ? categories : [categories],
            tags: tagsArray,
            thumbnail: `${thumbnailFilename}`,
            urlslug: urlslug || postId,
            published: req.body.published === 'on' && !scheduledAt,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
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

        res.json({ status: 'ok', Articlesave, success: "ทำการสร้างโพสต์สำเร็จ" });
    } catch (error) {
        console.error('Error creating article:', error);
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