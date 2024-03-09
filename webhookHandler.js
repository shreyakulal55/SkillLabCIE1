const express = require('express');
const router = express.Router();
const Order = require('./models/Order'); // Adjust the path based on your project structure
const MessagingService = require('../services/messagingService'); // Adjust the path based on your project structure

// Webhook endpoint to send most ordered food to users
router.post('/webhook/send-orders', async (req, res) => {
  try {
    // Fetch and process the most ordered food for the previous day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const mostOrderedFood = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday, $lt: new Date() }
        }
      },
      {
        $group: {
          _id: '$foodId',
          totalOrders: { $sum: '$quantity' }
        }
      },
      {
        $sort: { totalOrders: -1 }
      },
      {
        $limit: 1
      }
    ]);

    if (mostOrderedFood.length > 0) {
      const message = `The most ordered food yesterday was ${mostOrderedFood[0]._id.name} with ${mostOrderedFood[0].totalOrders} orders.`;
      await MessagingService.sendMessageToUsers(message);
    }

    res.json({ message: 'Webhook executed successfully' });
  } catch (error) {
    console.error('Error executing webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
