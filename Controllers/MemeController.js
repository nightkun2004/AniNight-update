const Meme = require("../models/MemeModel");
const User = require("../models/UserModel");
const FormData = require('form-data');
const axios = require('axios');
const WebSocket = require('ws');

const getMeme = async (req, res) => {
    const userID = req.session.userlogin;
    const page = parseInt(req.params.page) || 1; // ค่าเริ่มต้นเป็นหน้า 1
    const limit = 10;

    try {
        const totalMemes = await Meme.countDocuments(); // นับจำนวนมีมทั้งหมด
        const memes = await Meme.find({})
            .skip((page - 1) * limit) // ข้ามมีมก่อนหน้านี้
            .limit(limit) // จำกัดจำนวนมีมที่ดึงมา
            .populate('creator') // นำข้อมูล creator ของมีมมาแสดง
            .populate({
                path: 'comments.username.id', // นำข้อมูล user ของแต่ละคอมเมนต์มาแสดง
                select: 'name profilePicture' // เลือกเฉพาะชื่อและรูปโปรไฟล์
            })
            .populate({
                path: 'comments.replies.username.id', // นำข้อมูล user ของการตอบกลับคอมเมนต์มาแสดง
                select: 'name profilePicture' // เลือกเฉพาะชื่อและรูปโปรไฟล์
            });

        res.render("./th/pages/Meme", { 
            active: "Memes", 
            userID, 
            memes, 
            page, 
            totalPages: Math.ceil(totalMemes / limit) 
        });
    } catch (error) {
        console.log(error);
        res.json({ msg: "Server Error", error });
    }
};


const likeMeme = async (req, res) => {
    const MemeId = req.params.id;
    const userId = req.user.id;

    try {
        const meme = await Meme.findById(MemeId);

        // ตรวจสอบว่าผู้ใช้กดไลค์ meme นี้หรือยัง
        if (meme.likes.includes(userId)) {
            // หากเคยกดแล้ว ให้ลบไลค์ออก
            meme.likes.pull(userId);
        } else {
            // หากยังไม่เคยกด ให้เพิ่มไลค์
            meme.likes.push(userId);
        }

        await meme.save();
        res.json({ success: true, likesCount: meme.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error liking meme' });
    }
}


const addComment = async (req, res) => {
    const memeId = req.params.id;
    const { commentText } = req.body;

    try {
        const meme = await Meme.findById(memeId);
        const newComment = {
            username: {
                id: req.user.id,
            },
            commentText
        };

        meme.comments.push(newComment);
        await meme.save();
        console.log("เพิ่มความคิดเห้น", meme)
        res.json({ success: true, message: 'Comment added successfully', comments: meme.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding comment' });
    }
};


// เพิ่มการตอบกลับ
const addReply = async (req, res) => {
    const memeId = req.params.id;
    const commentId = req.params.commentId;
    const { replyText } = req.body;
    const userId = req.user.id;

    try {
        const meme = await Meme.findById(memeId);
        const comment = meme.comments.id(commentId);

        if (comment) {
            const newReply = {
                username: {
                    id: req.user.id,
                    name: req.user.username
                },
                replyText
            };

            comment.replies.push(newReply);
            await meme.save();
            console.log("ตอบกลับ", newReply)
            res.json({ success: true, message: 'Reply added successfully', replies: comment.replies });
        } else {
            res.status(404).json({ success: false, message: 'Comment not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding reply' });
    }
};

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
            .populate({
                path: 'comments.username.id', // นำข้อมูล user ของแต่ละคอมเมนต์มาแสดง
                select: 'name profilePicture' // เลือกเฉพาะชื่อและรูปโปรไฟล์
            })
            .populate({
                path: 'comments.replies.username.id', // นำข้อมูล user ของการตอบกลับคอมเมนต์มาแสดง
                select: 'name profilePicture'
            })
            .populate({
                path: 'comments.replies',
            })
            .exec();

        post.adsDisplayed = (post.adsDisplayed || 0) + 1;
        await post.save(); 

        res.render("./th/pages/post", { 
            userID, 
            active: "Memes",
            post 
        });
    } catch (error) {
        console.log(error);
        res.json({ msg: "Server Error", error });
    }
}

const likeMemeComment = async (req, res) => {
    const userId = req.user.id;
    const { id, commentId } = req.params;

    try {
        const post = await Meme.findById(id);
        const comment = post.comments.id(commentId);

        if (comment.likedBy.includes(userId)) {
            // ถ้าไลค์อยู่แล้ว ให้ลบออก
            comment.likedBy.pull(userId);
        } else {
            // ถ้ายังไม่ไลค์ ให้เพิ่มเข้าไป
            comment.likedBy.push(userId);
        }

        await post.save();
        res.status(200).json({ message: 'Like status updated', likes: comment.likedBy.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
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


module.exports = {
    getMeme,
    likeMeme,
    getCreateMeme,
    getPostMeme,
    createMeme,
    postComment,
    likeMemeComment,
    addComment,
    addReply
};
