const User = require("../models/UserModel");
const Anime = require("../models/AnimeModel")
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")
const s3 = require("../aws")
require("dotenv").config

const getAnime = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = req.params.lang || 'th';
    try {
        res.render("./pages/admin/add/anime", { userID, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/add/anime', {
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
    const lang = req.params.lang || 'th';
    const { id } = req.query;
    try {
        const anime = await Anime.findById(id).exec();
        res.render("./pages/admin/add/streaming/stream", { userID, anime, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/add/streaming/stream', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}

// ================================================================ update stream ========================================
// =======================================================================================================================
const updateAnimeStream = async (req, res) => {
    const userID = req.session.userlogin;
    const lang = req.params.lang || 'th';
    const { id } = req.params; // ดึง ID จาก params
    const { crunchyroll, bilibili, iqiyi } = req.body; // ดึงข้อมูลที่ส่งมาจากฟอร์ม

    try {
        // ค้นหาข้อมูลอนิเมะที่ต้องการอัปเดต
        const anime = await Anime.findById(id).exec();

        if (!anime) {
            return res.status(404).render('./pages/admin/add/streaming/stream', {
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
        res.status(200).render('./pages/admin/add/streaming/stream', {
            message: 'Anime updated successfully',
            userID,
            anime,
            translations: req.translations, lang
        });

    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/add/streaming/stream', {
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
    const lang = req.params.lang || 'th';
    const { id } = req.query; // แก้ไขการดึง id จาก req.query
    try {
        const edit = await Anime.findById(id).exec();
        console.log(edit)
        if (!edit) {
            return res.status(404).render('./pages/admin/edit/anime', {
                error: 'Anime not found',
                userID,
                translations: req.translations, lang
            });
        }
        res.render("./pages/admin/edit/anime", { userID, edit, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/edit/anime', {
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
    const lang = req.params.lang || 'th';
    const { title, synopsis, animetype, voice, season, price, platforms, year, month, status, urlslug, categories } = req.body;
    const poster = req.files.poster;
    try {
        if (!title || !animetype || !year || !month || !status || !urlslug)
            return res.status(404).render('./pages/admin/add/anime', { message: "โปรดกรองข้อมูลให้ครบทุกช่องที่จำเป็น", userID, translations: req.translations, lang })

        if (!poster) {
            return res.status(404).render("./pages/admin/add/anime", { message: "ไม่พบ poster", userID, translations: req.translations, lang })
        }

        // ตรวจสอบ urlslug
        const existingUrlslug = await Anime.findOne({ urlslug });
        if (existingUrlslug) {
            return res.status(400).render('./pages/admin/add/anime', { error: 'urlslug นี้ไม่ว่าง', userID, translations: req.translations, lang });
        }

        const generateFilename = (file) => {
            let splittedFilename = file.name.split('.');
            return crypto.randomUUID() + '.' + splittedFilename[splittedFilename.length - 1];
        };

        // อัปโหลด
        let posterFilename = generateFilename(poster);
        let posterUploadPath = path.join(__dirname, '..', 'public/uploads/posters', posterFilename);

        try {
            await poster.mv(posterUploadPath);
            console.log('Uploaded to local server:', posterUploadPath);
        } catch (error) {
            console.log('Local upload failed, attempting S3 upload or external server upload:', error.message);

            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `posters/${posterFilename}`,
                Body: poster.data,
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
                    console.error('External server upload failed:', serverError.message);
                    return res.status(500).render('./pages/admin/add/anime', {
                        error: 'ไม่สามารถอัปโหลด poster ได้',
                        userID,
                        translations: req.translations,
                        lang
                    });
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
        console.log(postcreate)
        await User.findByIdAndUpdate(req.user.id, { $push: { animelists: postcreate._id } }, { new: true });
        res.status(200).render("./pages/admin/add/anime", { message: "สร้างสำเร็จ", userID, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/add/anime', {
            error: errorMessage,
            userID,
            translations: req.translations, lang
        });
    }
}


// ============================================================ Edit Anime Post INFO ==============================
// ================================================================================================================
const EditAnimeinfo = async (req, res) => {
    const userID = req.session.userlogin;
    const id = req.body.update_id;
    const lang = req.params.lang || 'th';
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
                return res.status(400).render('./pages/admin/edit/anime', { error: `Image size exceeds 5MB limit`, userID, edit, translations: req.translations, lang });
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
                return res.status(500).render('./pages/admin/edit/anime', { error: `Error uploading new poster: ${err}`, userID, edit, translations: req.translations, lang });
            }
        }

        const updatedPost = await Anime.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedPost) {
            return res.status(400).render('./pages/admin/edit/anime', { error: "Couldn't update post.", userID, edit, translations: req.translations, lang });
        }

        res.status(200).render('./pages/admin/edit/anime', { message: `อัปเดตสำเร็จ`, userID, edit: updatedPost, translations: req.translations, lang });
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/admin/edit/anime', {
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
    const lang = req.params.lang || 'th';
    try {
        const Animelists = await Anime.find().sort({ createdAt: -1 }).exec();

        res.render("./pages/schedulePages/index", { userID, Animelists, translations: req.translations, lang })
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        res.status(500).render('./pages/schedulePages/index', {
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
    getAnimeStreem,
    CreateanimeItem,
    getSchedule,
    getScheduleAPI,
    getInfiniteScroll,
    getEditAnime,
    EditAnimeinfo,
    deleteAnime,
    updateAnimeStream,
    BookmarkSaveAnime,
    UnbookmarkBookmarkSaveAnime
}