const Article = require("../models/ArticleModel")


const getSearch = async (req,res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin || null;
    try {
        const query = req.query.q || '';
        const searchResults = await Article.find({
            title: { $regex: query, $options: 'i' } // ค้นหาชื่อที่ตรงกับคำค้นหาแบบไม่สนตัวอักษรพิมพ์เล็กใหญ่
        });

        res.render('./th/search', { userID,lang, query, searchResults });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
}


const getSearchJson = async (req,res) => {
    const query = req.query.q;
    try {
        const searchResults = await Article.find({
            title: { $regex: query, $options: 'i' }
        }).limit(10); // จำกัดผลลัพธ์ 10 รายการ

        res.json({ results: searchResults });
    } catch (error) {
        res.status(500).json({ error: "Error fetching search results" });
    }
}


module.exports = {
    getSearch,
    getSearchJson
}