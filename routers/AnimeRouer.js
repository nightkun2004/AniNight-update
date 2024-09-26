const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { CreateanimeItem, Createcharacters, getScheduleAPI, EditAnimeinfo, deleteAnime, updateAnimeStream, BookmarkSaveAnime, UnbookmarkBookmarkSaveAnime } = require("../Controllers/AnimeController")

router.get("/schedule/anime/lists", getScheduleAPI)
// ===================================================== Create Anime ======================================
// =========================================================================================================
router.post("/anime/add/new",checkAuth , authMiddleware, CreateanimeItem)
router.post("/anime/add/characters",checkAuth , authMiddleware, Createcharacters)
router.post("/anime/edit/info",checkAuth , authMiddleware, EditAnimeinfo)
router.post("/anime/update/:id",checkAuth , authMiddleware, updateAnimeStream)



// ====================================================== Bookmark Save ====================================
// =========================================================================================================
router.post("/anime/bookmark/:animeId", authMiddleware, BookmarkSaveAnime)
// router.delete("/anime/bookmark/:animeId", authMiddleware, UnbookmarkBookmarkSaveAnime)


// ========================================================= Delete Anime ==================================
// =========================================================================================================
router.post("/delete/anime",checkAuth , authMiddleware, deleteAnime)


module.exports = router;