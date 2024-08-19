const mongoose = require("../config/db");

const StreamSchema = new mongoose.Schema({
    crunchyroll: String,
    bilibili: String,
    iqiyi: String,
}, { timestamps: true });

const AnimeSchema = new mongoose.Schema({
    type: String,
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
    studio: String,
    Source: String,
    Licensors: String,
    website: String,
    Episodes: Number,
    Duration: Number,
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
    platforms: [{
        type: String,
        enum: ["bilibili", "iqiyi", "crunchyroll"]
    }],
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
    published: {
        type: Boolean,
        required: false
    },
    streaming: [StreamSchema],
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