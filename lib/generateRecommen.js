const User = require("../models/UserModel")
const Article = require("../models/ArticleModel")
const fs = require("fs");
const path = require("path");

function recommendArticles(user_id) {
    // โหลดข้อมูลจาก JSON
    const dataPath = path.join(__dirname, "../data/user_article_data.json");
    const userData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    // ค้นหาข้อมูลผู้ใช้
    const user = userData.find(user => user.user_id === user_id);
    if (!user) return []; // หากไม่พบข้อมูลผู้ใช้

    // โค้ดสำหรับประมวลผลคำแนะนำจากโมเดล AI
    // ตัวอย่างที่ใช้ข้อมูลที่อ่านมา
    const recommendations = []; // คำแนะนำจะถูกเก็บใน array นี้

    // สมมติว่าการประมวลผลคำแนะนำเกิดขึ้นที่นี่

    return recommendations;
}


module.exports = {
    recommendArticles
}