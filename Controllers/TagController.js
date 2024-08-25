const User = require("../models/UserModel");
const Anime = require("../models/AnimeModel");
const Article = require("../models/ArticleModel");

const getTags = async (req, res) => {
    const lang = req.params.lang || 'th'; 
    const tagname = req.params.tagname;
    const userID = req.session.userlogin || null;
    
    try {
        const tags = await Article.find({ tags: tagname }).populate('creator.id');
        res.render("./pages/tags/index", { 
            active: "tags", 
            userID, 
            translations: req.translations,
            lang, 
            tags, 
            tagname 
        });
        
    } catch (error) {
        console.error("Error in getTags:", error);
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/tags/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang  
        });
    }
}

module.exports = {
    getTags
}
