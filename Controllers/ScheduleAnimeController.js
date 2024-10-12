const User = require("../models/UserModel");
const Anime = require("../models/AnimeModel")

const getAnimeInfo = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { urlslug } = req.params;
    try {
        const anime = await Anime.findOne({ urlslug }).exec();
        if (!anime) {
            return res.status(404).render(`/th/pages/schedulePages/info`, {
                error: 'Anime not found',
                userID
            });
        }
        res.render(`./th/pages/schedulePages/info`, { userID, anime, active: "ScheduleAnime", translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/schedulePages/info`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang,
            active: "ScheduleAnime",
        });
    }
}

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
        res.render(`./th/pages/schedulePages/streaming/index`, { userID, anime,active: "ScheduleAnime", translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/schedulePages/streaming/index`, {
            error: errorMessage,
            userID,active: "ScheduleAnime",
            translations: req.translations, lang
        });
    }
}

const getAnimeSesstionNext = async (req, res) => {
    const { year, month, season } = req.query;
    try {
        const animes = await Anime.find({ year: year, month: month, season: season }).sort({ createdAt: -1 }).exec();
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
        res.json({ msg: "ดึงข้อมูล Anime Stream แล้ว",userID, anime, translations: req.translations, lang });
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
    const { year,season } = req.query;
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

module.exports = { getAnimeInfo, getAnimeStream, getAnimeSesstionNext, getSchedule, getScheduleInfo, getAnimeStreamAPI, getAnimeWinterAPI }