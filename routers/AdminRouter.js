const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
const { updateUserRole } = require("../Controllers/AdminController")

router.post('/admin/update-role', checkAuth, updateUserRole)
 
module.exports = router;