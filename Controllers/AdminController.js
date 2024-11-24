const User = require("../models/UserModel");
const Play = require("../models/PlayModel")
const ApiKey = require("../models/ApiKeyModel")
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")
const Reward = require("../models/Reward")
const Banner = require("../models/bannnerModel")
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


        const user = await User.findById(req.user.id);
        const users = await User.find(query);
        const userAll = await User.find();

        const admins = await User.find({ role: 'admin' });

        // console.log("admin", User)

        res.render("./index", { users, userAll, filters: { adminName, adminEmail, adminRole }, translations: req.translations, lang, admins, userID })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            msg: "Server Error",
            errorMessage
        })
    }
}

const getAdminManageUser = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const userDatas = await User.find();
        res.render("./manage/user", { translations: req.translations, lang, userID, userDatas })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            msg: "Server Error",
            errorMessage
        })
    }
}

const getAdminReward = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render("./th/pages/admin/add/Reward", { userID , lang})
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage})
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
const getAdminAddBanner = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {

        res.render("./th/pages/admin/add/banner", { userID, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage})
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

const ManageBanner = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    // console.log(userID)
    try {
        const Bannerlists = await Banner.find().sort({ createdAt: -1 }).exec();

        res.render("./th/pages/admin/manage/manage_banner", { userID, Bannerlists, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage})
    }
}

const ManageAnimes = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    try {
        const animelists = await Anime.find().sort({ createdAt: -1 }).exec();
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

const getAdminRewardManage = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const datarewards = await Reward.find().sort({ createdAt: -1 }).exec();
        res.render("./th/pages/admin/manage/manage_codereward", { userID , datarewards, lang})
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage})
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

const ManageActPIKey = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    try {
        const ApiKeylists = await ApiKey.find().exec();
        // console.log(animelists)
        res.render("./th/pages/admin/manage/manage_aptkey", { userID, ApiKeylists, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/manage/manage_aptkey', {
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
        const userAll = await User.find();
        await User.findByIdAndUpdate(userIdToUpdate, { role: newRole });
        const admins = await User.find({ role: 'admin' });


        res.status(200).render("./index", { message: `ได้รับการเปลี่ยนแปลงแล้ว : ${newRole}`, admins, translations: req.translations, lang, users, userAll, userID })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            msg: "Server Error",
            errorMessage
        })
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
    getAdminManageUser,
    getAdminReward,
    getAdminAPIKEY,
    getAdminAddBanner,
    generateAPIKEY,
    ManageBanner,
    ManageAnimes,
    ManageActor,
    ManageActPIKey,
    getAdminRewardManage,
    ManageVideos,
    updateUserRole,
    filterUsers
}