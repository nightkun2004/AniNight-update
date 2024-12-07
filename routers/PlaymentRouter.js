const express = require("express")
const router = express.Router()
const { authMiddleware, ensureAuthenticated } = require("../Middlewares/authMiddleware")
const { checkAuth } = require("../lib/auth")
const { postWithdrawTrueMoneyWalletCreate, DeletePayment } = require("../Controllers/PlaymentsController")

router.post("/admin/create/reward", authMiddleware,  postWithdrawTrueMoneyWalletCreate)
router.post("/admin/delete/reward/playment/:id", authMiddleware,  DeletePayment)


module.exports = router;