const express = require("express")
const router = express.Router()
const { checkAuth } = require("../lib/auth")
const { authMiddleware } = require("../Middlewares/authMiddleware")
const { createCheckoutSession } = require("../Controllers/topupController")
const stripeWebhook  = require("../webhooks/stripeWebhook")
const Payment = require("../models/PaymentModel");
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require("../models/UserModel");
require("dotenv").config();

router.get("/top/coin", checkAuth, (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./th/Topcoin", {userID , active: "topcoin"})
})

router.get("/top/coin/Successful", async (req, res) => {
    const userID = req.session.userlogin;
    const sessionId = req.query.session_id; 

    if (!sessionId) {
        return res.status(400).send('ต้องระบุ Session ID');
    }

    try {
        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if the session exists and if the payment was successful
        if (!session || session.payment_status !== 'paid') {
            return res.status(400).send('การชำระเงินไม่สำเร็จ');
        }

        // Find the payment record based on session ID
        const payment = await Payment.findOne({ sessionId: session.id });
        if (!payment) {
            return res.status(404).send('ไม่พบบันทึกการชำระเงิน');
        }

        // Find the user associated with the payment
        const user = await User.findById(payment.userid);
        if (!user) {
            return res.status(404).send('ไม่พบผู้ใช้');
        }

        // Map price_id to points based on the checkout session
        let pointsToAdd = 0;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        lineItems.data.forEach(item => {
            const priceId = item.price.id;

            switch (priceId) {
                case 'price_1PitVyDtyvwkHWIGhdcSHo9r':
                    pointsToAdd += 100; // 20 บาท
                    break;
                case 'price_1PitWoDtyvwkHWIGI1DTqGml':
                    pointsToAdd += 500; // 50 บาท
                    break;
                case 'price_1PitX5DtyvwkHWIG4YPYU60q':
                    pointsToAdd += 2000; // 100 บาท
                    break;
                default:
                    console.log('price_id ไม่รู้จัก');
            }
        });

        // Update user's points and payment status
        user.points += pointsToAdd;
        payment.paymentStatus = "completed";

        // Save both the user and payment records in parallel
        await Promise.all([user.save(), payment.save()]);

        console.log(`การชำระเงินสำเร็จ, เพิ่ม ${pointsToAdd} คะแนนให้ผู้ใช้.`);
        console.log(payment);
        
        // Render the success page
        res.render("./th/pages/playments/Successful", { userID, active: "topcoin" });
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการประมวลผลการชำระเงิน:', error);
        res.status(500).send('เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }
});


router.get("/top/coin/Cancel", async (req, res) => {
    const userID = req.session.userlogin;
    const sessionId = req.query.session_id; // Retrieve session_id if available
    let payment = null; // Initialize payment

    if (sessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            payment = await Payment.findOne({ sessionId: session.id });

            if (payment) {
                payment.paymentStatus = "cancelled";
                await payment.save(); // Await the save operation
            }
        } catch (error) {
            console.error("Error processing cancellation:", error);
            // Optionally, you might want to render an error page or send a response
        }
    }

    // Render the cancellation page
    res.render("./th/pages/playments/Cancel", { userID, active: "topcoin", payment });
});



router.post('/create-checkout-session', authMiddleware, createCheckoutSession);
router.post('/webhook', stripeWebhook.handleWebhook);


module.exports = router;