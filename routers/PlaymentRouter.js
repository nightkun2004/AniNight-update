const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { postWithdrawTrueMoneyWalletCreate } = require("../Controllers/PlaymentsController")

router.post("/admin/create/reward", authMiddleware,  postWithdrawTrueMoneyWalletCreate)


module.exports = router;