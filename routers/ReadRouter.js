const express = require("express")
const router = express.Router()
const { getRead } = require("../Controllers/readController")

router.get("/read/:urlslug", getRead)
router.get("/content/:urlslug", getRead)

module.exports = router;