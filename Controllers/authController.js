const User = require("../models/UserModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const path = require("path")
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const crypto = require("crypto")
const jsonwebtoken = require("jsonwebtoken")
const fs = require("fs")
const axios = require('axios')
const { sendEmail } = require("../transporter");
const { emailHtmlWelcomeUser } = require("../emailHtml/welcomeuserHtml")
const { addPaymenthtml } = require("../emailHtml/addPaymenthtml")
const { ResetPasswordHtml } = require("../emailHtml/resetPasswordhtml")
require("dotenv").config()

const { checkAuth } = require("../lib/auth")


// POST: /api/users/login
const authLogin = async (req, res, next) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const { email, password } = req.body;

        // ตรวจสอบว่าข้อมูลที่ส่งมาครบถ้วนหรือไม่
        if (!email || !password) {
            return res.status(400).render(`./th/pages/authPages/login`, { notdata: 'ข้อมูลที่ส่งมาไม่ครบถ้วน', userID, active: "profile", translations: req.translations, lang });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        // ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
        if (!user) {
            return res.status(404).render(`./th/pages/authPages/login`, { notsystem: 'ไม่พบผู้ใช้นี้ในระบบ', userID, active: "profile", translations: req.translations, lang });
        }

        // ตรวจสอบความถูกต้องของรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).render(`./th/pages/authPages/login`, { error: 'รหัสผ่านไม่ถูกต้อง', userID, active: "profile", translations: req.translations, lang });
        }

        // สร้าง JWT token
        const { _id: id, username, role } = user;
        req.session.userlogin = { user };
        const token = jwt.sign({ id, username, role, email }, process.env.JWT_SECRET, { expiresIn: "5d" });
        const tksave = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "5d" });

        // ส่ง token ใน HTTP header
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.cookie('tksave', tksave, { httpOnly: false, secure: false });

        // เก็บ token ใน Session Storage 
        // console.log("session daras", req.session.userlogin)
        // console.log("token", token)

        // หาก session มีค่า role และเป็น admin ให้ไปหน้า /admin
        if (req.session.userlogin.user.role === 'admin') {
            return res.status(200).redirect('/admin');
        }

        const returnTo = req.session.returnTo || `/@${username}`;
        delete req.session.returnTo;
        res.redirect(303, returnTo);
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/authPages/login`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang,
            active: "profile",
        });
    }
};

// POST: /api/users/register
const authRegister = async (req, res, next) => {
    const lang = res.locals.lang;
    const { username, email, password, password2, 'g-recaptcha-response': recaptchaResponse } = req.body;
    const userID = req.session.userlogin;
    const secretKey = process.env.GOOGLE_SECRET_KEY_CAPTCHA;
    const siteKey = process.env.SITE_KEY;
    try {

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!username || !email || !password) {
            return res.status(400).render(`./th/pages/authPages/register`, { error: 'ข้อมูลที่ส่งมาไม่ครบถ้วน', userID, active: "register", siteKey, translations: req.translations, lang });
        }

        if (password.length < 6) {
            return res.status(400).render(`./th/pages/authPages/register`, { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', active: "register", userID, siteKey, translations: req.translations, lang });
        }

        if (password != password2) {
            return res.status(400).render(`./th/pages/authPages/register`, { error: 'รหัสผ่านขอคุณไม่ตรงกัน', active: "register", userID, siteKey, translations: req.translations, lang });
        }

        // ตรวจสอบ reCAPTCHA
        const recaptchaResponseData = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: secretKey,
                response: recaptchaResponse
            }
        });

        if (!recaptchaResponseData.data.success) {
            return res.status(400).render(`./th/pages/authPages/register`, { error: 'การตรวจสอบ reCAPTCHA ล้มเหลว กรุณาเลือกฉันไม่ใช่โปรแกรมอัตนมัติ', active: "register", userID, siteKey, translations: req.translations, lang, siteKey });
        }

        // ตรวจสอบความปลอดภัยของรหัสผ่าน (ตัวอย่างเช่น การมีอักขระต่างๆ)
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/;
        // if (!passwordRegex.test(password)) {
        //     return res.status(400).json({ message: 'รหัสผ่านต้องมีตัวอักษรตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษอย่างน้อยหนึ่งตัว' });
        // }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).render(`./th/pages/authPages/register`, { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร ประกอบด้วยตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข', active: "register", userID, siteKey, translations: req.translations, lang });
        }

        // ตรวจสอบอีเมลที่ซ้ำ
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render(`./th/pages/authPages/register`, { error: 'อีเมลนี้ถูกใช้ไปแล้ว', active: "register", siteKey, userID, translations: req.translations, lang });
        }
        // ตรวจสอบชื่อผู้ใช้ที่ซ้ำ
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).render(`./th/pages/authPages/register`, { error: 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว', active: "register", userID, siteKey, translations: req.translations, lang });
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

        await sendEmail(
            newUser.email,
            `ถึง ${username} ยินดีด้วยคุณสมัครสมาชิกของเราเรียนร้อยแล้วว !! 😎😍`,
            emailHtmlWelcomeUser()
        );

        console.log(token)
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(200).render(`./th/pages/authPages/register`, {
            token,
            message: "สมัครสำเร็จ กดด้านล่างเพื่อเข้าสู่ระบบ",
            userID,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            },
            siteKey,
            translations: req.translations, lang,
            active: "register",
        });

    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render(`./th/pages/authPages/register`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang, siteKey,
            active: "register",
        });
    }
}

// ===================================== TikTok Singin =====================================================
// =========================================================================================================
const TikTokLogin = async (req, res) => {
    const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
    const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
    if (!CLIENT_KEY) {
        return res.status(500).json({ error: 'TikTok client key is not configured' });
    }
    console.log('TikTok Client Key:', CLIENT_KEY);


    try {


        const csrfState = Math.random().toString(36).substring(2);
        res.cookie("csrfState", csrfState, { maxAge: 60000 });
        let url = "https://www.tiktok.com/v2/auth/authorize/";
        // the following params need to be in `application/x-www-form-urlencoded` format.
        url += `?client_key=${CLIENT_KEY}`;
        url += "&scope=user.info.basic,user.info.profile,user.info.stats,video.list";
        url += "&response_type=code";
        url += `&redirect_uri=http://localhost:5000/auth/tiktok/callback`;
        url += "&state=" + csrfState;

        res.redirect(url);
    } catch (error) {
        console.error('Error in TikTokLogin:', error);
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({ error: errorMessage });
    }
};


