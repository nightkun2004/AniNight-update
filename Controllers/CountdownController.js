
const getCountdown = async (req,res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        res.render("./th/Countdown", {
            userID,
            lang
        })
    } catch (error) {
        res.json({error: error})
    }
}

module.exports = {
    getCountdown
}