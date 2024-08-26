const express = require("express")
const router = express.Router()
const {
    getSurvey,
    RewardCallback,
    OfferRewardCallback,
    ReconciliationCallback,
    OfferReconciliationCallback,
    FirstQualificationCallback,
    MagicReceiptsCallback } = require("../Controllers/SurveyControler")


router.get("/callback/reward", RewardCallback)
router.get("/callback/offer-reward", OfferRewardCallback)
router.get("/callback/reconciliation", ReconciliationCallback)
router.get("/callback/offer-reconciliation", OfferReconciliationCallback)
router.get("/callback/first-qualification", FirstQualificationCallback)
router.get("/callback/magic-receipts", MagicReceiptsCallback)

module.exports = router;