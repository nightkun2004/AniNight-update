const Play = require("../models/PlayModel")
const User = require("../models/UserModel") 
const cloudinary = require('cloudinary').v2;
const crypto = require("crypto")

require("dotenv").config

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getPlay = async (req, res) => {
    const { videoid } = req.params;
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const play = await Play.findById(videoid).populate('Episodes');
        if (!play) {
            return res.status(404).send('Video not found.');
        }
        const liked = userID ? play.likedBy.includes(userID.user._id) : false;
        // console.log("Play Main", play)
        res.render(`./th/play`, {
            userID,
            lang,
            play,
            liked,
            episode: null
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/play`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}
const getPlayEpisodes = async (req, res) => {
    const { videoid, episodeid } = req.params;
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const play = await Play.findById(videoid).populate('Episodes');
        if (!play) {
            return res.status(404).send('Video not found.');
        }
        // console.log("Play Episodes", play);
        const liked = userID ? play.likedBy.includes(userID.user._id) : false;
        // ค้นหาตอนที่ตรงกับ episodeid
        const episode = play.Episodes.id(episodeid);
        if (!episode) {
            return res.status(404).send('Episode not found.');
        }

        res.render(`./th/play`, {
            userID,
            play,
            liked,
            episode,
            lang
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/play`, {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang
        });
    }
};

const getPV = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        // เรียก exec() ให้ถูกต้อง
        const animepv = await Play.find().exec();
        res.json({ message: "ทำการดึงสำเร็จ", animepv });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            translations: req.translations,
            lang
        });
    }
};


