const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Play = require("../models/PlayModel")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const crypto = require("crypto");
const fs = require("fs");

// POST: /api/v3/auth/login
const APIauthLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // ตรวจสอบว่าข้อมูลที่ส่งมาครบถ้วนหรือไม่
        if (!email || !password) {
            return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ครบถ้วน' });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
        if (!user) {
            return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' });
        }

        // ตรวจสอบความถูกต้องของรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // สร้าง JWT token
        const { _id: id, username, role, profilePicture } = user;
        const token = jwt.sign({ id, username, role, profilePicture }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // ส่ง token ใน HTTP header
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // ใช้ secure ใน production เท่านั้น
            sameSite: 'Strict',  // ป้องกัน CSRF
            maxAge: 24 * 60 * 60 * 1000  // 1 วัน
        });

        // ส่งข้อมูลที่จำเป็นกลับไปที่ Client
        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            id: user._id,
            user: {
                id,
                username,
                role,
                profilePicture
            }
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const APIauthProfile = async (req, res) => {
    const { userID } = req.query

    try {
        const user = await User.findById(userID).select('-password'); // ไม่รวม field password
        if (!user) {
            return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' });
        }
        res.json({
            user,
            message: "โหลดโปรไฟล์เรียบร้อยแล้ว"
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).json({
            error: errorMessage,
        });
    }
};

// ============================= get SINGLE POST
// GET : /api/posts
const getPosts = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Find the post by the 'urlslug'
        const posts = await User.findById(id).select('-password').populate('articles').exec()
        // Return the found post
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error.message || 'เกิดข้อผิดพลาดในการค้นหาโพสต์', 500));
    }
}

const getArticle = async (req, res) => {
    const postId = req.params.update_id;
    try {
        const searcharticle = await Article.findById(postId).exec();
        res.json(searcharticle)
    } catch (error) {
        res.json(error)
    }
}


// ================================= POST API Edit Article ===================================
const EditPostArticle = async (req, res, next) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const postId = req.params.update_id;
        let { title, tags, categories, published, urlslug } = req.body;

        const searcharticle = await Article.findById(postId).exec();

        if (!searcharticle) {
            return res.status(404).json({ error: "Post not found.", userID, translations: req.translations, lang });
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
                return res.status(400).json({ error: `Image size exceeds 5MB limit`, translations: req.translations, lang, userID, article: searcharticle });
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
                return res.status(500).json({ error: `Error uploading new thumbnail: ${err}`, userID, translations: req.translations, lang, article: searcharticle });
            }
        }

        const updatedPost = await Article.findByIdAndUpdate(postId, updateData, { new: true });

        if (!updatedPost) {
            return res.status(400).json({ error: "Couldn't update post.", userID, translations: req.translations, lang, article: searcharticle });
        }

        res.status(200).json({ message: `อัปเดตสำเร็จ`, userID, translations: req.translations, lang, article: updatedPost });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            article: updatedPost,
            translations: req.translations, lang
        });
    }
};

const getPlay = async (req, res) => {
    const { videoid } = req.params;
    try {
        const play = await Play.findById(videoid).populate('Episodes');
        if (!play) {
            return res.status(404).json({ error: 'Video not found.' });
        }
        res.json({
            videoUrl: play.videoUrl,
            episodes: play.Episodes.map(ep => ({
                id: ep._id,
                name: ep.namepv,
                videoUrl: ep.videoUrl
            }))
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ error: errorMessage });
    }
};

const getPlayEpisodes = async (req, res) => {
    const { videoid, episodeid } = req.params;
    try {
        const play = await Play.findById(videoid).populate('Episodes');
        if (!play) {
            return res.status(404).json({ error: 'Video not found.' });
        }

        const episode = play.Episodes.id(episodeid);
        if (!episode) {
            return res.status(404).json({ error: 'Episode not found.' });
        }

        res.json({
            videoUrl: play.videoUrl,
            episode: {
                id: episode._id,
                name: episode.namepv,
                videoUrl: episode.videoUrl
            }
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ error: errorMessage });
    }
};

module.exports = {
    APIauthLogin,
    APIauthProfile,
    getPosts,
    getArticle,
    EditPostArticle,
    getPlay,
    getPlayEpisodes
};
