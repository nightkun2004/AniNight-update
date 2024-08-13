const User = require("../models/UserModel");
const Anime = require("../models/AnimeModel")

const getAnime = async (req, res) => {
    const userID = req.session.userlogin;
    const { adminName, adminEmail, adminRole } = req.body;
    try {


        res.render("./pages/admin/add/anime", {userID})
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/add/anime', {
            error: errorMessage,
            userID
        });
    }
}

module.exports = {
    getAnime
}