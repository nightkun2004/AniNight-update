const express = require("express")
const router = express.Router()
const { getPlay, getPlayEpisodes, getPV, getEditPv, getepisodes, getCreateSeries, postEditPV, uploadPV, addEpisode, likeVideo, DeteleSeriesMedia } = require("../Controllers/PlayController")

router.get("/play/:videoid", getPlay)
router.get("/play/:videoid/:episodeid", getPlayEpisodes)
router.get("/api/v2/anime/pv", getPV)


const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
 
router.get("/create/Series/media", checkAuth, authMiddleware,  getCreateSeries) 
router.get("/add/episodes/anime/:playid", checkAuth, authMiddleware,  getepisodes)
router.get("/admin/edit/video/anime/:videoid", checkAuth, authMiddleware,  getEditPv)
router.post("/api/upload-video", checkAuth, authMiddleware,  uploadPV)
router.post("/api/add/episode/video", checkAuth, authMiddleware,  addEpisode)
router.post("/api/v2/like/video/:id", checkAuth, authMiddleware,  likeVideo)
router.post("/api/v2/edit/video/:videoid", checkAuth, authMiddleware,  postEditPV)
router.post("/api/v2/delete/series/:id", checkAuth, authMiddleware, DeteleSeriesMedia);

module.exports = router;