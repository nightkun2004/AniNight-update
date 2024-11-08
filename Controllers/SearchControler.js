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


module.exports = {
    getSearch
}