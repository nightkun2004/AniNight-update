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
    const {userID } = req.query

    try {
        const user = await User.findById(userID).select('-password'); // ไม่รวม field password
        if (!user) {
            return res.status(404).json( { error: 'ไม่พบผู้ใช้นี้ในระบบ' });
        }
        res.json( {
            user,
            message: "โหลดโปรไฟล์เรียบร้อยแล้ว"
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).json( {
            error: errorMessage,
        });
    }
}; 

// ============================= get SINGLE POST
// GET : /api/posts
const getPosts = async (req,res, next) =>{
    const { id } = req.params;
    try {
        // Find the post by the 'urlslug'
        const posts = await User.findById(id).populate('articles').exec()
        // Return the found post
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error.message || 'เกิดข้อผิดพลาดในการค้นหาโพสต์', 500));
    }
}

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
    getPlay,
    getPlayEpisodes
};
