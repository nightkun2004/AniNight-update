const User = require("../models/UserModel");
const Schedule = require("../models/SchedulesModel")
const Anime = require("../models/AnimeModel")
const axios = require('axios');
const moment = require('moment-timezone');
moment.locale('th');

// const updateEpisodes = async () => {
//     try {
//         // ค้นหาทุก Anime ที่มีข้อมูลในรูปแบบของ Episodes ที่เป็น Number
//         const animesToUpdate = await Anime.find({ "episodes": { $type: "number" } });

//         for (let anime of animesToUpdate) {
//             // อัปเดต Episodes ให้เป็น object ที่มี current และ total
//             const updatedEpisodes = {
//                 current: anime.episodes, // ใช้ค่าที่มีอยู่ใน Episodes
//                 total: 0 // ตั้งค่า total เป็น 0 หรือค่าเริ่มต้นที่คุณต้องการ
//             };

//             // อัปเดตข้อมูลในฐานข้อมูล
//             await Anime.findByIdAndUpdate(anime._id, { episodes: updatedEpisodes });

//             console.log(`Updated Anime with ID: ${anime._id}`);
//         }

//         console.log("Episodes update complete");
//     } catch (error) {
//         console.error("Error updating Episodes:", error);
//     }
// };

// updateEpisodes();

// const converttitleAnime = async () => {
//     const animes = await Anime.find();
//     console.log(`Total records found: ${animes.length}`);

//     const bulkOps = animes.map(anime => {
//         // console.log(`Checking title:`, anime.title);
//             console.log(`Updating title: ${anime.title}`);
//             return {
//                 updateOne: {
//                     filter: { _id: anime._id },
//                     update: { $set: { title: { en: anime.title, jp: '', th: '' } } }
//                 }
//             };
//         return null;
//     }).filter(Boolean); // กรอง null ออก

//     if (bulkOps.length > 0) {
//         await Anime.bulkWrite(bulkOps);
//         console.log(`Bulk migration complete. Updated ${bulkOps.length} records.`);
//     } else {
//         console.log('No records to migrate');
//     }
// };

// converttitleAnime().catch(err => {
//     console.error('Error during migration:', err);
// });

const getAnimeInfo = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { urlslug } = req.params;
    try {
        const anime = await Anime.findOne({ urlslug }).populate('comments.username').exec();
        if (!anime) {
            return res.status(404).render(`./anime/error/404`, {
                error: 'Anime not found',
                urlslug,
                active: "error",
                userID
            });
        }
        // console.log(anime)
        res.render(`./anime/info`, { userID, anime, active: "getAnimeInfo", translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            translations: req.translations, lang,
            active: "ScheduleAnime",
        });
    }
}


const getAnimeSeason = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { year, season } = req.params;
    try {
        const animes = await Anime.find({ year, season }).sort({ createdAt: -1 }).exec();

        if (animes.length === 0) {
            return res.status(404).render(`./anime/error/404`, {
                error: 'Anime not found',
                year,
                season,
                active: "error",
                userID
            });
        }

        res.render(`./anime/season`, { userID, animes, year, season, active: "getAnimeSeason", translations: req.translations, lang });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            translations: req.translations, lang,
            active: "ScheduleAnime",
        });
    };
};

const getAnimeAnilist = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render(`./anime/Anilist/Animess`, { userID, active: "getAnimeAnilist", translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            translations: req.translations, lang,
            active: "ScheduleAnime",
        });
    }
}

