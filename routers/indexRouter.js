const express = require("express")
const router = express.Router()
const { getPosts } = require("../Controllers/PostsController")

router.get("/", getPosts)
router.get("/page/:page", getPosts)


module.exports = router;