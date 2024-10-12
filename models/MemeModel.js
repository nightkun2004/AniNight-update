const mongoose = require('../config/db');

// Comment Schema
const replySchema = new mongoose.Schema({
    username: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String, // ชื่อผู้ใช้
    },
    repliestext: String,
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    report: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

// Comment Schema
const commentSchema = new mongoose.Schema({
    username: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        profilePicture: String
    },
    repliestext: String,
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    report: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    replies: [replySchema] // ใช้ replySchema สำหรับตอบกลับความคิดเห็น
}, { timestamps: true });

// Meme Schema
const memeSchema = new mongoose.Schema({
    description: String,
    memeimageUrl: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    published: {
        type: Boolean,
        default: false
    },
    adsDisplayed: { type: Number, default: 0 }
}, { timestamps: true });

const Meme = mongoose.model('Meme', memeSchema);

module.exports = Meme;
