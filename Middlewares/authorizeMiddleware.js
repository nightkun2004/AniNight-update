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
        
        if (isAdminPath && req.session.userlogin && req.session.userlogin.user && roles.includes(req.session.userlogin.user.role)) {
            next();
        } else {
            res.status(403).render('./errors/admin/403', { message: 'คุณไม่ได้รับอนุญาตให้เข้าหน้านี้' });
        }
    };
};



module.exports = {authorizeRole, authhorizeRoleAdmin};