const authProfile = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        // ใช้ฟังก์ชัน checkAuth เพื่อทำการตรวจสอบการเข้าสู่ระบบ
        checkAuth(req, res, async () => {
            const user = await User.findById(userID.user._id).select('-password').populate('articles').exec();
            if (!user) {
                return res.status(404).render(`./th/pages/authPages/profile`, { error: 'ไม่พบผู้ใช้นี้ในระบบ', active: "profile", translations: req.translations, lang });
            }
            res.render(`./th/pages/authPages/profile`, {
                active: "profile",
                user,
                userID,
                message: "โหลดโปรไฟล์เรียบร้อยแล้ว",
                translations: req.translations, lang
            });
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render(`./th/pages/authPages/profile`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
};


// ====================================== ResetPassword ====================================================
// =========================================================================================================
const ResetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json('ไม่พบบัญชีนี้');
        }

        // Generate reset token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 นาทีหมดอายุ
        await user.save()

        const resetLink = `https://www.ani-night.online/reset-password?token=${token}`;

        await sendEmail(
            user.email,
            `แจ้งเตือน: มีการส่งคำขอรีเซ็ตรหัสผ่านสำหรับ ${user.email}`,
            ResetPasswordHtml(resetLink)
        );


        res.status(200).json('เราส่งคำขอรีเซ้นรหัสผ่านไปทางอีเมลของคุณแล้ว');
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
    }
}



// ====================================== Get ResetPassword ===================================================
// ============================================================================================================
const getResetPassword = async (req, res) => {
    const userID = req.session.userlogin;
    const { token } = req.query;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
        }

        const siteKey = process.env.SITE_KEY;

        res.render("./th/pages/authPages/reset-password", { userID, token, siteKey })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error, status: 500 })
    }
}



