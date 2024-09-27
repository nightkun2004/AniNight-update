const User = require("../models/UserModel");
const Play = require("../models/PlayModel")
const ApiKey = require("../models/ApiKeyModel")
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")
const { v4: uuidv4 } = require('uuid');

const getAdmin = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { adminName, adminEmail, adminRole } = req.body;
    try {
        const query = {};
        if (adminName) query.username = { $regex: adminName, $options: 'i' };
        if (adminEmail) query.email = { $regex: adminEmail, $options: 'i' };
        if (adminRole) query.role = adminRole;


        const user = await User.findById(req.user.id).limit(100);
        const users = await User.find(query).limit(100);

        const admins = await User.find({ role: 'admin' });

        // console.log("admin", User)

        res.render("./th/pages/admin/index", { users, filters: { adminName, adminEmail, adminRole }, translations: req.translations, lang, admins, userID })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const getAdminAPIKEY = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {


        res.render("./th/pages/admin/add/generate-api-key", { userID, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/add/generate-api-key', {
            error: errorMessage,
            userID,
            lang
        });
    }
}

const generateAPIKEY = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    // console.log(userID)
    try {
        const { owner } = req.body;
        const apiKey = uuidv4();
        const newKey = new ApiKey({ key: apiKey, owner });
        await newKey.save();

        res.render("./th/pages/admin/add/generate-api-key", { message: 'API key generated', apiKey, userID, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/add/generate-api-key', {
            error: errorMessage,
            userID,
            lang
        });
    }
}

const ManageAnimes = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    try {
        const animelists = await Anime.find().exec();
        // console.log(animelists)
        res.render("./th/pages/admin/manage/manage_anime", { userID, animelists, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/manage/manage_anime', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const ManageActor = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    try {
        const animelists = await Anime.find().exec();
        // console.log(animelists)
        res.render("./th/pages/admin/manage/mana_actor", { userID, animelists, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/manage/mana_actor', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


const ManageVideos = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    try {
        const videolists = await Play.find().exec();
        res.render("./th/pages/admin/manage/mana_video", { userID, videolists, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/manage/mana_video', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const updateUserRole = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = req.params.lang || 'th';
    const { userIdToUpdate, newRole } = req.body;
    const { adminName, adminEmail, adminRole } = req.body;
    try {
        const query = {};
        if (adminName) query.username = { $regex: adminName, $options: 'i' };
        if (adminEmail) query.email = { $regex: adminEmail, $options: 'i' };
        if (adminRole) query.role = adminRole;


        const users = await User.find(query).limit(100);
        await User.findByIdAndUpdate(userIdToUpdate, { role: newRole });
        const admins = await User.find({ role: 'admin' });


        res.status(200).render("./th/pages/admin/index", { message: `ได้รับการเปลี่ยนแปลงแล้ว : ${newRole}`, admins, translations: req.translations, lang, users, userID })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/index', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const filterUsers = async (req, res) => {
    const { searchName } = req.body;

    try {
        const query = {};
        if (searchName) {
            query.$or = [
                { username: { $regex: searchName, $options: 'i' } },
                { email: { $regex: searchName, $options: 'i' } }
            ];
        }

        // ค้นหาผู้ใช้ตามเงื่อนไขที่กรอง
        const users = await User.find(query).limit(100);

        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

module.exports = {
    getAdmin,
    getAdminAPIKEY,
    generateAPIKEY,
    ManageAnimes,
    ManageActor,
    ManageVideos,
    updateUserRole,
    filterUsers
}