const User = require("../models/UserModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const path = require("path")
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const crypto = require("crypto")
const fs = require("fs")

const { checkAuth } = require("../lib/auth")
require("dotenv").config()

// POST: /api/users/login
const authLogin = async (req, res, next) => {
    const userID = req.session.userlogin;
    try {
        const { email, password } = req.body;

        // ตรวจสอบว่าข้อมูลที่ส่งมาครบถ้วนหรือไม่
        if (!email || !password) {
            return res.status(400).render('./pages/authPages/login', { notdata: 'ข้อมูลที่ส่งมาไม่ครบถ้วน', userID });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
        if (!user) {
            return res.status(404).render('./pages/authPages/login', { notsystem: 'ไม่พบผู้ใช้นี้ในระบบ', userID });
        }

        // ตรวจสอบความถูกต้องของรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).render('./pages/authPages/login', { error: 'รหัสผ่านไม่ถูกต้อง', userID });
        }

        // สร้าง JWT token
        const { _id: id, username, role } = user;
        req.session.userlogin = { user };
        const token = jwt.sign({ id, username, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        const tksave = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // ส่ง token ใน HTTP header
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.cookie('tksave', tksave, { httpOnly: false, secure: false });

        // เก็บ token ใน Session Storage 

        const returnTo = req.session.returnTo || `/${username}`;
        delete req.session.returnTo;
        res.redirect(303, returnTo);
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/authPages/login', {
            error: errorMessage,
            userID
        });
    }
};

// POST: /api/users/register
const authRegister = async (req, res, next) => {
    const { username, email, password, password2 } = req.body;
    const userID = req.session.userlogin;
    try {

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!username || !email || !password) {
            return res.status(400).render('./pages/authPages/register', { error: 'ข้อมูลที่ส่งมาไม่ครบถ้วน', userID });
        }

        if (password.length < 6) {
            return res.status(400).render('./pages/authPages/register', { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', userID });
        }

        if (password != password2) {
            return res.status(400).render('./pages/authPages/register', { error: 'รหัสผ่านขอคุณไม่ตรงกัน', userID });
        }

        // ตรวจสอบความปลอดภัยของรหัสผ่าน (ตัวอย่างเช่น การมีอักขระต่างๆ)
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/;
        // if (!passwordRegex.test(password)) {
        //     return res.status(400).json({ message: 'รหัสผ่านต้องมีตัวอักษรตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษอย่างน้อยหนึ่งตัว' });
        // }

        // ตรวจสอบอีเมลที่ซ้ำ
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render('./pages/authPages/register', { error: 'อีเมลนี้ถูกใช้ไปแล้ว', userID });
        }
        // ตรวจสอบชื่อผู้ใช้ที่ซ้ำ
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).render('./pages/authPages/register', { error: 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว', userID });
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log(token)
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(200).render('./pages/authPages/register', {
            token,
            message: "สมัครสำเร็จ กดด้านล่างเพื่อเข้าสู่ระบบ",
            userID,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            },
        });

    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render('./pages/authPages/register', {
            error: errorMessage,
            userID
        });
    }
}

const authProfile = async (req, res) => {
    const userID = req.session.userlogin;
    try {
        // ใช้ฟังก์ชัน checkAuth เพื่อทำการตรวจสอบการเข้าสู่ระบบ
        checkAuth(req, res, async () => {
            const user = await User.findById(userID.user._id).select('-password').populate('articles').exec();
            if (!user) {
                return res.status(404).render('./pages/authPages/profile', { error: 'ไม่พบผู้ใช้นี้ในระบบ' });
            }
            res.render("./pages/authPages/profile", {
                user,
                userID,
                message: "โหลดโปรไฟล์เรียบร้อยแล้ว"
            });
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render('./pages/authPages/profile', {
            error: errorMessage,
            userID
        });
    }
};


const getChannel = async (req, res) => {
    const userID = req.session.userlogin;
    const channelID = req.params.id;
    try {
        const response = await axios.post(`${process.env.API_URL_USERS}/profile/channel/${channelID}`, {
        });
        const { data } = response;

        res.render("./pages/channels/index", {
            userID,
            channel: data
        });
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render('./pages/channels/index', {
            error: errorMessage,
            userID
        });
    }
};


const getFollow = async (req, res) => {
    const userID = req.session.userlogin;
    const channelID = req.params.id;
    const { userId, token } = req.body;
    try {
        const response = await axios.post(`${process.env.API_URL_USERS}/follow/${userId}`,
            {},  // ส่ง body ว่างถ้าไม่จำเป็นต้องมีข้อมูลเพิ่มเติม
            {
                headers: {
                    'Authorization': `Bearer ${userID.token}`  // ใช้ token ที่จัดเก็บใน session
                }
            });
        const { data } = response;
        res.status(200).json({
            massage: "ส่งข้อมูลกดติดตามไปยัง API Server แล้ว",
            data
        })

    } catch (error) {
        // console.log("มีข้อผิดพลากติดตาม",error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).json({
            massage: "เกิดข้อผิดพลาดข้อมูลกดติดตามไปยัง API Server แล้ว",
            error: errorMessage
        })
    }
};

const getUnfollow = async (req, res) => {
    const userID = req.session.userlogin;
    const channelID = req.params.id;
    try {
        const response = await axios.post(`${process.env.API_URL_USERS}/followers/${channelID}`, {},  // ส่ง body ว่างถ้าไม่จำเป็นต้องมีข้อมูลเพิ่มเติม
            {
                headers: {
                    'Authorization': `Bearer ${userID.token}`  // ใช้ token ที่จัดเก็บใน session
                }
            });
        const { data } = response;
        res.status(200).json({
            message: "ส่งข้อมูลยกเลิกติดตามไปยัง API Server แล้ว",
            data
        });
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).json({
            message: "เกิดข้อผิดพลาดข้อมูลยกเลิกติดตามไปยัง API Server แล้ว",
            error: errorMessage
        });
    }
};