// ====================================== post checkToken ResetPassword new ===================================================
// ============================================================================================================
const checkTokenNewPassword = async (req, res) => {
    const { token } = req.query; // รับ token จาก query string
    const { newPassword, 'g-recaptcha-response': recaptchaResponse } = req.body;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });


        // ตรวจสอบ reCAPTCHA
        // const secretKey = process.env.GOOGLE_SECRET_KEY_CAPTCHA;
        // if (!secretKey) {
        //     throw new Error('ไม่พบ secretKey ในการตรวจสอบ reCAPTCHA');
        // }



        // ตรวจสอบ reCAPTCHA
        // const recaptchaResponseData = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
        //     params: {
        //         secret: secretKey,
        //         response: recaptchaResponse
        //     }
        // });

        // if (!recaptchaResponseData.data.success) {
        //     return res.status(400).json({ message: 'การตรวจสอบ reCAPTCHA ล้มเหลว กรุณาเลือกฉันไม่ใช่โปรแกรมอัตโนมัติ' });
        // }

        if (!user) {
            return res.status(400).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
        }

        // ตรวจสอบว่าผู้ใช้มีการลงชื่อเข้าใช้ผ่าน Google
        if (user.googleId && !user.password) {
            return res.status(400).json({ message: 'ผู้ใช้ลงชื่อเข้าใช้ผ่าน Google และยังไม่มีรหัสผ่าน เรากำลังแก้ไขปัญหานี้โปรดรอ' })
        }

        // ตั้งค่ารหัสผ่านใหม่
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ message: `Server Error ${error}`, error: error, status: 500 })
    }
}

// ======================================= API Article User ================================================
// =========================================================================================================
const authArticleUser = async (req, res) => {
    const { userid } = req.params;
    try {
        const user = await User.findById(userid).populate('articles').exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found', status: 404 });
        }

        const page = parseInt(req.body.page) || 1; // ใช้ req.body แทน req.query ในกรณีนี้
        const limit = 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = user.articles.length;

        const articles = user.articles.slice(startIndex, endIndex);

        // ตรวจสอบว่ามีหน้าถัดไปหรือไม่
        const hasNext = endIndex < total;
        
        res.status(200).json({
            articles, 
            page, 
            totalPages: Math.ceil(total / limit),
            hasNext // ส่งค่า hasNext เพื่อให้ front-end ใช้ในการตรวจสอบ
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message, status: 500 });
    }
};


// =============================================== Profile Save Anime =========================================
// ============================================================================================================
const authProfileSaveAnime = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        // ใช้ฟังก์ชัน checkAuth เพื่อทำการตรวจสอบการเข้าสู่ระบบ
        checkAuth(req, res, async () => {
            const user = await User.findById(userID.user._id).select('-password').populate('saveanime').exec();
            if (!user) {
                return res.status(404).render(`./th/pages/authPages/pages/saveAnime`, { error: 'ไม่พบผู้ใช้นี้ในระบบ', translations: req.translations, lang });
            }
            res.render(`./th/pages/authPages/pages/saveAnime`, {
                user,
                userID,
                message: "โหลดโปรไฟล์เรียบร้อยแล้ว",
                translations: req.translations, lang
            });
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render(`./th/pages/authPages/pages/saveAnime`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
};



const getEditProfile = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render(`./th/pages/authPages/Edits/EditProfile`, { userID, translations: req.translations, lang })
    } catch (error) {
        // console.log(error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render(`./th/pages/authPages/Edits/EditProfile`, {
            userID,
            message: "เกิดข้อผิดพลาดข้อมูลยกเลิกติดตามไปยัง API Server แล้ว",
            error: errorMessage,
            translations: req.translations, lang
        })
    }
};


const EditProfile = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    // console.log('Request Body:', req.body);
    try {
        const { bio } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(403).render(`./th/pages/authPages/Edits/EditProfile`, { error: 'ไม่พบผู้ใช้', userID, translations: req.translations, lang });
        }

        //  const existingusername = await User.findOne({ username });
        //  if (existingusername) {
        //      return res.status(400).render(`./th/pages/authPages/Edits/EditProfile`, { error: 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว', userID, translations: req.translations, lang });
        //  }


        // Update user info in database
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                bio
            },
            { new: true }
        );

        req.session.userlogin = { ...req.session.userlogin,bio: updatedUser.bio };

        if (!updatedUser) {
            return res.status(500).render(`./th/pages/authPages/Edits/EditProfile`, { message: 'ไม่สามารถอัปเดตข้อมูลได้.', userID, translations: req.translations, lang });
        }

        res.status(200).render(`./th/pages/authPages/Edits/EditProfile`, { message: 'แก้ไขรายละเอียดโปรไฟล์ของคุณแล้วครับ.', userID, translations: req.translations, lang });
    } catch (error) {
        console.log(error.response ? error.response.data : error.message);
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).json({
            errorMessage
        })
    }
}

