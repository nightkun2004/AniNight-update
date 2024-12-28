const express = require("express")
const router = express.Router()
const { getRead, updateReadTime } = require("../Controllers/readController")
const cacheMiddleware = require("../Middlewares/CacheMiddleware")

router.get("/read/:urlslug", getRead)
router.post("/api/v2/:id/read", updateReadTime)

module.exports = router;