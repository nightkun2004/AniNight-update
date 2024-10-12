const Meme = require("../Models/MemeModel");
const User = require("../models/UserModel");
const FormData = require('form-data');
const axios = require('axios');
const WebSocket = require('ws');

// ฟังก์ชันสำหรับดึงมีม
const getMeme = async (req, res) => {
    const userID = req.session.userlogin;
    const page = parseInt(req.params.page) || 1; // ค่าเริ่มต้นเป็นหน้า 1
    const limit = 10; 

    try {
        const totalMemes = await Meme.countDocuments(); // นับจำนวนมีมทั้งหมด
        const memes = await Meme.find({})
            .skip((page - 1) * limit) // ข้ามมีมก่อนหน้านี้
            .limit(limit) // จำกัดจำนวนมีมที่ดึงมา
            .populate('creator');

        res.render("./th/pages/Meme", { active: "Memes", userID, memes, page, totalPages: Math.ceil(totalMemes / limit) });
    } catch (error) {
        console.log(error);
        res.json({ msg: "Server Error", error });
    }
}

// ฟังก์ชันสำหรับการสร้างมีม
const getCreateMeme = async (req, res) => {
    const userID = req.session.userlogin;
    try {
        res.render("./th/pages/Creatememe", { userID,  active: "creatememe" });
    } catch (error) {
        console.log(error);
        res.json({ msg: "Server Error", error });
    }
}

// ฟังก์ชันสำหรับการดึงโพสต์มีม
const getPostMeme = async (req, res) => {
    const userID = req.session.userlogin;
    const { id } = req.params; 
    try {
        const post = await Meme.findOne({ _id: id })
            .populate({
                path: 'creator',
                select: '-password' 
            })
            .populate('comments.username.id', 'username') 
            .exec();

            post.adsDisplayed = (post.adsDisplayed || 0) + 1;
            await post.save(); 
        res.render("./th/pages/post", { 
            userID, 
            active: "Memes",
            post });
    } catch (error) {
        console.log(error);
        res.json({ msg: "Server Error", error });
    }
}

// ฟังก์ชันสำหรับการสร้างมีม
const createMeme = async (req, res) => {
    const userID = req.session.userlogin;

    // ตรวจสอบว่าไฟล์ถูกอัปโหลดหรือไม่
    if (!req.files || !req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;
    const formData = new FormData();
    formData.append('file', file.data, file.name);

    try {
        const { description } = req.body;

        // อัปโหลดไฟล์ไปยังเซิร์ฟเวอร์อื่น
        const response = await axios.post('https://sv7.ani-night.online/api/v2/upload/post', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // ตรวจสอบว่าการอัปโหลดสำเร็จหรือไม่
        if (response.status !== 200) {
            return res.status(response.status).json({ msg: "Error uploading file", error: response.data });
        }

        const imageUrl = response.data.url;

        // สร้างมีมใหม่
        const newMeme = new Meme({
            description,
            memeimageUrl: `${imageUrl}?v=${req.user.id}`, // เพิ่ม user ID ที่ URL
            creator: req.user.id,
            published: req.body.published === 'on',
        });

        // บันทึกมีมใหม่ในฐานข้อมูล
        await newMeme.save();
        await User.findByIdAndUpdate(req.user.id, { $push: { Mememes: newMeme._id } }, { new: true });
        res.json({ userID, status: 'ok', msg: "สร้างมีมแล้ว สามารถดูมีมที่โพสต์แล้วที่หน้า 'มีมเลย'" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
}

// ฟังก์ชันสำหรับส่งความคิดเห็น
const postComment = async (req, res,) => {
    const { postId, commentText } = req.body;
    const userID = req.session.userlogin;
    try {
        // ค้นหาโพสต์ที่ตรงกัน
        const meme = await Meme.findById(postId);
        if (!meme) {
            return res.status(404).json({ msg: "ไม่พบโพสต์" });
        }

        // สร้างความคิดเห็นใหม่
        const newComment = {
            username: {
                id: req.user.id,
                name: req.user.username // เพิ่มชื่อผู้ใช้
            },
            repliestext: commentText,
            likedBy: [],
            report: "",
            createdAt: new Date(),
            replies: []
        };

        // เพิ่มความคิดเห็นลงในโพสต์
        meme.comments.push(newComment);
        await meme.save();
        
        // ส่งความคิดเห็นใหม่ที่มีชื่อผู้ใช้ไปยัง WebSocket
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'newComment', comment: newComment })); // ใช้ action เพื่อระบุประเภทข้อมูล
            }
        });

        res.status(201).json({ msg: "ความคิดเห็นถูกส่งแล้ว", comment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์", error });
    }
};

// ฟังก์ชันสำหรับเพิ่มความคิดเห็นใหม่ (ใช้กับ WebSocket)
const addComment = async (data, ws, wss) => {
    const { postId, userId, commentText, parentId } = data; // parentId ใช้สำหรับการตอบกลับ

    try {
        // สร้างความคิดเห็นใหม่ในฐานข้อมูล
        const comment = {
            repliestext: commentText,
            username: {
                id: userId, // ID ของผู้ใช้ที่ส่งความคิดเห็น
                name: "Username" // ชื่อผู้ใช้ อาจจะเป็นชื่อจริงหรือชื่อเล่น
            },
            createdAt: new Date(),
            replies: []
        };

        if (parentId) {
            // ถ้ามี parentId แสดงว่ากำลังตอบกลับความคิดเห็น
            const parentComment = await Meme.findOne({ _id: postId, 'comments._id': parentId });

            if (parentComment) {
                // เพิ่มการตอบกลับในความคิดเห็น
                await Meme.updateOne(
                    { _id: postId, 'comments._id': parentId },
                    { $push: { 'comments.$.replies': comment } } // เพิ่มการตอบกลับ
                );
            }
        } else {
            // ถ้าไม่มีก็เป็นความคิดเห็นใหม่
            await Meme.findByIdAndUpdate(postId, { $push: { comments: comment } });
        }

        // ส่งความคิดเห็นใหม่ไปยังไคลเอนต์ทุกคนที่เชื่อมต่ออยู่ผ่าน WebSocket
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: 'newComment', comment })); // ส่งความคิดเห็นใหม่
            }
        });
    } catch (error) {
        console.log(error);
        ws.send(JSON.stringify({ msg: 'Error adding comment', error }));
    }
};

module.exports = {
    getMeme,
    getCreateMeme,
    getPostMeme,
    createMeme,
    postComment,
    addComment
};