const getCreateSeries = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        res.render(`./add/uploads/CreateSeries`, { 
            userID, 
            lang ,
            active: "getCreateSeries"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}

const getEditPv = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { videoid } = req.params;
    try {
        const anime = await Play.findById(videoid).exec();
        res.render(`./th/pages/admin/edit/Editvideo`, { userID, anime, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/admin/edit/Editvideo`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const postEditPV = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { videoid } = req.params;

    try {
        // รับข้อมูลจากฟอร์ม
        let { namepv, decpv, published } = req.body;

        // หา video ที่ต้องการแก้ไข
        const anime = await Play.findById(videoid).exec();
        if (!anime) {
            return res.status(404).send('Video not found.');
        }

        // อัปเดตข้อมูลวิดีโอ
        anime.namepv = namepv || anime.namepv; // อัปเดตชื่อถ้ามีค่า
        anime.decpv = decpv || anime.decpv; // อัปเดตคำอธิบายถ้ามีค่า

        // อัปเดตสถานะเผยแพร่ (published จะเป็น "on" ถ้า checkbox ถูกเลือก)
        anime.published = published === 'on';

        // บันทึกข้อมูลวิดีโอที่อัปเดตแล้วลงฐานข้อมูล
        await anime.save();

        // ส่งข้อความยืนยันการแก้ไข
        res.render(`./th/pages/admin/edit/Editvideo`, { message: "แก้ไขแล้ว", userID, anime, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/admin/edit/Editvideo`, {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang
        });
    }
}



const getepisodes = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const { playid } = req.params;
    try {
        const anime = await Play.findById(playid).exec();
        res.render(`./th/pages/admin/edit/Addepisodes`, { userID, anime, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/admin/edit/Addepisodes`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


// ================================= upload PV
const uploadPV = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    try {
        if (!req.files || !req.files.videoFile) {
            return res.status(400).send('No video file uploaded.');
        }

        const videoFile = req.files.videoFile;

        // ตรวจสอบขนาดไฟล์ไม่ให้เกิน 100MB
        if (videoFile.size > 100 * 1024 * 1024) {
            return res.status(400).send('File size exceeds 100MB limit.');
        }

        const uniqueFilename = `pv_${crypto.randomUUID()}`;

        // อัปโหลดไปที่ Cloudinary โดยใช้ buffer (videoFile.data)
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                public_id: `pv/${uniqueFilename}`,
                chunk_size: 6000000, // ขนาดของ chunk สำหรับการอัปโหลดไฟล์ใหญ่
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).send('Cloudinary upload failed.');
                }

                const newPV = new Play({
                    namepv: req.body.namepv,
                    decpv: req.body.decpv,
                    videoUrl: result.secure_url,
                    published: req.body.published === 'on',
                });

                await newPV.save();

                res.send({ message: 'Video uploaded successfully!', videoUrl: result.secure_url });
            }
        ).end(videoFile.data); // ส่งข้อมูลบัฟเฟอร์ของไฟล์ไปยัง Cloudinary
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            translations: req.translations,
            lang
        });
    }
};

// API เพื่อเพิ่มตอนใหม่ให้กับ PV
const addEpisode = async (req, res) => {
    const { playId, namepv, decpv, published } = req.body;
    const videoFile = req.files.videoFile;

    // ตรวจสอบว่ามีไฟล์วิดีโอหรือไม่
    if (!videoFile) {
        return res.status(400).send('No video file uploaded.');
    }

    // ตรวจสอบขนาดไฟล์ไม่เกิน 100MB
    if (videoFile.size > 100 * 1024 * 1024) {
        return res.status(400).send('File size exceeds 100MB limit.');
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const uniqueFilename = `episode_${crypto.randomUUID()}`;

    // สร้าง stream สำหรับการอัปโหลด
    const stream = cloudinary.uploader.upload_stream(
        {
            resource_type: 'video',
            public_id: `pv/episodes/${uniqueFilename}`,
            chunk_size: 6000000  // ขนาด chunk สำหรับการอัปโหลดไฟล์ขนาดใหญ่
        },
        async (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).send('Cloudinary upload failed.');
            }

            // หา Play ที่ต้องการเพิ่มตอน
            const play = await Play.findById(playId);
            if (!play) {
                return res.status(404).send('Play not found.');
            }

            // เพิ่มตอนใหม่ใน Play
            const newEpisode = {
                namepv,
                decpv,
                videoUrl: result.secure_url,  // ลิงก์วิดีโอที่อัปโหลด
                published: published === 'on',
            };

            play.Episodes.push(newEpisode);
            await play.save();  // บันทึกการเปลี่ยนแปลงในฐานข้อมูล

            res.status(200).json({ message: 'Episode added successfully!', play });
        }
    );

    // เขียนข้อมูลของไฟล์ลงใน stream
    stream.end(videoFile.data);
};


// API LIKE Video
const likeVideo = async (req, res) => {
    try {
        const video = await Play.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Check if the user has already liked the video
        const userLikedIndex = video.likedBy.indexOf(req.user.id);

        if (userLikedIndex !== -1) {
            // User has already liked the video, so unlike it
            video.likes -= 1;
            video.likedBy.splice(userLikedIndex, 1); // Remove the user's ID from the likedBy array
            await video.save();
            return res.status(200).json({
                message: 'Like removed successfully',
                likes: video.likes,
                liked: false
            });
        } else {
            // User has not liked the video, so like it
            video.likes += 1;
            video.likedBy.push(req.user.id); // Add the user's ID to the likedBy array
            await video.save();
            return res.status(200).json({
                message: 'Like added successfully',
                likes: video.likes,
                liked: true
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const DeteleSeriesMedia = async (req, res) => {
    const { id: SeriesID } = req.params;
    try {
        await Play.findByIdAndDelete(SeriesID);
        res.json({ message: "ลบ SeriesID สำเร็จ" });
    } catch (error) {
        const errorMessage = error.message || "Internal Server Error";
        res.status(500).json({
            error: errorMessage
        });
    }
}; 


module.exports = {
    getPlay,
    getPlayEpisodes,
    getepisodes,
    getPV,
    getEditPv,
    getCreateSeries,
    uploadPV,
    postEditPV,
    addEpisode,
    likeVideo,
    DeteleSeriesMedia
}