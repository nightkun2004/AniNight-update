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

    // Update payment status in the database
    await Payment.updateOne({ sessionId: session.id }, { paymentStatus: 'completed' });
    console.log(session)
  }

  res.json({ received: true });
};
