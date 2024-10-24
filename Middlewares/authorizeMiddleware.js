const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (req.session.userlogin && req.session.userlogin.user && roles.includes(req.session.userlogin.user.role)) {
            next();
        } else {
            res.status(403).render('./errors/role/403', { 
                message: '|| หากคุณต้องการสร้างบทความคุณต้องขอสิทธิ์อนุมัติบัญชีเป็น Content Creator' 
            });
        }
    };
};


const authhorizeRoleAdmin = (...roles) => {
    return (req, res, next) => {
        if (req.session.userlogin && req.session.userlogin.user && roles.includes(req.session.userlogin.user.role)) {
            next();
        } else {
            res.status(403).render('./errors/admin/403', { message: 'คุณไม่ได้รับอนุญาตให้เข้าหน้านี้' });
        }
    };
}



module.exports = {authorizeRole, authhorizeRoleAdmin};