

const Term = async (req,res) => {
    const userID = req.session.userlogin;
    const lang = req.params.lang || 'th'; 
    try {
        res.render("term", {
            userID,
            lang ,
            translations: req.translations, 
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('index', {
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