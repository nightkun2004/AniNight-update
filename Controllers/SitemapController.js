

const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")


const getIndexSitemap = async (req,res) => {
    try {
       
    
        res.setHeader('Content-Type', 'application/xml');
        res.render('./th/sitemap');
    } catch (error) {
        res.status(500).json({ error: "Server Error 500", msg: error})
    }
}



const getAnimeSitemap = async (req,res) => {
    try {
        const animes = await Anime.find().sort({ createdAt: 'desc' });
    
        res.setHeader('Content-Type', 'application/xml');
        res.render('./th/pages/siiiitemaps/animes', {
          animes
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error 500", msg: error})
    }
}


const getArticlesSitemap = async (req,res) => {
    try {
        const articles = await Article.find().sort({ createdAt: 'desc' });
    
        res.setHeader('Content-Type', 'application/xml');
        res.render('./th/pages/siiiitemaps/articles', {
            articles
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error 500", msg: error})
    }
}



module.exports = {
    getIndexSitemap,
    getAnimeSitemap,
    getArticlesSitemap
}