

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
        res.status(500).json({ msg: errorMessage })
    }
}


const getPrivacyPolicy = async (req,res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        res.render("./th/PrivacyPolicy", {
            userID,
            lang ,
            translations: req.translations, 
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ msg: errorMessage })
    }
}

const getTermsService = async (req,res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        res.render("./th/TermsService", {
            userID,
            lang ,
            translations: req.translations, 
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ msg: errorMessage })
    }
}

module.exports = {
    Term,
    getPrivacyPolicy,
    getTermsService
}