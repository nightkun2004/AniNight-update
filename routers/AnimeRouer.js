const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { CreateanimeItem,  Createcharacters, AddAnimescheduleTimeline,AddActorToCharacter, AddAnimeschedule, EditActorInCharacter, updateAnimeYoutubeLinks, getScheduleAPI, EditAnimeTitle, EditAnimeinfo, deleteAnime, updateAnimeStream, BookmarkSaveAnime, ratingAnime, addCommentAnime, UnbookmarkBookmarkSaveAnime } = require("../Controllers/AnimeController")

router.get("/schedule/anime/lists", getScheduleAPI)
// ===================================================== Create Anime ======================================
// =========================================================================================================
router.post("/anime/add/new",checkAuth , authMiddleware, CreateanimeItem)
router.post("/anime/add/characters",checkAuth , authMiddleware, Createcharacters)
router.post("/admin/edit/anime/voice/actor",checkAuth , authMiddleware, AddActorToCharacter)
router.post("/admin/edit/anime/voice/actor/edit/new",checkAuth , authMiddleware, EditActorInCharacter)
router.post("/anime/add/streem/youtube/:id",checkAuth , authMiddleware, updateAnimeYoutubeLinks)
router.post("/anime/edit/info",checkAuth , authMiddleware, EditAnimeinfo)
router.post("/anime/update/:id",checkAuth , authMiddleware, updateAnimeStream)
router.post("/admin/edit/:id/title",checkAuth , authMiddleware, EditAnimeTitle)
router.post("/admin/edit/:id/schedule/add",checkAuth , authMiddleware, AddAnimeschedule)
router.post("/rating/:animeId/anime/add", ratingAnime)
router.post("/api/v2/comment/:animeId/anime/add/4", addCommentAnime)
router.post("/admin/add/anime/:id/schedule",checkAuth, authMiddleware, AddAnimescheduleTimeline)



// ====================================================== Bookmark Save ====================================
// =========================================================================================================
router.post("/anime/bookmark/:animeId", authMiddleware, BookmarkSaveAnime)
// router.delete("/anime/bookmark/:animeId", authMiddleware, UnbookmarkBookmarkSaveAnime)


// ========================================================= Delete Anime ==================================
// =========================================================================================================
router.post("/delete/anime",checkAuth , authMiddleware, deleteAnime)


module.exports = router;