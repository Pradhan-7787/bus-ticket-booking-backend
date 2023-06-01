const mongoose = require("mongoose");

const BusTicketSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  isOpen: { type: Boolean, default: true },
  userDetails: {
    name: String,
    email: String,
    address: String,
    to: String,
    from: String
  },
});

const BusTicket = mongoose.model("bus_ticket", BusTicketSchema);

module.exports = BusTicket;
