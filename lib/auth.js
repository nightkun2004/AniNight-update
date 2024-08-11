const checkAuth = (req, res, next) => {
    const userID = req.session.userlogin;
    // console.log("authcheck", userID)
    if (!userID || !userID.user.username) {
        return res.redirect('/auth/login');
    }
    next();
};

module.exports = {
    checkAuth
};
