const Reward = require("../models/Reward")
const User = require("../models/UserModel")
const Notification = require("../models/NotificationModel");
const { sendEmail } = require("../transporter");
const { emailRewardHtml } = require("../emailHtml/RewardHtml")

const adminAddReward = async (req, res) => {
    try {
        const { message, linkreward, reward, code } = req.body;


        // ตรวจสอบว่าข้อมูลทั้งหมดถูกต้อง
        if (!message || !linkreward || !reward || !code) {
            return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }


        const newReward = new Reward({ message, linkreward, reward, code });
        await newReward.save();

        console.log("สร้างรางวัลใหม่แล้ว", newReward)
        res.status(201).json({ success: true, reward: newReward });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const userRedeemReward = async (req, res) => {
    const { rewardId } = req.query;
    const { code } = req.body;
    const userId = req.user.id;
    const userID = req.session.userlogin;
    const userIP = req.ip;

    try {
        // ตรวจสอบว่ารางวัลที่กำลังแลกรับมีอยู่หรือไม่
        const reward = await Reward.findById(rewardId);
        const user = await User.findById(userId);

        if (!reward) {
            return res.json({ success: false, userID, rewardId, message: 'รางวัลไม่พบ' });
        }
        console.log(`User ${user.username} is attempting to redeem reward: ${reward.reward}`);

        // ตรวจสอบว่า IP นี้ได้แลกรับรางวัลไปแล้วหรือไม่
        // if (reward.redeemedIPs.includes(userIP)) {
        //     console.log(`IP ${userIP} has already redeemed this reward.`);
        //     return res.json({ success: false, userID, rewardId, message: 'คุณได้แลกรับรางวัลแล้ว' });
        // }

        // ตรวจสอบว่า user ได้รับรางวัลนี้ไปแล้วหรือไม่
        // if (reward.ReceivedBy.includes(userId)) {
        //     console.log(`User ${user.username} has already redeemed this reward.`);
        //     return res.json({ success: false, userID, rewardId, message: 'คุณได้แลกรับรางวัลนี้ไปแล้ว' });
        // }

        // ตรวจสอบรหัสรางวัล
        if (code && code === reward.code) {
            // เพิ่มผู้ใช้ในรายชื่อที่ได้รับรางวัล
            reward.ReceivedBy.push(userId);
            // reward.redeemedIPs.push(userIP);
            await reward.save();
            console.log(`User ${user.username} successfully redeemed the reward: ${reward.reward}`);
        
            const rewardDetails = reward;

            const notificationMessage = `แลกรับรางวัลสำเร็จ  นี่คือลิ้งรางวัลของคุณ ${reward.linkreward} โปรดคัดลอกแล้วเปิดที่เบาร์เซอร์`;
            const lognotification = await Notification.create({
                ownerId: userId,
                message: notificationMessage,
                articleId: rewardId,
            });

            console.log(lognotification);
        
            // ส่งอีเมลแจ้งเตือนผู้ใช้เกี่ยวกับการแลกรับรางวัล
            await sendEmail(
                user.email,
                `แจ้งเตือน: แลกรับรางวัลสำเร็จ`,
                emailRewardHtml(user.username, rewardDetails)
            );
            console.log(`Email sent to ${user.email} regarding successful reward redemption.`);
        
            return res.json({ success: true, userID, rewardId, message: 'แลกรับรางวัลสำเร็จ! เราส่งลิ้งค์ไปทางอีเมลของคุณแล้ว หรือตรงสอบการแจ้งเตือนที่กล่องแจ้งเตือน' });
        } else {
            return res.json({ success: false, userID, rewardId, message: 'รหัสรางวัลไม่ถูกต้อง' });
        }
        
    } catch (error) {
        console.error(`Error redeeming reward: ${error.message}`);
        return res.json({ success: false, userID, rewardId, message: 'เกิดข้อผิดพลาด: ' + error.message });
    }
}
const DeleteReward = async (req, res) => {
    try {
        const rewardId = req.params.id;
        await Reward.findByIdAndDelete(rewardId);
        return res.status(200).json({ message: 'Reward deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting reward' });
    }
}



module.exports = {
    adminAddReward,
    userRedeemReward,
    DeleteReward
}