const getAnilistAPI = async (req, res) => {
    try {
        const response = await axios.post('https://graphql.anilist.co/', req.body, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
}


const getAnimeScheduleTimeline = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    try {
        const schedules = await Schedule.find()
            .populate({
                path: 'animes.anime',
                model: 'Anime',
            })
            .exec();

        // ตรวจสอบข้อมูลที่ได้จากฐานข้อมูล
        // console.log('Schedules:', JSON.stringify(schedules, null, 2));

        const currentDate = moment().tz('Asia/Bangkok').format('DD/MM');

        res.render(`./anime/timeline`, {
            userID,
            schedule: schedules,
            currentDate,
            active: "ScheduleAnimeTimeline",
            translations: req.translations,
            lang,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};





// ============================================== Stream ====================================================
// ==========================================================================================================
const getAnimeStream = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { urlslug } = req.params; // ดึงค่า urlslug จาก req.params
    try {
        const anime = await Anime.findOne({ urlslug }).exec(); // ค้นหาข้อมูลโดยใช้ urlslug
        if (!anime) {
            return res.status(404).render(`./th/pages/schedulePages/streaming/index`, {
                error: 'Anime not found',
                userID,
                translations: req.translations, lang
            });
        }
        res.render(`./th/pages/schedulePages/streaming/index`, { userID, anime, active: "ScheduleAnime", translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/schedulePages/streaming/index`, {
            error: errorMessage,
            userID, active: "ScheduleAnime",
            translations: req.translations, lang
        });
    }
}

const getAnimeSesstionNext = async (req, res) => {
    const { year, month, season } = req.query;
    try {
        const animes = await Anime.find({ year: 2025, month: "ตุลาคม", season: "Fall" }).sort({ createdAt: -1 }).exec();
        if (animes.length === 0) {
            return res.status(404).json({ message: "No anime found" });
        }

        res.status(200).json({ animes });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ errorMessage });
    }
};


// ============================================= GET Animes API ========================================
const getSchedule = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        const Animelists = await Anime.find().sort({ createdAt: -1 }).exec();

        res.json({
            msg: "ข้อมูล ANIME",
            userID,
            Animelists,
            translations: req.translations,
            lang
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            lang
        })
    }
}


const getFilterAnime = async (req, res) => {
    const { year, season, format } = req.query;

    try {
        // ค้นหาข้อมูลจาก MongoDB ตามค่าที่ส่งมา
        const results = await Anime.find({
            year: parseInt(year),
            season: season,
            type: format
        });

        // ส่งข้อมูลไปยังหน้า EJS เพื่อนำไปแสดงผล
        res.json({ results });
    } catch (err) {
        res.status(500).send("Error retrieving data");
    }
}


//  ============================================= GET Anime info =========================================
const getScheduleInfo = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { urlslug } = req.params;
    try {
        const anime = await Anime.findOne({ urlslug }).exec();

        if (!anime) {
            return res.status(404).json({
                error: 'Anime not found',
                userID
            });
        }

        res.json({
            msg: "ข้อมูล ANIME",
            userID,
            anime,
            translations: req.translations,
            lang
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            lang
        })
    }
}







// ============================================= GET ANIME Stream ===========================================
const getAnimeStreamAPI = async (req, res) => {
    const lang = res.locals.lang;
    const { urlslug } = req.params;
    try {
        const anime = await Anime.findOne({ urlslug }).exec();
        if (!anime) {
            return res.status(404).json({
                error: 'Anime not found',
                userID,
                translations: req.translations, lang
            });
        }
        res.json({ msg: "ดึงข้อมูล Anime Stream แล้ว", userID, anime, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

// ============================================= GET ANIME Winter ===========================================
const getAnimeWinterAPI = async (req, res) => {
    const { year, season } = req.query;
    try {
        const animes = await Anime.find({ year: year, season: season }).sort({ createdAt: -1 }).exec();
        if (animes.length === 0) {
            return res.status(404).json({ message: "No anime found" });
        }
        res.status(200).json({ animes });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ errorMessage });
    }
}

module.exports = { getAnimeInfo, getFilterAnime, getAnimeAnilist, getAnimeSeason, getAnilistAPI, getAnimeScheduleTimeline, getAnimeStream, getAnimeSesstionNext, getSchedule, getScheduleInfo, getAnimeStreamAPI, getAnimeWinterAPI }