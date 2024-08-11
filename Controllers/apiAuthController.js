const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
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
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // ส่งข้อมูลที่จำเป็นกลับไปที่ Client
        res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ', token, user: { id, username, role, profilePicture } });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const APIauthProfile = async (req, res) => {
    const userID = req.paraw

    try {
        const user = await User.findById(userID.user._id).select('-password'); // ไม่รวม field password
        if (!user) {
            return res.status(404).json( { error: 'ไม่พบผู้ใช้นี้ในระบบ' });
        }
        res.json( {
            user,
            userID,
            message: "โหลดโปรไฟล์เรียบร้อยแล้ว"
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).json( {
            error: errorMessage,
            userID
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
module.exports = {
    APIauthLogin,
    APIauthProfile,
    getPosts
};
