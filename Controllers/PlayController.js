

const getPlay = async (req,res) => {
    const { videoid } = req.params;
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render(`./th/play`, { userID,lang  });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/play`, {
            error: errorMessage,
            userID, 
            translations: req.translations,lang  
        });
    }
}

module.exports = {
    getPlay
}