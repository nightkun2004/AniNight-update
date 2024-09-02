
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
    try {
       
        const channelUser = await User.findOne({username: username}).populate('articles').exec()
        res.render("./th/pages/channels/index", {
            userID,
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
    const currentUserId = req.user.id; // สมมุติว่าคุณมีการตรวจสอบสิทธิ์ผู้ใช้

    try {
        const userToFollow = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentUser.following.includes(userId)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        currentUser.following.push(userId);
        await currentUser.save();

        res.status(200).json({ message: 'Followed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUnfollow = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id; // สมมุติว่าคุณมีการตรวจสอบสิทธิ์ผู้ใช้

    try {
        const userToUnfollow = await User.findById(userId);
        const currentUser = await User.findById(currentUserId);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.following.includes(userId)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
        await currentUser.save();

        res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    getChannel,
    getFollow,
    getUnfollow
}