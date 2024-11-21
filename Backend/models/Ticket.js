const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
   ticketNumber: {
      type: Number,
      required: true,
      unique: true
   },
   description: {
      type: String,
      required: true
   },
   imagePath: {
      type: String,
      required: true
   },
   status: {
      type: String,
      default: 'Pending'
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   decision: {
      type: String,
      enum: ['Refund Order', 'Replace Order', 'Escalate to Human Agent'],  // Example options
      default: 'Pending'
   }
});

module.exports = mongoose.model('Ticket', ticketSchema);
