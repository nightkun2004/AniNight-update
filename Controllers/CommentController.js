const Comment = require("../models/CommentModel")

// ================================================== AddComment ========================================
const addComment = async (req, res) => {
    const userId = req.user.id;
    const { postId, comment } = req.body;

    try {

        if (!userId) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const newComment = new Comment({
            postId,
            userId,
            comment,
            likes: [],
            replies: [],
            createdAt: new Date(),
        });

        await newComment.save();
        // console.log("เพิ่มความคิด้ห็นแล้ว", newComment)

        res.status(200).json({ success: true, msg: "แสดงความคิดเห็นสำเร็จแล้วจ้า" })
    } catch (error) {
        res.status(500).json({ msg: "Surver Error", error })
    }
};

// ============================================= GetComments ============================================
const getComments = async (req, res) => {
    const { articleId } = req.params;  // ดึง articleId จาก URL

    try {
        // ค้นหาความคิดเห็นที่เกี่ยวข้องกับ articleId
        const comments = await Comment.find({ postId: articleId })
            .populate('userId', 'username profilePicture');

        res.status(200).json(comments);  // ส่งกลับความคิดเห็นทั้งหมด
    } catch (error) {
        res.status(500).json({ msg: "Server Error", error });
    }
}

module.exports = {
    addComment,
    getComments
};
