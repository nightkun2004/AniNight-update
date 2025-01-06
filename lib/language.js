function setLanguage(req, res, next) {
    // ตรวจสอบภาษาใน URL, Header, หรือใช้ค่าเริ่มต้นเป็น 'en'
    const lang = req.params.lang || req.headers['accept-language'] || 'en';

    // ตรวจสอบและตั้งค่าภาษาตามที่รองรับ (th, en, jp)
    const supportedLanguages = ['th', 'en', 'jp'];
    const selectedLang = supportedLanguages.find((supportedLang) =>
        lang.includes(supportedLang)
    ) || 'en'; // ถ้าไม่พบภาษา ให้ตั้งเป็น 'en' (ค่าเริ่มต้น)

    // ตั้งค่าภาษาใน req และ res.locals
    req.language = selectedLang;
    res.locals.lang = selectedLang;

    next();
}

module.exports = setLanguage;
