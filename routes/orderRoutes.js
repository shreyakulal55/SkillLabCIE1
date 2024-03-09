const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const stripe = require('stripe')('your_stripe_secret_key');

// Route for processing payments and creating orders
router.post('/checkout', async (req, res) => {
  try {
    const { userId, foodId, amount, currency, token } = req.body;

    // Validate the request body
    if (!userId || !foodId || !amount || !currency || !token) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Create a charge using Stripe
    const charge = await stripe.charges.create({
      amount,
      currency,
      source: token,
      description: 'Payment for food order',
    });

    // Create a new order in the database
    const order = new Order({
      userId,
      foodId,
      amount,
      paymentDetails: charge,
      orderDate: new Date(), // Set the order date
      // Other order details
    });
    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Example route to get daily food orders
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const dailyOrders = await Order.find({ orderDate: { $gte: startOfDay, $lt: endOfDay } })
      .populate('foodId')
      .populate('userId');

    res.json(dailyOrders);
  } catch (error) {
    console.error('Error fetching daily orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
