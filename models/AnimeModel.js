const mongoose = require("../config/db");

const AnimeSchema = new mongoose.Schema({
    title: String,
    synopsis: {
        type: String
    },
    animetype: {
        type: String,
        enum: ["ญี่ปุ่น", "จีน"]
    },
    season: {
        type: String,
        enum: ["Spring", "Summer", "Fall", "Winter"]
    },
    poster: String,
    categories: [{
        type: String,
        enum: ["อนิเมะ", "มังงะ", "ชีวิตประจำวัน", "sci-fi", "นิยาย", "ผจญภัย", "โมเอะ"]
    }],
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
        type: Number,
        enum: [2025, 2024, 2023]
    },
    month: {
        type: String,
        enum: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
    },
    year: Number,
    status: {
        type: Boolean,
        required: true
    },
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
        username: String
    }
}, { timestamps: true });

const Anime = mongoose.model("Anime", AnimeSchema);

module.exports = Anime;