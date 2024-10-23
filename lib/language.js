function setLanguage(req, res, next) {
    const lang = req.params.lang || req.headers['accept-language'] || 'en';  // ถ้าไม่ได้ระบุภาษาใน query parameter ให้ใช้ภาษาจาก Header Accept-Language หรือถ้าไม่มีให้ใช้เป็นอังกฤษ
    const selectedLang = lang.includes('th') ? 'th_TH' : 'en_EN';  // เปลี่ยนให้เป็น 'th_TH' หรือ 'en_EN'
    req.language = selectedLang;  // ตั้งค่าภาษาตามที่ผู้ใช้เลือก
    res.locals.lang = selectedLang;  // เก็บภาษาใน res.locals เพื่อให้สามารถเข้าถึงได้จาก template
    next();
}

module.exports = setLanguage;
