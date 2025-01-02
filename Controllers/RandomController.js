// const Anime = require("../Models/AnimeModel");

const getRandomAnimeLists = async (req, res, next) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render('./anime/pages/rendom/lists', {
            lang,
            userID,
            active: 'random'
        })
    } catch (err) {
        res.render('./anime/error/505', {
            error: err.message || 'Internal Server Error',
            userID,
            lang
        })
    }
}


const getRandomAnimeWinter = async (req, res, next) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render('./anime/pages/rendom/senson/winter', {
            lang,
            userID,
            active: 'random'
        })
    } catch (err) {
        res.render('./anime/error/505', {
            error: err.message || 'Internal Server Error',
            userID,
            lang
        })
    }
}

module.exports = {
    getRandomAnimeLists,
    getRandomAnimeWinter
}