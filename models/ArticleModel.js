const mongoose = require("../config/db");

const ReplySchema = new mongoose.Schema({
    username: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
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
    replies: [this]
}, { timestamps: true });

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    categories: [{
        type: String,
    }],
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        profilePicture: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    imagesarticle: {
        type: [String],
    }, 
    views: { type: Number, default: 0 },
    urlslug: {
        type: String
    },
    replies: [ReplySchema],
    tags: {
        type: [String], 
        required: true
    },
    published: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    scheduledAt: { type: Date, default: null },
    adsDisplayed: { type: Number, default: 0 }
}, { timestamps: true });

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
