

const Term = async (req,res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        res.render("./th/term", {
            userID,
            lang ,
            translations: req.translations, 
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/index', {
            error: errorMessage,
            userID,
            lang ,
            translations: req.translations, 
        });
    }
}

module.exports = {
    Term
}