const getEditProfile = async (req, res) => {
    const userID = req.session.userlogin;
    try {
        res.render("./pages/authPages/Edits/EditProfile", { userID })
    } catch (error) {
        // console.log(error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render("./pages/authPages/Edits/EditProfile", {
            userID,
            message: "เกิดข้อผิดพลาดข้อมูลยกเลิกติดตามไปยัง API Server แล้ว",
            error: errorMessage
        })
    }
};


const EditProfile = async (req, res) => {
    const userID = req.session.userlogin;
    // console.log('Request Body:', req.body);
    try {
        const { username, email, currentPassword, bio } = req.body;

        if (!currentPassword) {
            return res.status(400).render("./pages/authPages/Edits/EditProfile", { error: 'กรุณากรอกรหัสผ่านปัจจุบัน', userID });
        }

        // Get user from database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(403).render("./pages/authPages/Edits/EditProfile", { error: 'ไม่พบผู้ใช้', userID });
        }

        // Validate current password
        const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validateUserPassword) {
            return res.status(422).render("./pages/authPages/Edits/EditProfile", { error: 'รหัสผ่านเดิมไม่ถูกต้อง', userID });
        }

        // Update user info in database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                username,
                email,
                bio
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).render("./pages/authPages/Edits/EditProfile", { message: 'ไม่สามารถอัปเดตข้อมูลได้.', userID });
        }

        res.status(200).render("./pages/authPages/Edits/EditProfile", { message: 'แก้ไขรายละเอียดโปรไฟลืของคุณแล้วครับ.', userID });
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render("./pages/authPages/Edits/EditProfile", {
            userID,
            message: errorMessage,
        })
    }
}

