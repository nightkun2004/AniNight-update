const User = require("../models/UserModel");
const Anime = require("../models/AnimeModel")

const getAnimeInfo = async (req, res) => {
    const lang = req.params.lang || 'th'; 
    const userID = req.session.userlogin;
    const { urlslug } = req.params; // ดึงค่า urlslug จาก req.params
    try {
        const anime = await Anime.findOne({ urlslug }).exec(); // ค้นหาข้อมูลโดยใช้ urlslug
        if (!anime) {
            return res.status(404).render('./pages/schedulePages/info', {
                error: 'Anime not found',
                userID
            });
        }
        res.render("./pages/schedulePages/info", { userID, anime, translations: req.translations,lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/schedulePages/info', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}

// ============================================== Stream ====================================================
// ==========================================================================================================
const getAnimeStream = async (req, res) => {
    const lang = req.params.lang || 'th'; 
    const userID = req.session.userlogin;
    const { urlslug } = req.params; // ดึงค่า urlslug จาก req.params
    try {
        const anime = await Anime.findOne({ urlslug }).exec(); // ค้นหาข้อมูลโดยใช้ urlslug
        if (!anime) {
            return res.status(404).render('./pages/schedulePages/streaming/index', {
                error: 'Anime not found',
                userID,
                translations: req.translations,lang  
            });
        }
        res.render("./pages/schedulePages/streaming/index", { userID, anime, translations: req.translations,lang   });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/schedulePages/streaming/index', {
            error: errorMessage,
            userID,
            translations: req.translations,lang  
        });
    }
}

const getAnimeSesstionNext = async (req, res) => {
    const { year, month, season } = req.query;
    try {
        const animes = await Anime.find({ year: year, month: month, season: season }).sort({createdAt: -1 }).limit(5).exec();
        if (animes.length === 0) {
            return res.status(404).json({ message: "No anime found" });
        }
        res.status(200).json({ animes });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ errorMessage });
    }
};



module.exports = { getAnimeInfo, getAnimeStream, getAnimeSesstionNext }