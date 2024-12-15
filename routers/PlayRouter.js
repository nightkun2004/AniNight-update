const express = require("express")
const router = express.Router()
const { getMedia, getSeriesmedias, getEpisodesSubtitle, getSeriesmediaitem, getSeriesmediaitemEP, getPlayEpisode, getEditseriesmedia, getEpisodesSeries, getCreateSeries, CreateSeries, postEditPV, uploadPV, addEpisode ,addSubtitleEpisode, likeVideo, DeteleSeriesMedia } = require("../Controllers/PlayController")

router.get("/media/:videoid", getMedia)
router.get("/play/:seriesVideoid/:episodeVideoid", getPlayEpisode)
router.get("/api/v2/Series/medias", getSeriesmedias)
router.get("/api/v2/Series/medias/:videoid", getSeriesmediaitem)
router.get("/api/v2/Series/medias/:seriesVideoid/:episodeVideoid", getSeriesmediaitemEP);


const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
 
router.get("/create/Series/media", checkAuth, authMiddleware,  getCreateSeries) 
router.get("/add/episodes/:id/Series", checkAuth, authMiddleware,  getEpisodesSeries)
router.get("/admin/edit/Series/media/:videoid", checkAuth, authMiddleware,  getEditseriesmedia)
router.get("/admin/add/epsode/sub/:id", checkAuth, authMiddleware,  getEpisodesSubtitle)
router.post("/api/upload-video", checkAuth, authMiddleware,  uploadPV)
router.post("/api/v2/add/episodes/:id/Series", checkAuth, authMiddleware,  addEpisode)
router.post("/api/v2/like/video/:id", checkAuth, authMiddleware,  likeVideo)
router.post("/api/v2/edit/video/:videoid", checkAuth, authMiddleware,  postEditPV)
router.post("/api/v2/create/Series/media", checkAuth, authMiddleware,  CreateSeries)
router.post("/api/v2/add/subtitle/episode/:id", checkAuth, authMiddleware,  addSubtitleEpisode)
router.post("/api/v2/delete/series/:id", checkAuth, authMiddleware, DeteleSeriesMedia);

module.exports = router;