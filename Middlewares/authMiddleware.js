const jwt = require("jsonwebtoken");
const HttpError = require("../models/ErrorModel");

const authMiddleware = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader && authorizationHeader.startsWith("Bearer")
        ? authorizationHeader.split(' ')[1]
        : req.cookies ? req.cookies.token : null;


    if (!token) {
        return res.status(401).render("./errors/401")
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).render("./errors/403")
        }

        req.user = decoded;
        next();
    });
};

const authMiddlewareAPI = (req, res, next) => {
    // ดึง token จาก Authorization header หรือ cookies
    const token = req.headers['x-api-key'] || req.cookies ? req.cookies.token : null;

    // ถ้าไม่มี token ให้ตอบกลับ 401 Unauthorized
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    // ตรวจสอบ token โดยใช้ jwt.verify
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Token ไม่ถูกต้องหรือหมดอายุ ให้ตอบกลับ 403 Forbidden
            return res.status(403).json({ error: 'Forbidden access' });
        }

        // เก็บข้อมูลผู้ใช้ใน request object เพื่อใช้ใน route handlers ถัดไป
        req.user = decoded;
        next();
    });
};

// เก็บ URL ของหน้าปัจจุบันไว้ใน session
const ensureAuthenticated = (req, res, next) => {
    if (req.session.userlogin) {
      return next();
    }
    req.session.returnTo = req.originalUrl; // เก็บ URL ของหน้าปัจจุบันใน session
    res.redirect('/login'); // รีไดเร็คไปยังหน้าเข้าสู่ระบบ
  };

module.exports = { authMiddleware, authMiddlewareAPI, ensureAuthenticated };
