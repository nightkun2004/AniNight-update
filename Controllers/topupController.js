const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/PaymentModel");
require("dotenv").config();

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
    const { priceId, email, amount, paymentMethod, } = req.body; 
    const paymentId = uuidv4();

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card", "promptpay"],
            line_items: [{
                price: priceId, 
                quantity: 1,
            }],
            mode: "payment",
            customer_email: email, // อีเมลของลูกค้าเพื่อเชื่อมโยงกับเซสชัน
            success_url: `${process.env.CLIENT_URL}/top/coin/Successful?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/top/coin/Cancel?session_id={CHECKOUT_SESSION_ID}`,
        });
        


        const payment = new Payment({
            userid: req.user.id,
            email, // อีเมลของผู้ใช้
            priceId, // รหัสราคา
            sessionId: session.id, // รหัส session จาก Stripe
            paymentStatus: "pending", // สถานะการชำระเงินเริ่มต้นเป็น "pending"
            uuid: paymentId, // UUID ที่สร้างไว้สำหรับการชำระเงินนี้
            amount,
            paymentMethod: "google"
        });
        await payment.save();
        console.log("สร้างการชำระเงิน", payment)

        // Send the session URL back to the client
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
};

module.exports = {
    createCheckoutSession,
};
