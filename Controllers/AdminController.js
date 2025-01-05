const User = require("../models/UserModel");
const Play = require("../models/PlayModel")
const Payment = require("../models/PaymentModel")
const ApiKey = require("../models/ApiKeyModel")
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")
const Reward = require("../models/Reward")
const Banner = require("../models/bannnerModel")
// const { getAnalyticsData } = require("../analytics.js")
const { v4: uuidv4 } = require('uuid');

const getAdmin = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session?.userlogin; // ใช้ Optional Chaining เพื่อหลีกเลี่ยง Error
    const { adminName, adminEmail, adminRole } = req.body;

    try {
        // Dynamic Query
        const query = {};
        if (adminName) query.username = { $regex: adminName, $options: 'i' };
        if (adminEmail) query.email = { $regex: adminEmail, $options: 'i' };
        if (adminRole) query.role = adminRole;

        // ใช้ Promise.all เพื่อรันหลายคำสั่งพร้อมกัน
        const [user, users, userAll, Animeall, Articleall, admins] = await Promise.all([
            req.user ? User.findById(req.user.id) : null, // ตรวจสอบ req.user
            User.find(query),
            User.find(),
            Anime.countDocuments(),
            Article.countDocuments(),
            User.find({ role: { $in: ['admin', 'moderator'] } }),
        ]);

        // Render ข้อมูล
        res.render("./index", {
            users,
            userAll,
            Animeall,
            Articleall,
            filters: { adminName, adminEmail, adminRole },
            translations: req.translations,
            lang,
            admins,
            userID,
            active: "Admin"
        });
    } catch (error) {
        console.error('Error in getAdmin:', error); // Logging
        res.status(500).json({
            msg: "Server Error",
            errorMessage: error.message || 'Internal Server Error'
        });
    }
};

const getAdminManageUser = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const userDatas = await User.find();
        res.render("./manage/user", {
            translations: req.translations,
            lang,
            userID,
            userDatas,
            active: "AdminManageUser"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            msg: "Server Error",
            errorMessage
        })
    }
}
const getAdminEditUser = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { userId } = req.params;
    try {
        const userData = await User.findById(userId);
        res.render("./edit/user", {
            translations: req.translations,
            lang,
            userID,
            userData,
            active: "AdminManageUser"
        })
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
        res.render("./add/rewards/addReward", {
            userID,
            lang,
            active: "getAdminReward"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage })
    }
}

const getAdminAPIKEY = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {


        res.render("./add/generate-api-key", {
            userID,
            lang,
            active: "getAdminAPIKEY"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}
const getAdminAddBanner = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {

        res.render("./add/banner.ejs", {
            userID,
            lang,
            active: "Addbanner"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage })
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

        res.status(200).redirect(`/admin/create/reward?msg=สร้าง API key สำเร็จ&status=true&key=${apiKey}`)
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).redirect(`/admin/create/reward?msg=${errorMessage}&status=false`)
    }
}

const ManageBanner = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    // console.log(userID)
    try {
        const Bannerlists = await Banner.find().sort({ createdAt: -1 }).exec();

        res.render("./manage/manage_banner", {
            userID,
            Bannerlists,
            lang,
            active: "Managebanner"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage })
    }
}

const ManageAnimes = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    try {
        const animelists = await Anime.find().sort({ createdAt: -1 }).exec();
        // console.log(animelists)
        res.render("./manage/manage_anime", {
            userID,
            animelists,
            translations: req.translations,
            lang,
            active: "AdminManageAnime"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage
        })
    }
}

const getAdminRewardManage = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const datarewards = await Reward.find().sort({ createdAt: -1 }).exec();
        res.render("./manage/manage_codereward", {
            userID,
            datarewards,
            lang,
            active: "AdminRewardManage"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ message: "Server Error", errorMessage })
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
        res.render("./manage/manage_aptkey", {
            userID,
            ApiKeylists,
            translations: req.translations,
            lang,
            active: "Manageapi"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}

// =========================================================== Router Playment manage =====================================
// ========================================================================================================================
const gatManagePlayment = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    try {
        const rewards = await Payment.find().lean();
        res.render("./manage/manage_playment", {
            userID,
            rewards,
            translations: req.translations,
            lang,
            active: "ManagePayment"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}


const ManageVideos = async (req, res) => {
    const lang = req.params.lang || 'th';
    const userID = req.session.userlogin;
    try {
        const videolists = await Play.find().exec();
        res.render("./manage/manage_videos", {
            userID,
            videolists,
            translations: req.translations,
            lang,
            active: "ManageVideos"
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./th/pages/admin/manage/mana_video', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const getListseriesEP = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const videoid = req.params;
    try {
        const series = await Play.findOne(videoid).exec(); // ค้นหาตาม videoid
        if (!series) {
            return res.json({
                userID,
                series: null,
                lang,
                active: "getListseriesEP",
                message: "ไม่พบซีรีส์ที่ร้องขอ", // เพิ่มข้อความแจ้งเตือน
            });
        }
        // console.log(series)
        res.render(`./manage/manage_episodes`, {
            userID,
            series,
            lang,
            active: "getListseriesEP"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}


const updateUserRole = async (req, res) => {
    const { userIdToUpdate, newRole } = req.body;
    const { adminName, adminEmail, adminRole } = req.body;
    try {
        const query = {};
        if (adminName) query.username = { $regex: adminName, $options: 'i' };
        if (adminEmail) query.email = { $regex: adminEmail, $options: 'i' };
        if (adminRole) query.role = adminRole;

        await User.findByIdAndUpdate(userIdToUpdate, { role: newRole });

        res.status(200).redirect(`/admin?msg=ได้รับการเปลี่ยนแปลง&status=true`);
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).redirect(`/admin?msg=${encodeURIComponent(errorMessage)}&status=false`);
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

const EditUserAdmin = async (req, res) => {
    const { userId } = req.params;
    try {
        const { username, email, role, points, isApproved } = req.body;
        const user = await User.findByIdAndUpdate(userId, {
            username,
            email,
            role,
            points,
            isApproved: isApproved === 'on',
        }, { new: true });
        if (!user) return res.status(404).send('ไม่พบผู้ใช้');
        res.redirect(`/admin/edit/user/${userId}?status=true&msg=อัจเดตแล้ว`);
    } catch (error) {
        res.status(500).send('เกิดข้อผิดพลาด');
    }
}

module.exports = {
    getAdmin,
    getAdminManageUser,
    getAdminEditUser,
    getAdminReward,
    getListseriesEP,
    getAdminAPIKEY,
    getAdminAddBanner,
    generateAPIKEY,
    ManageBanner,
    ManageAnimes,
    gatManagePlayment,
    ManageActor,
    ManageActPIKey,
    getAdminRewardManage,
    ManageVideos,
    updateUserRole,
    filterUsers,
    EditUserAdmin
}