const Play = require("../models/PlayModel")
const User = require("../models/UserModel")
const cloudinary = require('cloudinary').v2;
const crypto = require("crypto")
const generateUniqueVideoId = require("../utils/generateUniqueVideoId")
const { v4: uuidv4 } = require('uuid');

require("dotenv").config

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getMedia = async (req, res) => {
    const videoid = req.params;
    const lang = res.locals.lang;
    const userID = req.session?.userlogin;
    try {
        const media = await Play.findOne(videoid).populate('episodes');
        if (!media) {
            return res.status(404).send('Video not found.');
        }
        // const liked = userID ? media.likedBy.includes(userID.user._id) : false;
        // console.log("Play Main", play)
        res.render(`./media/pages/media`, {
            userID,
            lang,
            media,
            active: "media"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage
        })
    }
}
// const getPlayEpisodes = async (req, res) => {
//     const { videoid, episodeid } = req.params;
//     const lang = res.locals.lang;
//     const userID = req.session.userlogin;
//     try {
//         const play = await Play.findById(videoid).populate('Episodes');
//         if (!play) {
//             return res.status(404).send('Video not found.');
//         }
//         // console.log("Play Episodes", play);
//         const liked = userID ? play.likedBy.includes(userID.user._id) : false;
//         // ค้นหาตอนที่ตรงกับ episodeid
//         const episode = play.Episodes.id(episodeid);
//         if (!episode) {
//             return res.status(404).send('Episode not found.');
//         }

//         res.render(`./th/play`, {
//             userID,
//             play,
//             liked,
//             episode,
//             lang
//         });
//     } catch (error) {
//         const errorMessage = error.message || 'Internal Server Error';
//         res.status(500).render(`./th/play`, {
//             error: errorMessage,
//             userID,
//             translations: req.translations,
//             lang
//         });
//     }
// };

const getSeriesmedias = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        // เรียก exec() ให้ถูกต้อง
        const medias = await Play.find().exec();
        res.status(200).json({
            status: 200,
            message: "ข้อมูลวีดีซีรีย์",
            medias
        })
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
const getSeriesmediaitem = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const videoid = req.params;
        const media = await Play.findOne(videoid).exec();
        res.status(200).json({
            status: 200,
            message: "ข้อมูลวีดีซีรีย์",
            media
        })
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
const getSeriesmediaitemEP = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const { seriesVideoid, episodeVideoid } = req.params;
        const media = await Play.findOne({ videoid: seriesVideoid })
            .exec();

        if (!media) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูลซีรีส์",
            });
        }

        const episode = media.episodes.find(ep => ep.videoid === episodeVideoid);

        if (!episode) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูลตอนที่ระบุ",
            });
        }

        res.status(200).json({
            status: 200,
            message: "ข้อมูลตอนที่ระบุในซีรีส์",
            series: {
                videoid: media.videoid,
                title: media.title,
                description: media.description,
                poster: media.poster,
                categories: media.categories
            },
            episode
        });
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

// ==================================================== Get Play Ejs ====================================================
// ======================================================================================================================
const getPlayEpisode = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    try {
        const { seriesVideoid, episodeVideoid } = req.params;
        const media = await Play.findOne({ videoid: seriesVideoid })
            .exec();

        if (!media) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูลซีรีส์",
            });
        }

        const episode = media.episodes.find(ep => ep.videoid === episodeVideoid);

        if (!episode) {
            return res.status(404).json({
                status: 404,
                message: "ไม่พบข้อมูลตอนที่ระบุ",
            });
        }

        res.status(200).render('./media/pages/play', {
            series: media,
            episode,
            active: "Play"
        })
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
            lang,
            active: "getCreateSeries"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}

// =================================================== post createSeries ============================================
const CreateSeries = async (req, res) => {
    try {
        const { title, description, genres, categories, published } = req.body;
        const poster = req.files?.poster;

        if (!poster) {
            return res.status(400).json({ error: 'Poster file is required.' });
        }

        const videoid = await generateUniqueVideoId(Play);


        cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                public_id: `poster/${videoid}`,
                chunk_size: 5000000,
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).send('Cloudinary upload failed.');
                }

                const newSeries = new Play({
                    videoid,
                    title,
                    description,
                    poster: result.secure_url,
                    genres,
                    categories,
                    published: published === 'on',
                });

                await newSeries.save();

                res.status(200).redirect(
                    `/create/Series/media?msg=สร้างซีรีย์สำเร็จแล้ว&status=true&dataid=${newSeries.videoid}`
                );
            }
        ).end(poster.data);
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
    }
}