const EditProfileAvater = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        if (!req.files || !req.files.avatar) {
            return res.status(422).render(`./th/pages/authPages/Edits/EditProfile`, {
                message: 'กรุณาเลือกรูปภาพ',
                userID,
                translations: req.translations, lang
            });
        }

        const avatar = req.files.avatar;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(403).render(`./th/pages/authPages/Edits/EditProfile`, { message: 'ไม่พบผู้ใช้', userID, translations: req.translations, lang });
        }

        // ตรวจสอบขนาดไฟล์
        if (avatar.size > 5000000) {
            return res.status(422).render(`./th/pages/authPages/Edits/EditProfile`, { message: 'รูปภาพของคุณต้องมีขนาดไม่เกิน 5MB', userID, translations: req.translations, lang });
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
                return res.status(500).render(`./th/pages/authPages/Edits/EditProfile`, { error: err, userID, translations: req.translations, lang });
            }

            // อัปเดตข้อมูลในฐานข้อมูล
            const updateAvatar = await User.findByIdAndUpdate(req.user.id, { profilePicture: newFilename }, { new: true });

            if (!updateAvatar) {
                return res.status(422).render(`./th/pages/authPages/Edits/EditProfile`, { error: "ไม่สามารถเปลี่ยนอวาตาร์ได้", userID, translations: req.translations, lang });
            }

            // อัปเดตเซสชัน
            req.session.userlogin = { ...req.session.userlogin, user: updateAvatar.toObject() };
            // console.log("ข้อมูลอัพเดต session", req.session.userlogin);

            res.status(200).render(`./th/pages/authPages/Edits/EditProfile`, { message: 'เปลี่ยนโปรไฟล์เรียบร้อย', translations: req.translations, lang, dataprofile: updateAvatar.profilePicture, userID });
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render(`./th/pages/authPages/Edits/EditProfile`, {
            userID,
            message: errorMessage,
            error: errorMessage,
            translations: req.translations, lang
        });
    }
};

const EditBanner = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {

        res.render(`./th/pages/authPages/Edits/EditBanner`, { userID, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        res.status(500).render(`./th/pages/authPages/Edits/EditBanner`, {
            userID,
            message: errorMessage,
            error: errorMessage,
            translations: req.translations, lang
        });
    }
}


const EditBannerPost = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = req.params.lang || 'th';
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


const saveTrueMoney = async (req, res) => {
    const userID = req.session.userlogin;
    const { name, truemoneynumber } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.bank.truemoneywallet = {
            name,
            truemoneynumber
        };

        await sendEmail(
            user.email,
            `ถึง ${name} ยินดีด้วย คุณได้เพิ่ม TrueMoney Wallet เรียบร้อยแล้ว!`,
            addPaymenthtml("เพิ่ม True Money", name, truemoneynumber)
        );


        await user.save();
        // console.log(user)
        // Redirect หลังจากการบันทึกสำเร็จ
        return res.redirect(`/dashboard?id${userID.user._id}`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const savebankaccount = async (req, res) => {
    const userID = req.session.userlogin;
    const { name, banknumber, bankname } = req.body; // แก้ไขชื่อฟิลด์ที่ใช้

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }

        // อัปเดตข้อมูลบัญชีธนาคารของผู้ใช้
        user.bank.bankaccount = {
            name,
            number: banknumber, // ใช้ banknumber ตามที่ระบุ
            bankname
        };

        // ส่งอีเมลแจ้งเตือนผู้ใช้
        await sendEmail(
            user.email,
            `ถึง ${name} ยินดีด้วย คุณได้เพิ่มบัญชีธนาคารเรียบร้อยแล้ว!`,
            addPaymenthtml("เพิ่มการชำระเงินธนาคาร", name, banknumber) // เปลี่ยนเป็น name และ banknumber
        );

        // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
        await user.save();
        // console.log(user);

        // Redirect หลังจากการบันทึกสำเร็จ
        return res.redirect(`/dashboard?id=${userID.user._id}`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
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
        res.clearCookie('tksave');


        // Redirect ไปยังหน้าแรกหรือหน้า Login
        res.redirect('/');
    });
};

module.exports = {
    getEditProfile,
    authLogin,
    authRegister,
    authProfile,
    TikTokLogin,
    ResetPassword,
    getResetPassword,
    checkTokenNewPassword,
    authProfileSaveAnime,
    authArticleUser,
    EditProfile,
    EditProfileAvater,
    EditBanner,
    EditBannerPost,
    saveTrueMoney,
    savebankaccount,
    logout
}