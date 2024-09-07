const mongoose = require("../config/db")


const EpisodesSchema = new mongoose.Schema({
    namepv: { type: String, required: true },  // ชื่อตอน
    decpv: { type: String },  // คำอธิบายตอน
    videoUrl: { type: String, required: true },  // ลิงก์วิดีโอของตอน
    published: { type: Boolean, default: false },  // เผยแพร่ตอนหรือไม่
}, { timestamps: true });


const PlaySchema = new mongoose.Schema({
    namepv: String,
    decpv: String,
    videoUrl: String,
    Episodes: [EpisodesSchema],
    audiothai: String,
    likes: {
        type: Number,
        default: 0
    },
    likedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    published: { type: Boolean, default: false },
}, { timestamps: true });

const Play = mongoose.model('Play', PlaySchema);

module.exports = Play;
