const User = require("../models/UserModel");
const Anime = require("../models/AnimeModel")
const path = require("path")
const FormData = require('form-data');
const fs = require("fs")
const crypto = require("crypto")
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const s3 = require("../aws")
require("dotenv").config

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const getAnime = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        res.render(`${lang}/pages/admin/add/anime`, { userID, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/admin/add/anime`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const getCharacters = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { id } = req.query;
    try {
        const anime = await Anime.findById(id).exec();
        res.render(`./th/pages/admin/add/characters`, { userID, anime, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/admin/add/characters`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const getPVAnime = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { id } = req.query;
    try {
        const anime = await Anime.findById(id).exec();
        res.render(`./th/pages/admin/add/pvAnime`, { userID, anime, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/admin/add/pvAnime`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

// ============================================================= ADD Streem =====================================
// ==============================================================================================================
const getAnimeStreem = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { id } = req.query;
    try {
        const anime = await Anime.findById(id).exec();
        res.render(`${lang}/pages/admin/add/streaming/stream`, { userID, anime, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/admin/add/streaming/stream`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const getAnimeStreemYoutube = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { id } = req.query;
    try {
        const anime = await Anime.findById(id).exec();
        // console.log("youtube",anime)
        res.render(`./th/pages/admin/add/streaming/youtube`, { userID, anime, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/admin/add/streaming/youtube`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

const updateAnimeYoutubeLinks = async (req, res) => {
    const { muse, anione, pops } = req.body;
    const { id } = req.params || req.query;
  
    try {
      // ตรวจสอบว่ามีข้อมูล YouTube อยู่ในฐานข้อมูลแล้วหรือไม่
      const anime = await Anime.findById(id).exec();
  
      if (anime) {
        // ตรวจสอบว่ามีข้อมูล streaming หรือยัง ถ้าไม่มี ให้สร้างเป็น array ว่าง
        if (!anime.streaming || anime.streaming.length === 0) {
          anime.streaming = [{ youtubes: [{ muse, anione, pops }] }];
        } else {
          // ตรวจสอบว่า streaming[0] มี youtubes หรือยัง ถ้าไม่มีให้สร้างใหม่
          if (!anime.streaming[0].youtubes || anime.streaming[0].youtubes.length === 0) {
            anime.streaming[0].youtubes = [{ muse, anione, pops }];
          } else {
            // อัปเดตข้อมูลที่มีอยู่แล้วใน youtubes
            anime.streaming[0].youtubes[0].muse = muse;
            anime.streaming[0].youtubes[0].anione = anione;
            anime.streaming[0].youtubes[0].pops = pops;
          }
        }
  
        await anime.save();
        // console.log("anime yt", anime);
        res.redirect(`/admin/add/anime/streem/youtube/?id=${id}`);
      } else {
        res.status(404).send("ไม่พบอนิเมะที่ต้องการอัพเดต");
      }
    } catch (error) {
      res.status(500).send(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };
  
// ================================================================ update stream ========================================
// =======================================================================================================================
const updateAnimeStream = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { id } = req.params; // ดึง ID จาก params
    const { crunchyroll, bilibili, iqiyi } = req.body; // ดึงข้อมูลที่ส่งมาจากฟอร์ม

    try {
        // ค้นหาข้อมูลอนิเมะที่ต้องการอัปเดต
        const anime = await Anime.findById(id).exec();

        if (!anime) {
            return res.status(404).render(`${lang}/pages/admin/add/streaming/stream`, {
                error: 'Anime not found',
                userID,
                translations: req.translations, lang
            });
        }

        // อัปเดตข้อมูลอนิเมะ
        anime.streaming = [{
            crunchyroll,
            bilibili,
            iqiyi
        }];

        // บันทึกการเปลี่ยนแปลง
        await anime.save();

        // รีไดเร็กต์หรือเรนเดอร์หน้าใหม่ตามต้องการ
        res.status(200).render(`${lang}/pages/admin/add/streaming/stream`, {
            message: 'Anime updated successfully',
            userID,
            anime,
            translations: req.translations, lang
        });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/admin/add/streaming/stream`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

// ======================================================= GET EDIT ANIME ========================================
// ===============================================================================================================

const getEditAnime = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { id } = req.query; // แก้ไขการดึง id จาก req.query
    try {
        const edit = await Anime.findById(id).exec();
        console.log(edit)
        if (!edit) {
            return res.status(404).render(`${lang}/pages/admin/edit/anime`, {
                error: 'Anime not found',
                userID,
                translations: req.translations, lang
            });
        }
        res.render(`${lang}/pages/admin/edit/anime`, { userID, edit, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/admin/edit/anime`, {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

// ==================================================================== CREATE ANIME =====================================
// ======================================================================================================================
const CreateanimeItem = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { title, synopsis, animetype, voice, season, price, platforms, year, month, status, urlslug, categories } = req.body;
    const poster = req.files.poster;
    
    try {
        if (!title || !animetype || !year || !month || !status || !urlslug) {
            return res.status(404).render(`${lang}/pages/admin/add/anime`, { message: "โปรดกรองข้อมูลให้ครบทุกช่องที่จำเป็น", userID, translations: req.translations, lang });
        }

        if (!poster) {
            return res.status(404).render(`${lang}/pages/admin/add/anime`, { message: "ไม่พบ poster", userID, translations: req.translations, lang });
        }

        // ตรวจสอบ urlslug
        const existingUrlslug = await Anime.findOne({ urlslug });
        if (existingUrlslug) {
            return res.status(400).render(`${lang}/pages/admin/add/anime`, { error: 'urlslug นี้ไม่ว่าง', userID, translations: req.translations, lang });
        }

        const generateFilename = (file) => {
            let splittedFilename = file.name.split('.');
            return crypto.randomUUID() + '.' + splittedFilename[splittedFilename.length - 1];
        };

        let posterFilename = generateFilename(poster);
        let posterUploadPath = path.join(__dirname, '..', 'public/uploads/posters', posterFilename);

        try {
            // อัปโหลดไปยัง local server
            await poster.mv(posterUploadPath);
            console.log('Uploaded to local server:', posterUploadPath);
        } catch (error) {
            console.log('Local upload failed, attempting S3 upload or external server upload:', error.message);

            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME, // แก้ไขการสะกด
                Key: `posters/${posterFilename}`,
                Body: poster.data, // แก้ไขการสะกด
                ContentType: poster.mimetype,
                ACL: 'public-read'
            };

            try {
                // ลองอัปโหลดไปยัง S3
                const uploadResult = await s3.upload(params).promise();
                posterFilename = uploadResult.Location; // เก็บ URL ของไฟล์ที่ S3
                console.log('Uploaded to S3:', posterFilename);
            } catch (s3Error) {
                console.log('S3 upload failed, attempting to upload to external server:', s3Error.message);

                // ลองยิงภาพไปเก็บที่ server สำรอง
                try {
                    const uploadResponse = await axios.post('https://sv2-pic.ani-night.online/api/v2/upload/file/to/server', poster.data, {
                        headers: {
                            'Content-Type': poster.mimetype
                        }
                    });
                    posterFilename = uploadResponse.data.url; // เก็บ URL ของไฟล์ที่ server อื่น
                    console.log('Uploaded to external server:', posterFilename);
                } catch (serverError) {
                    console.error('External server upload failed, attempting Cloudinary upload:', serverError.message);

                    // Attempt Cloudinary upload
                    try {
                        const uploadResponse = await new Promise((resolve, reject) => {
                            cloudinary.uploader.upload_stream(
                                { resource_type: 'image', public_id: `posters/${generateFilename(poster)}` },
                                (error, result) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve(result.secure_url);
                                    }
                                }
                            ).end(poster.data); // ส่งข้อมูลไฟล์ไปยัง Cloudinary
                        });
                        posterFilename = uploadResponse;
                        console.log('Uploaded to Cloudinary:', posterFilename);
                    } catch (cloudinaryError) {
                        console.error('Cloudinary upload failed:', cloudinaryError.message);
                        return res.status(500).render(`${lang}/pages/admin/add/anime`, {
                            error: 'ไม่สามารถอัปโหลด poster ได้',
                            userID,
                            translations: req.translations,
                            lang
                        });
                    }
                }
            }
        }

        const postcreate = new Anime({
            title,
            synopsis,
            animetype,
            voice,
            price,
            season,
            platforms: Array.isArray(platforms) ? platforms : [platforms],
            year,
            month,
            status,
            published: req.body.published === 'on',
            urlslug,
            poster: posterFilename,
            categories: Array.isArray(categories) ? categories : [categories]
        });

        await postcreate.save();
        console.log(postcreate);
        await User.findByIdAndUpdate(req.user.id, { $push: { animelists: postcreate._id } }, { new: true });
        res.status(200).render(`${lang}/pages/admin/add/anime`, { message: "สร้างสำเร็จ", userID, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/admin/add/anime`, {
            error: errorMessage,
            userID,
            translations: req.translations,
            lang
        });
    }
}



// ============================================= Crate characters ================================
// ===============================================================================================
const Createcharacters = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const animeId = req.body.animeId; 
    const { name, role } = req.body;
    const imagecharacters = req.files.image;

    try {
        // เช็คว่ามีรูปภาพหรือไม่
        if (!imagecharacters) {
            throw new Error('กรุณาเลือกรูปภาพสำหรับตัวละคร');
        }

        // สร้าง formData สำหรับการอัปโหลดรูปภาพ
        const formData = new FormData();
        formData.append('image', imagecharacters.data, imagecharacters.name);

        const uploadResponse = await axios.post('https://sv5.ani-night.online/api/upload/characters', formData, {
            headers: {
                ...formData.getHeaders() 
            }
        });

        // รับ URL ของรูปภาพที่อัปโหลดสำเร็จ
        const imageUrl = uploadResponse.data.url;

        // สร้างตัวละครใหม่
        const newCharacter = {
            name,
            role,
            imageUrl
        };
        const anime = await Anime.findById(animeId);

        if (!anime) {
            throw new Error('ไม่พบอนิเมะที่ระบุ');
        }

        // เพิ่มตัวละครลงในรายการตัวละครของอนิเมะ
        anime.characters.push(newCharacter);
        await anime.save();
        // console.log("บันทึกตัวละคร", anime.characters);

        // อัปเดตข้อมูลของผู้ใช้
        await User.findByIdAndUpdate(req.user.id, { $push: { animelists: anime._id } }, { new: true });

        // ตอบกลับสำเร็จ
        res.status(200).render(`./th/pages/admin/add/characters`, { 
            message: "สร้างสำเร็จ", 
            anime,
            userID, 
            translations: req.translations, 
            lang 
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/admin/add/characters`, {
            error: errorMessage,
            userID,
            anime: animeId,
            translations: req.translations,
            lang
        });
    }
}

const getAddActorToCharacter = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { animeId, characterId } = req.query;
    try {
        
        const anime = await Anime.findById(animeId).exec();
        if (!anime) {
            throw new Error('ไม่พบอนิเมะที่ระบุ');
        }

        console.log("anime", anime)

        res.status(200).render(`./th/pages/admin/add/actor`, {
            userID,
            anime,
            translations: req.translations,
            lang
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        console.log(errorMessage)
        res.status(500).render(`./th/pages/admin/add/actor`, {
            error: errorMessage,
            userID,
            anime: animeId,
            translations: req.translations,
            lang
        });
    }
}


const AddActorToCharacter = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    const { animeId, characterId } = req.body; // ใช้ req.body เพื่อให้ชัดเจน
    const { actorName, actorRole } = req.body;
    const imagecharacters = req.files?.image;

    try {
        if (!animeId || animeId.trim() === '') {
            return res.status(400).send('animeId ไม่ถูกต้อง');
        }

        if (!characterId || characterId.trim() === '') {
            return res.status(400).send('characterId ไม่ถูกต้อง');
        }

        const anime = await Anime.findById(animeId).exec();
        if (!anime) {
            throw new Error('ไม่พบอนิเมะที่ระบุ');
        }

        // ค้นหาตัวละครที่ต้องการเพิ่มนักพากย์ โดยใช้ characterId
        const character = anime.characters.id(characterId);
        if (!character) {
            throw new Error('ไม่พบตัวละครที่ระบุ');
        }

        // ตรวจสอบว่ามีข้อมูลนักพากย์ครบถ้วน
        if (!actorName || !actorRole || !imagecharacters) {
            throw new Error('กรุณากรอกข้อมูลนักพากย์ให้ครบถ้วน');
        }

        // สร้าง formData สำหรับการอัปโหลดรูปภาพ
        const formData = new FormData();
        formData.append('image', imagecharacters.data, imagecharacters.name);

        const uploadResponse = await axios.post('https://sv5.ani-night.online/api/upload/actor', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // รับ URL ของรูปภาพที่อัปโหลดสำเร็จ
        const imageUrl = uploadResponse.data.url;

        // สร้างข้อมูลนักพากย์ใหม่
        const newActor = {
            name: actorName,
            role: actorRole,
            imageUrl: imageUrl
        };

        // เพิ่มนักพากย์ลงในตัวละคร
        character.actor.push(newActor);
        await anime.save();

        res.status(200).render(`./th/pages/admin/add/actor`, {
            message: "เพิ่มนักพากย์สำเร็จ", 
            anime,
            userID,
            translations: req.translations,
            lang
        });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        console.log(errorMessage);
        res.status(500).render(`./th/pages/admin/add/actor`, {
            error: errorMessage,
            userID,
            anime: animeId,
            translations: req.translations,
            lang
        });
    }
}


// ============================================================ Edit Anime Post INFO ==============================
// ================================================================================================================
const EditAnimeinfo = async (req, res) => {
    const userID = req.session.userlogin;
    const id = req.body.update_id;
    const lang = res.locals.lang;
    const { title, synopsis, animetype, voice, season, price, platforms, year, month, status, urlslug, categories, published, studio, Source, Licensors, website, Episodes, Duration, type } = req.body;

    try {
        const searchanime = await Anime.findById(id).exec();
        const edit = await Anime.findById(id).exec();

        const isPublished = published === 'on' || published === true;

        if (!searchanime) {
            return res.status(404).json({
                error: 'Anime not found',
                userID,
                edit,
                translations: req.translations,
                lang
            })
        }

        let updateData = { title, synopsis, animetype, voice, season, price, platforms, year, month, status, urlslug, categories, published: isPublished, studio, Source, Licensors, website, Episodes, Duration, type };

        if (req.files && req.files.poster) {
            const poster = req.files.poster;
            if (poster.size > 5000000) {
                return res.status(400).render(`${lang}/pages/admin/edit/anime`, { error: `Image size exceeds 5MB limit`, userID, edit, translations: req.translations, lang });
            }

            const fileName = poster.name;
            const splittedFilename = fileName.split('.');
            const newFilename = crypto.randomUUID() + "." + splittedFilename[splittedFilename.length - 1];
            const newThumbnailPath = path.join(__dirname, '..', 'public/uploads/posters', newFilename);

            try {
                await poster.mv(newThumbnailPath);
                updateData.poster = newFilename;

                // Delete old poster if exists
                if (searchanime.poster) {
                    const oldThumbnailPath = path.join(__dirname, '..', 'public/uploads/posters', searchanime.poster);
                    fs.unlink(oldThumbnailPath, (err) => {
                        if (err) console.error("Error deleting old poster:", err);
                    });
                }
            } catch (err) {
                return res.status(500).render(`${lang}/pages/admin/edit/anime`, { error: `Error uploading new poster: ${err}`, userID, edit, translations: req.translations, lang });
            }
        }

        const updatedPost = await Anime.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedPost) {
            return res.status(400).render(`${lang}/pages/admin/edit/anime`, { error: "Couldn't update post.", userID, edit, translations: req.translations, lang });
        }

        res.status(200).render(`${lang}/pages/admin/edit/anime`, { message: `อัปเดตสำเร็จ`, userID, edit: updatedPost, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`${lang}/pages/admin/edit/anime`, {
            error: errorMessage,
            userID,
            edit,
            translations: req.translations,
            lang
        });
    }
}

// ============================================================= Delete Anime ======================================
// =================================================================================================================
const deleteAnime = async (req, res) => {
    const userID = req.session.userlogin;
    const user = req.user.id
    const { anime_id } = req.body;

    try {
        const anime = await Anime.findById(anime_id).exec();
        const animelists = await Anime.find().exec();

        if (!anime) {
            return res.status(404).render('./pages/admin/anime-list', {
                error: 'Anime not found',
                userID
            });
        }

        // ลบภาพโปสเตอร์ที่เกี่ยวข้องหากมี
        if (anime.poster) {
            const posterPath = path.join(__dirname, '..', 'public/uploads/posters', anime.poster);
            fs.unlink(posterPath, (err) => {
                if (err) console.error("Error deleting poster:", err);
            });
        }

        // ลบอนิเมะจากฐานข้อมูล
        await Anime.findByIdAndDelete(anime_id);

        // อัปเดตผู้ใช้ (ถ้ามีการจัดการอนิเมะในรายการของผู้ใช้)
        if (userID) {
            const user = await User.findById(req.user.id).exec();
            if (user) {
                user.animelists = user.animelists.filter(id => id.toString() !== anime_id);
                await user.save();
            }
        }

        res.status(200).redirect('/admin/manage/anime'); // เปลี่ยนเป็นหน้าที่คุณต้องการให้เปลี่ยนไปหลังลบสำเร็จ
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/manage/manage_anime', {
            error: errorMessage,
            userID,
            animelists
        });
    }
}


// =========================================================== scheduleAnime ======================================
// ===================================================================================================
const getSchedule = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = res.locals.lang;
    try {
        const Animelists = await Anime.find().sort({ createdAt: -1 }).exec();

        res.render(`./th/pages/schedulePages/index`, { userID, Animelists, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render(`./th/pages/schedulePages/index`, {
            error: errorMessage,
            userID,
            lang
        });
    }
}

// =========================================================== scheduleAnime API V2 ======================================
// ===================================================================================================
const getScheduleAPI = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = req.params.lang || 'th';
    try {
        const Animelists = await Anime.find().sort({ createdAt: -1 }).exec();

        res.json({
            userID,
            Animelists,
            translations: req.translations,
            lang
        })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).json({
            error: errorMessage,
            userID,
            lang
        })
    }
}


// =========================================================== BookmarkSaveAnime ======================================
// ===================================================================================================
const BookmarkSaveAnime = async (req, res) => {
    const userID = req.session.userlogin;
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
        }

        const { animeid } = req.body;

        if (!animeid) {
            return res.status(400).json({ success: false, message: 'ไม่พบ ID ของบทความ' });
        }

        const animeindex = user.saveanime.indexOf(animeid);

        // Toggle save/remove logic
        if (animeindex === -1) {
            // Save the article
            user.saveanime.push(animeid);
            await user.save();
            return res.status(200).json({ success: true, message: 'บันทึกรายการอนิเมะสำเร็จ' });
        } else {
            // Remove the article
            user.saveanime.splice(animeindex, 1);
            await user.save();
            return res.status(200).json({ success: true, message: 'ยกเลิกการบันทึกรายการอนิเมะแล้ว' });
        }

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์', error: errorMessage });
    }
}

// =========================================================== UnbookmarkBookmarkSaveAnime ======================================
// ===================================================================================================
const UnbookmarkBookmarkSaveAnime = async (req, res) => {
    const { animeId } = req.params;

    try {
        const anime = await Anime.findById(animeId);
        if (!anime) {
            return res.status(404).json({ error: 'Anime not found' });
        }

        // Remove anime from user's saved list
        req.user.id.saveanime.pull(animeId);
        await req.user.id.save();

        res.json({ message: 'Anime unbookmarked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error unbookmarking anime' });
    }
}


// =========================================================== infinite scroll ======================================
// ===================================================================================================
const getInfiniteScroll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const Animelists = await Anime.find().skip(skip).limit(limit).exec();

        // ถ้าไม่มีข้อมูลแล้ว
        if (!Animelists.length) {
            return res.json({ html: null });
        }

        // Render ข้อมูลใหม่เป็น HTML แล้วส่งกลับไป
        const renderedHtml = ejs.render(`
            <% Animelists.forEach(anime => { %>
                <% if (anime.published) {%>
                    <div class="anime-card bg-white shadow rounded overflow-hidden w-[200px] h-[400px]"
                        data-animetype="<%= anime.animetype %>" data-categories="<%= anime.categories %>" data-voice="<%= anime.voice %>"
                        data-price="<%= anime.price %>" data-year="<%= anime.year %>"
                        data-status="<%= anime.status ? 'completed' : 'incomplete' %>" data-season="<%= anime.season %>"
                        data-month="<%= anime.month %>" 
                        <% if(anime.platforms && anime.platforms.length > 0) { %>
                            data-platforms="<%= JSON.stringify(anime.platforms) %>"
                        <% } %>>
                    
                        <picture class="relative">
                            <img width="400px" height="600px"
                            src="<%= anime.poster ? '/uploads/posters/' + anime.poster : 'https://via.placeholder.com/400x200' %>"
                            alt="<%= anime.title %>">
                            <span class="absolute top-0 left-0 bg-sky-400 rounded text-white px-3">ปี <%= anime.year %></span>
                            <streeming class="absolute bottom-1 left-1 flex gap-2 select-none pointer-events-none items-center">
                                <% if (anime.platforms.includes('crunchyroll')) { %>
                                    <img src="/logo/crunchyroll_icon.png" alt="crunchyroll" class="w-7 h-7 pointer-events-none rounded-full">
                                <% } %>
                                <% if (anime.platforms.includes('bilibili')) { %>
                                    <img src="/logo/bilibili-icon.png" alt="bilibili" class="w-7 h-7 pointer-events-none rounded-full">
                                <% } %>
                                <% if (anime.platforms.includes('iqiyi')) { %>
                                    <img src="/logo/iqiyi_icon.png" alt="iqiyi" class="w-7 h-7 pointer-events-none rounded-full">
                                <% } %>
                                
                            </streeming>
                        </picture>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold">
                                <%= anime.title %>
                            </h3>
                            <p class="text-gray-600 text-sm">
                                <%= anime.voice %> • <%= anime.categories %>
                            </p>
                           
                        </div>
                    </div>
                     <% } %>
            <% }) %>
        `, { Animelists });

        res.json({ html: renderedHtml });
    } catch (error) {
        console.error(error);
        res.status(500).json({ html: null });
    }
}

module.exports = {
    getAnime,
    getCharacters,
    getPVAnime,
    getAnimeStreem,
    getAnimeStreemYoutube,
    CreateanimeItem,
    Createcharacters,
    getAddActorToCharacter,
    AddActorToCharacter,
    getSchedule,
    getScheduleAPI,
    getInfiniteScroll,
    getEditAnime,
    EditAnimeinfo,
    deleteAnime,
    updateAnimeStream,
    BookmarkSaveAnime,
    UnbookmarkBookmarkSaveAnime,
    updateAnimeYoutubeLinks
}