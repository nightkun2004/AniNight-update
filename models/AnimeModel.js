const mongoose = require("../config/db");

const youtubeSchema = new mongoose.Schema({
    muse: String,
    anione: String,
    pops: String,
}, { timestamps: true });

const StreamSchema = new mongoose.Schema({
    crunchyroll: String,
    bilibili: String,
    iqiyi: String,
    youtubes: [youtubeSchema]
}, { timestamps: true });


const actorSchema = new mongoose.Schema({
    name: String,
    role: String,
    imageUrl: String
}, { timestamps: true })

const charactersSchema = new mongoose.Schema({
    name: String,
    role: String,
    imageUrl: String,
    actor: [actorSchema]
}, { timestamps: true })

const AnimeSchema = new mongoose.Schema({
    title: {
        en: { type: String, required: false },
        jp: { type: String, required: false },
        th: { type: String, required: false }
    },
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
    banner: String,
    studio: String,
    Source: String,
    Licensors: String,
    website: String,
    episodes: {
        current: { type: Number, default: 0 }, // จำนวนตอนที่ฉายไปแล้ว
        total: { type: Number, default: 0 }   // จำนวนตอนทั้งหมด (ถ้าทราบ)
    },
    schedule: {
        day: {type: String,required: false },
        date: { type: Date, required: false },
        time: {type: String,required: false }
    },
    Duration: Number,
    categories: [{
        type: String,
        enum: ["อนิเมะ", "มังงะ", "ชีวิตประจำวัน", "sci-fi", "นิยาย", "ผจญภัย", "โมเอะ"]
    }],
    genres: [{
        type: String,
        enum: ['Anime', 'Action', 'Comedy', 'Drama', 'Romance', 'Sci-Fi', 'Adventure', 'Horror', 'Fantasy', 'Music'],
        required: true
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
    characters: [charactersSchema],
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