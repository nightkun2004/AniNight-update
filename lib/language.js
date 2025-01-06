const geoip = require('geoip-lite');

function setLanguage(req, res, next) {
    // รับค่า `Accept-Language` จาก header
    const browserLang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'th';

    // รับค่า `header-lang` หรือ path (/th, /en, /jp)
    let lang = req.headers['header-lang'] || req.path.split('/')[1];

    // ดึงข้อมูลจาก IP
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);

    // ถ้ารู้จักประเทศจาก IP
    if (geo && geo.country) {
        switch (geo.country) {
            case 'TH':
                lang = 'th';
                break;
            case 'US':
                lang = 'en';
                break;
            case 'JP':
                lang = 'jp';
                break;
            case 'LA':
                lang = 'Laos';
                break;
            default:
                lang = browserLang;
                break;
        }
    }

    // ตรวจสอบว่า lang มีค่าถูกต้องหรือไม่ (th, en, jp, Laos)
    const supportedLanguages = ['th', 'en', 'jp', 'Laos'];
    if (!supportedLanguages.includes(lang)) {
        lang = supportedLanguages.includes(browserLang) ? browserLang : 'th'; // เลือกค่าภาษาของเบราว์เซอร์หากรองรับ
    }

    // กำหนดค่า res.locals.lang
    res.locals.lang = lang;
    next();
}

module.exports = setLanguage;
