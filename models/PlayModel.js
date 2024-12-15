const mongoose = require("../config/db");

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // ผู้รายงาน
    reason: { type: String, required: false }, // เหตุผลที่รายงาน
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }, // สถานะของรายงาน
    createdAt: { type: Date, default: Date.now } // วันที่รายงาน
});

const EpisodesSchema = new mongoose.Schema({
    videoid: { type: String, unique: true },
    title: { type: String, required: true },
    episodenumber: { type: String, required: false },
    videoUrl: { type: String, required: true },
    quality: [{
        quality144p: {
            label: {
                type: String,
                required: false,
                default: "144p"
            },
            quality: {
                type: String,
                required: false
            }
        },
        quality240p: {
            label: {
                type: String,
                required: false,
                default: "240p"
            },
            quality: {
                type: String,
                required: false
            }
        },
        quality360p: {
            label: {
                type: String,
                required: false,
                default: "360p"
            },
            quality: {
                type: String,
                required: false
            }
        },
        quality480p: {
            label: {
                type: String,
                required: false,
                default: "480p"
            },
            quality: {
                type: String,
                required: false
            }
        },
        quality720p: {
            label: {
                type: String,
                required: false,
                default: "720p"
            },
            quality: {
                type: String,
                required: false
            }
        },
        quality1080p: {
            label: {
                type: String,
                required: false,
                default: "1080p"
            },
            quality: {
                type: String,
                required: false
            }
        },
    }],
    subtitles: [{
        th: {
            label: {
                type: String,
                default: 'TH'
            },
            fileurl: {
                type: String,
            }
        }
    }],
    reports: [ReportSchema],
    published: { type: Boolean, default: false },
}, { timestamps: true });

const PlaySchema = new mongoose.Schema({
    videoid: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    poster: { type: String, required: false },
    thumbnail: { type: String, required: false },
    genres: { type: String, required: false },
    categories: { type: String, required: false },
    episodes: [EpisodesSchema],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    published: { type: Boolean, default: false },
}, { timestamps: true });

const Play = mongoose.model('Play', PlaySchema);

module.exports = Play;