const getEditseriesmedia = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;
    const videoid = req.params;
    try {
        const series = await Play.findOne(videoid).exec();
        res.render(`./edit/Editseries`, {
            userID,
            series,
            lang,
            active: "getEditseriesmedia"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
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

const getEpisodesSubtitle = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    try {
        const { id: episodeId } = req.params; // เปลี่ยนไปใช้ episodeId ที่ส่งมาใน URL

        // ค้นหา Episode ภายในทุกวิดีโอ
        const play = await Play.findOne({ "episodes.videoid": episodeId });
        if (!play) {
            return res.status(404).json({ message: 'Video not found.' });
        }

        // ดึงข้อมูล Episode ที่ตรงกับ videoid
        const episode = play.episodes.find(ep => ep.videoid === episodeId);
        if (!episode) {
            return res.status(404).json({ message: 'Episode not found.' });
        }

        console.log("ข้อมูล Episode:", episode);

        // ส่งข้อมูลไป render หน้า view
        res.render(`./add/subtitle`, {
            userID,
            item: play,
            episode,
            lang,
            active: "getEpisodesSubtitle"
        });
    } catch (error) {
        console.error("Error fetching episode:", error);
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        });
    }
};



const getEpisodesSeries = async (req, res) => {
    const lang = res.locals.lang;
    const userID = req.session.userlogin;

    try {
        const { id: playid } = req.params;

        const series = await Play.findById(playid).exec();
        res.render(`./add/uploads/EpisodeSeries`, {
            userID,
            series,
            lang,
            active: "getEpisodesSeries"
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
        })
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
    try {
        const { id: seriesId } = req.params;
        const { title, episodenumber, published } = req.body;
        const videoFile = req.files?.videoFile;

        if (!videoFile) {
            return res.status(400).json('No video file uploaded.');
        }

        const series = await Play.findById(seriesId);

        const videoid = await generateUniqueVideoId(Play);

        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }

        if (videoFile.size > 100 * 1024 * 1024) {
            return res.status(400).json('File size exceeds 100MB limit.');
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                public_id: `episodes/${videoid}`,
                chunk_size: 6000000
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json('Cloudinary upload failed.');
                }

                const newEpisode = {
                    title,
                    episodenumber,
                    videoUrl: result.secure_url,
                    videoid: videoid,
                    published: published === 'on',
                };

                series.episodes.push(newEpisode);
                await series.save();

                // res.status(200).redirect(`/add/episodes/${seriesId}/Series?msg=เพิ่มตอนใหม่สำเร็จ&status=true&Epid=${newEpisode.videoid}`)
                res.status(200).json({
                    status: 200,
                    msg: "พิ่มตอนใหม่สำเร็จ",
                    id: newEpisode.videoid
                })
            }
        );
        stream.end(videoFile.data);

    } catch (error) {
        res.status(500).json(error)
    }
};

const addSubtitleEpisode = async (req, res) => {
    try {
        const { id: videoId } = req.params;
        const { label, language } = req.body;
        const subtitlefile = req.files?.subtitlefile;

        if (!subtitlefile) {
            return res.status(400).json({ message: 'Subtitle file is required.' });
        }

        // Find the specific episode by videoId
        const play = await Play.findOne({ 'episodes.videoid': videoId });
        if (!play) {
            return res.status(404).json({ message: 'Video not found.' });
        }

        const episode = play.episodes.find(ep => ep.videoid === videoId);
        if (!episode) {
            return res.status(404).json({ message: 'Episode not found.' });
        }
        console.log("ข้อมุลตอนที่เจอ", episode)

        const subID = uuidv4();
        const fileExtension = subtitlefile.name.split('.').pop();

        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                public_id: `subtitles/${subID}.${fileExtension}`,
                chunk_size: 6000000
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ message: 'Cloudinary upload failed.', error });
                }

                const subtitleEntry = {
                    [language]: {
                        label: label || language.toUpperCase(),
                        fileurl: result.secure_url,
                    },
                };

                episode.subtitles.push(subtitleEntry);
                await play.save();

                console.log(episode.subtitles)

                return res.status(200).json({
                    message: 'Subtitle uploaded successfully.',
                    subtitle: subtitleEntry,
                });
            }
        );
        stream.end(subtitlefile.data);

    } catch (error) {
        const errorMessage = error.message || "Internal Server Error";
        res.status(500).json({
            error: errorMessage
        });
    }
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
    getMedia,
    getSeriesmediaitemEP,
    // getPlayEpisodes,
    getEpisodesSeries,
    getEpisodesSubtitle,
    getSeriesmedias,
    getSeriesmediaitem,
    getPlayEpisode,
    getEditseriesmedia,
    getCreateSeries,
    CreateSeries,
    uploadPV,
    postEditPV,
    addEpisode,
    addSubtitleEpisode,
    likeVideo,
    DeteleSeriesMedia
}