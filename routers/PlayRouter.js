const express = require("express")
const router = express.Router()
const { getPlay } = require("../Controllers/PlayController")

router.get("/play/:videoid", getPlay)

module.exports = router;