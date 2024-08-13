const mongoose = require("../config/db");

const AnimeSchema = new mongoose.Schema({
    title: String,
    synopsis: {
        type: String
    },
    image: String,
    categories: [{
        type: String,
        enum: ["อนิเมะ", "มังงะ", "ชีวิตประจำวัน", "sci-fi", "นิยาย", "ผจญภัย", "โมเอะ"]
    }],
    style: String,
    voice: {
        type: String,
        enum: ["พากย์ไทย", "พากย์ญี่ปุ่น"]
    },
    price: {
        type: String,
        enum: ["free", "premium"]
    },
    platforms: {
        type: String,
        enum: ["bilibili", "iqiyi", "crunchyroll"]
    },
    year: {
        type: String,
        enum: ["2025", "2024", "2023"]
    },
    year: Number,
    status: String,
    urlslug: {
        type: String,
        required: true,
        unique: true
    },
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        profilePicture: String
    }
}, { timestamps: true });

const Anime = mongoose.model("Anime", AnimeSchema);

module.exports = Anime;