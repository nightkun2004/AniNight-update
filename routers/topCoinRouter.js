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

router.get("/top/coin/Successful", async (req,res)=>{
    const userID = req.session.userlogin;

    const sessionId = req.query.session_id; 

    if (!sessionId) {
        return res.status(400).send('Session ID is required');
    }

    try {
        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session || session.payment_status !== 'paid') {
            return res.status(400).send('Payment was not successful');
        }

        // Find the payment record based on session ID
        const payment = await Payment.findOne({ sessionId: session.id });

        if (!payment) {
            return res.status(404).send('Payment record not found');
        }

        // Find the user associated with the payment
        const user = await User.findById(payment.userid);

        if (!user) {
            return res.status(404).send('User not found');
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
                    console.log('Unknown price_id');
            }
        });

        // Add points to user
        user.points += pointsToAdd;
        await user.save();

        console.log(`Payment successful, added ${pointsToAdd} points to user.`);
        res.render("./th/pages/playments/Successful", {userID , active: "topcoin"})
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('Internal server error');
    }
   
})

router.get("/top/coin/Cancel", (req,res)=>{
    const userID = req.session.userlogin;
    res.render("./th/pages/playments/Cancel", {userID, active: "topcoin"})
})


router.post('/create-checkout-session', authMiddleware, createCheckoutSession);
router.post('/webhook', stripeWebhook.handleWebhook);


module.exports = router;