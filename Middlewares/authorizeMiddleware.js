const authorizeRole = (...role) => {
    return (req, res, next) => {
        if (req.session.userlogin && req.session.userlogin.user && role.includes(req.session.userlogin.user.role)) {
            next();
        } else {
            res.status(403).render('./errors/role/403', { message: '|| หากคุณต้องการสร้างบทความคุณต้องขอสิทธิ์อนุมัติบัญชีเป็น Content Creator' });
        }
    };
};


const authorizeRoleAdmin = (...roles) => {
    return (req, res, next) => {
        // ตรวจสอบว่าเข้าผ่าน subdomain หรือ path /admin
        const isAdminPath = req.originalUrl.startsWith('/admin') || req.hostname.startsWith('admin.');
        
        // ดึงข้อมูล role จาก session และคุกกี้
        const sessionRole = req.session.userlogin && req.session.userlogin.user && req.session.userlogin.user.role;
        const cookieRole = req.cookies.token;

        // ตรวจสอบ role จาก session หรือจากคุกกี้
        const hasValidRole = roles.includes(sessionRole) || roles.includes(cookieRole);

        if (isAdminPath && hasValidRole) {
            next();
        } else {
            res.status(403).render('./errors/admin/403', { message: 'คุณไม่ได้รับอนุญาตให้เข้าหน้านี้' });
        }
    };
};




module.exports = {authorizeRole, authorizeRoleAdmin};