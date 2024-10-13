const express = require('express');
const Payment = require("../models/PaymentModel")
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
  
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
  
      // Find the payment record and user
      const payment = await Payment.findOne({ sessionId: session.id });
      if (payment) {
        // Update payment status in the database
        await Payment.updateOne({ sessionId: session.id }, { paymentStatus: 'completed' });
  
        // Add points to the user's account based on price_id
        const User = require("../models/UserModel"); // Import user model
        const user = await User.findById(payment.userid);
  
        if (user) {
          let pointsToAdd = 0;
          
          // Map price_id to points
          switch (session.price_id) {
            case 'price_1PitVyDtyvwkHWIGhdcSHo9r':
              pointsToAdd = 100; // 20 บาท
              break;
            case 'price_1PitWoDtyvwkHWIGI1DTqGml':
              pointsToAdd = 500; // 50 บาท
              break;
            case 'price_1PitX5DtyvwkHWIG4YPYU60q':
              pointsToAdd = 2000; // 100 บาท
              break;
            default:
              console.log('Unknown price_id');
          }
  
          // Add points to user
          user.points += pointsToAdd;
          await user.save();
  
          console.log(`Payment successful, added ${pointsToAdd} points to user.`);
        }
      }
    }
  
    res.json({ received: true });
  };
  