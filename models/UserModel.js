const mongoose = require("../config/db")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; 
        }
    },
    bank: {
        truemoneywallet: {
            name: String,
            truemoneynumber: String 
        },
        bankaccount: {
            name: String, // ชื่อบัญชีธนาคาร
            number: String, // เลขบัญชีธนาคาร
            bankname: String // ชื่อธนาคาร
        }
    },
    // serverUrl: {
    //     type: String,
    //     enum: ["ani-night.online", "sv1.ani-night.online", "sv2.ani-night.online"],
    //     default: "api.ani-night.online"
    // },
    profilePicture: {
        type: String
    },
    bannerImagePath: {
        type: String
    },
    bio: {
        type: String
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    points: {
        type: Number,
        default: 0 
    },
    isFollowing: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "content_creator", "partners", "admin", "moderator"],
        default: "user"
    },
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
    interactions: [
        {
            contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
            viewedAt: Date,
            liked: Boolean,
            watchedDuration: Number, // กำหนดระยะเวลาที่รับชม (สำหรับเนื้อหาวิดีโอ)
        }
    ],
    Mememes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme'
    }],
    surveyadmin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SurveyAdmin'
    }],
    animelists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    }],
    savearticles: {
        type: [String]
    },
    saveanime: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    }],
    tokens: {
        type: Number,
        default: 500
    },
    earnings: {
        type: Number,
        default: 0 // ฟิลด์ใหม่สำหรับเก็บรายได้จากบทความ
    },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;