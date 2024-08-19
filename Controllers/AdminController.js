const User = require("../models/UserModel");
const Article = require("../models/ArticleModel")
const Anime = require("../models/AnimeModel")

const getAdmin = async (req, res) => {
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

        console.log("admin", User)

        res.render("./pages/admin/index", { users, filters: { adminName, adminEmail, adminRole }, admins, userID})
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/index', {
            error: errorMessage,
            userID
        });
    }
}

const ManageAnimes = async (req, res) => {
    const userID = req.session.userlogin;
    try {
        const animelists = await Anime.find().exec();
        // console.log(animelists)
        res.render("./pages/admin/manage/manage_anime", { userID, animelists})
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/manage/manage_anime', {
            error: errorMessage,
            userID
        });
    }
}

const updateUserRole = async (req, res) => {
    const userID = req.session.userlogin;
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


        res.status(200).render("./pages/admin/index",{ message: `ได้รับการเปลี่ยนแปลงแล้ว : ${newRole}`, admins, users, userID})
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/index', {
            error: errorMessage,
            userID
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
    ManageAnimes,
    updateUserRole,
    filterUsers
}