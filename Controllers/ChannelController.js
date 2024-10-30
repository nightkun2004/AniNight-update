
const User = require("../models/UserModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const path = require("path")
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const crypto = require("crypto")
const fs = require("fs")


const getChannel = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const username = req.params.username;
    const page = parseInt(req.params.page) || 1;
    const limit = 25; 
    
    try {
       
        const channelUser = await User.findOne({username: username}).populate('articles').exec()
        res.render("./th/pages/channels/index", {
            userID,
            active: "channel",
            channel: channelUser,
            translations: req.translations,lang  
        });
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render('./th/pages/channels/index', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}; 

const getFollow = async (req, res) => {
    const { userId } = req.params;
    try {
        const channelId = req.params.channelId; // ดึง channelId ของครีเอเตอร์
        const userId = req.user.id; // ดึง userId ของผู้ติดตาม

        // หา channel ที่ต้องการติดตาม
        const channel = await User.findById(channelId);
        // หา user ผู้ติดตาม
        const user = await User.findById(userId);

        // ตรวจสอบว่า user นี้ยังไม่ได้ติดตาม channel นี้
        if (!channel.followers.includes(userId)) {
            // เพิ่ม userId ของผู้ติดตามใน followers ของ channel
            channel.followers.push(userId);
            await channel.save();

            // เพิ่ม channelId ใน following ของ user ผู้ติดตาม
            user.following.push(channelId);
            await user.save();

            return res.json({ success: true, message: 'ติดตามแล้ว' });
        }

        res.json({ success: false, message: 'คุณได้ติดตามแล้ว' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
};

const getUnfollow = async (req, res) => {
    try {
        const channelId = req.params.channelId; // ดึง channelId ของครีเอเตอร์
        const userId = req.user.id; // ดึง userId ของผู้ติดตาม

        // หา channel ที่ต้องการยกเลิกติดตาม
        const channel = await User.findById(channelId);
        // หา user ผู้ติดตาม
        const user = await User.findById(userId);

        const followerIndex = channel.followers.indexOf(userId);
        const followingIndex = user.following.indexOf(channelId);

        if (followerIndex > -1) {
            // ลบ userId ของผู้ติดตามออกจาก followers ของ channel
            channel.followers.splice(followerIndex, 1);
            await channel.save();
        }

        if (followingIndex > -1) {
            // ลบ channelId ออกจาก following ของ user ผู้ติดตาม
            user.following.splice(followingIndex, 1);
            await user.save();
        }

        return res.json({ success: true, message: 'ยกเลิกติดตามแล้ว' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
};



module.exports = {
    getChannel,
    getFollow,
    getUnfollow
}