const User = require("../models/UserModel");
const Anime = require("../models/AnimeModel")

const getAnimeInfo = async (req, res) => {
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
        res.render("./pages/schedulePages/info", { userID, anime });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/schedulePages/info', {
            error: errorMessage,
            userID
        });
    }
}

// ============================================== Stream ====================================================
// ==========================================================================================================
const getAnimeStream = async (req, res) => {
    const userID = req.session.userlogin;
    const { urlslug } = req.params; // ดึงค่า urlslug จาก req.params
    try {
        const anime = await Anime.findOne({ urlslug }).exec(); // ค้นหาข้อมูลโดยใช้ urlslug
        if (!anime) {
            return res.status(404).render('./pages/schedulePages/streaming/index', {
                error: 'Anime not found',
                userID
            });
        }
        res.render("./pages/schedulePages/streaming/index", { userID, anime });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/schedulePages/streaming/index', {
            error: errorMessage,
            userID
        });
    }
}


module.exports = { getAnimeInfo, getAnimeStream }