const EditProfileAvater = async (req, res) => {
    const userID = req.session.userlogin;
    try {
        if (!req.files || !req.files.avatar) {
            return res.status(422).render("./pages/authPages/Edits/EditProfile", {
                message: 'กรุณาเลือกรูปภาพ',
                userID
            });
        }

        const avatar = req.files.avatar;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(403).render("./pages/authPages/Edits/EditProfile", { message: 'ไม่พบผู้ใช้', userID });
        }

        // ตรวจสอบขนาดไฟล์
        if (avatar.size > 5000000) {
            return res.status(422).render("./pages/authPages/Edits/EditProfile", { message: 'รูปภาพของคุณต้องมีขนาดไม่เกิน 5MB', userID });
        }

        // ลบอวาตาร์เก่าถ้ามี
        if (user.profilePicture) {
            const oldAvatarPath = path.join(__dirname, '..', 'public/uploads/profiles', user.profilePicture);
            fs.unlink(oldAvatarPath, (err) => {
                if (err) {
                    console.error("ลบอวาตาร์เก่าไม่สำเร็จ:", err);
                }
            });
        }

        // สร้างชื่อไฟล์ใหม่
        const fileName = avatar.name;
        const splittedFilename = fileName.split('.');
        const newFilename = splittedFilename[0] + crypto.randomUUID() + '.' + splittedFilename[splittedFilename.length - 1];

        // ย้ายไฟล์ใหม่ไปยังโฟลเดอร์
        const newFilePath = path.join(__dirname, '..', 'public/uploads/profiles', newFilename);
        avatar.mv(newFilePath, async (err) => {
            if (err) {
                return res.status(500).render("./pages/authPages/Edits/EditProfile", { error: err, userID });
            }

            // อัปเดตข้อมูลในฐานข้อมูล
            const updateAvatar = await User.findByIdAndUpdate(req.user.id, { profilePicture: newFilename }, { new: true });

            if (!updateAvatar) {
                return res.status(422).render("./pages/authPages/Edits/EditProfile", { error: "ไม่สามารถเปลี่ยนอวาตาร์ได้", userID });
            }

            // อัปเดตเซสชัน
            req.session.userlogin = { ...req.session.userlogin, user: updateAvatar.toObject() };
            console.log("ข้อมูลอัพเดต session", req.session.userlogin);

            res.status(200).render("./pages/authPages/Edits/EditProfile", { message: 'เปลี่ยนโปรไฟล์เรียบร้อย', dataprofile: updateAvatar.profilePicture, userID });
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render("./pages/authPages/Edits/EditProfile", {
            userID,
            message: errorMessage,
            error: errorMessage
        });
    }
};

const EditBanner = async (req, res) => {
    const userID = req.session.userlogin;
    try {

        res.render("./pages/authPages/Edits/EditBanner", { userID });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render("./pages/authPages/Edits/EditBanner", {
            userID,
            message: errorMessage,
            error: errorMessage
        });
    }
}


const EditBannerPost = async (req, res) => {
    const userID = req.session.userlogin;
    const image = req.body.image;
    try {
        // ดึงประเภท MIME จาก base64 string
        const mimeType = image.match(/^data:(image\/[a-zA-Z]*);base64,/)[1];
        const extension = mimeType.split('/')[1]; // 'png', 'jpeg', 'jpg', etc.

        const base64Data = image.replace(/^data:image\/[a-zA-Z]*;base64,/, "");

        // สร้างชื่อไฟล์ใหม่โดยใช้ UUID และนามสกุลที่ได้
        const newFilename = crypto.randomUUID() + '.' + extension;
        const newImagePath = path.join(__dirname, '..', 'public/uploads/banners', newFilename);

        const user = await User.findById(req.user.id);

        // ลบไฟล์เก่าหากมี
        if (user.bannerImagePath) {
            const oldImagePath = path.join(__dirname, '..', 'public/uploads/banners', user.bannerImagePath);
            fs.unlink(oldImagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Failed to delete old file:', unlinkErr);
                }
            });
        }

        fs.writeFile(newImagePath, base64Data, 'base64', async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'เกิดข้อผิดพลาดระหว่างอัพโหลด' });
            }

            try {
                // ตรวจสอบขนาดของภาพ
                const { width, height } = await sharp(newImagePath).metadata();

                // กำหนดขนาดที่ต้องการ
                const requiredWidth = 2560;
                const requiredHeight = 1440;

                if (width !== requiredWidth || height !== requiredHeight) {
                    fs.unlink(newImagePath, (unlinkErr) => {
                        if (unlinkErr) {
                            return res.status(500).json({ error: `Failed to delete invalid file: ${unlinkErr}` });
                        }
                    });
                    return res.status(400).json({ error: `ขนาดรูปภาพไม่ถูกต้อง ที่จำเป็น ${requiredWidth}x${requiredHeight}, ภาพที่คุณครอปมา ${width}x${height}.` });
                }

                // ขนาดภาพถูกต้อง

                if (!user) {
                    fs.unlink(newImagePath, (unlinkErr) => {
                        if (unlinkErr) {
                            return res.status(500).json({ error: `Failed to delete invalid file: ${unlinkErr}` });
                        }
                    });
                    return res.status(404).json({ error: 'User not found' });
                }

                // เก็บเฉพาะชื่อไฟล์ในฐานข้อมูล
                user.bannerImagePath = newFilename;
                await user.save();

                res.status(200).json({ message: 'อัพโหลดสำเร็จ ปิดหน้านี้ได้เลย!' });
            } catch (sharpErr) {
                console.error(sharpErr);
                fs.unlink(newImagePath, (unlinkErr) => {
                    if (unlinkErr) {
                        return res.status(500).json({ error: `Failed to delete invalid file: ${unlinkErr}` });
                    }
                });
                res.status(500).json({ error: 'Error processing image' });
            }
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).json({ error: errorMessage });
    }
}

const logout = (req, res) => {
    // ลบข้อมูลในเซสชัน
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('ไม่สามารถออกจากระบบได้');
        }

        // ลบ Cookie ที่เกี่ยวข้อง
        res.clearCookie('token');

        // Redirect ไปยังหน้าแรกหรือหน้า Login
        res.redirect('/auth/login');
    });
};

module.exports = {
    getEditProfile,
    authLogin,
    authRegister,
    authProfile,
    getChannel,
    getFollow,
    getUnfollow,
    EditProfile,
    EditProfileAvater,
    EditBanner,
    EditBannerPost,
    logout
}