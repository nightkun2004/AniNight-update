const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
const { updateUserRole, generateAPIKEY } = require("../Controllers/AdminController")

router.post('/admin/update-role', checkAuth, updateUserRole)
router.post('/admin/generate-api-key', checkAuth, generateAPIKEY)
 
module.exports = router;