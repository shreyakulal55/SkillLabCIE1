const mongoose = require('mongoose'); // Import mongoose module

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  quantity: { type: Number, default: 1 },
  orderDate: { type: Date, default: Date.now },
  amount: Number,
  paymentDetails: Object,
  // Other order details
});

// Export the mongoose model based on the schema
module.exports = mongoose.model('Order', orderSchema);
