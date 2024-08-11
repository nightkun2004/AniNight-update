const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const { getRecommendations } = require("../lib/generateRecommen")

const getRecommen = async (req,res) => {
    const userID = req.session.userlogin;
    const datas = [
        {
            title: "Error",
            thum: "https:mage"
        },
        {
            title: "Error",
            thum: "https:mage"
        },
    ]
    try {
        const recommendations = await getRecommendations(userID) || datas;
        res.render('./pages/recommendations', { recommendations, userID });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/recommendations', {
            error: errorMessage,
            userID
        });
    }
}

module.exports = {
    getRecommen
}