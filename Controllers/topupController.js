const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/PaymentModel");
require("dotenv").config();

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
    const { priceId, email } = req.body; // Extract priceId and email from the request body
    const paymentId = uuidv4(); // Generate a unique payment ID

    try {
        // Create a new checkout session with Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"], // Specify the payment method
            line_items: [{
                price: priceId, // Use the priceId from the frontend
                quantity: 1,
            }],
            mode: "payment",
            customer_email: email, // Customer email to associate with the session
            success_url: `${process.env.CLIENT_URL}/top/coin/Successful?session_id={CHECKOUT_SESSION_ID}`, // Redirect to success page
            cancel_url: `${process.env.CLIENT_URL}/top/coin/Cancel`, // Redirect to cancel page
        });

        // Save the payment record to the database
        const payment = new Payment({
            email, // Save user email
            priceId, // Save the selected price ID
            sessionId: session.id, // Stripe session ID
            paymentStatus: "pending", // Set initial status as pending
            uuid: paymentId, // Store generated UUID for this payment
        });
        await payment.save(); // Save to MongoDB

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
