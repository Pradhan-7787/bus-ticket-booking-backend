const express = require("express");
const router = express.Router();
const BusTicket = require("../models/TicketModel");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../utils/error_messages");

// This function is to check if the entered seat number is a valid one or not
function isValidSeatNumber(number) {
  const regex = /^(?:[1-9]|[1-3][0-9]|40)$/;
  if (!regex.test(number)) {
    throw new Error(ERROR_MESSAGES.NOT_VALID_SEAT_NUMBER);
  }
}

// This is to create 40 seats
// The code will check if any seat is available or not, if so it ll skip that and create other seats
router.post("/tickets/", async (req, res) => {
  try {
    const { numberOfTickets } = req.body;
    for (let i = 1; i <= numberOfTickets; i++) {
      const existingSeat = await BusTicket.findOne({ seatNumber: i });
      if (existingSeat) {
        console.log(`Seat number ${i} already exists. Skipping...`);
        continue; // Skip to the next iteration of the loop
      }
      const seat = new BusTicket({
        seatNumber: i,
        isOpen: true,
      });
      await seat.save();
    }
    res.json({ message: SUCCESS_MESSAGES.BOOKING_SUCCESS });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// This will book a ticket, update the user details to requested seat number & update the ticket status
router.post("/ticket/:seatNumber", async (req, res) => {
  const { seatNumber } = req.params;
  const { name, email, address, to, from } = req.body;

  try {
    isValidSeatNumber(seatNumber);
    const ticket = await BusTicket.findOne({ seatNumber });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (!ticket.isOpen) {
      return res.status(400).json({ error: "Ticket already booked" });
    }

    ticket.userDetails.name = name;
    ticket.userDetails.email = email;
    ticket.userDetails.address = address;
    ticket.userDetails.to = to;
    ticket.userDetails.from = from;
    ticket.isOpen = false;

    await ticket.save();

    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// This APi will check if the entered ticket number is available or not
router.get("/ticket/:seatNumber/", async (req, res) => {
  try {
    const { seatNumber } = req.params;
    isValidSeatNumber(seatNumber);
    const ticket = await BusTicket.findOne({ seatNumber });
    if (!ticket) {
      throw new Error(ERROR_MESSAGES.TICKET_AVAILABLE);
    }
    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// This API will show all booked ticket details
router.get("/tickets/closed", async (req, res) => {
  try {
    const closedTickets = await BusTicket.find({ isOpen: false });

    res.json(closedTickets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// This API will show all available ticket details
router.get("/tickets/open", async (req, res) => {
  try {
    const openTickets = await BusTicket.find({ isOpen: true });
    res.json(openTickets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// This API will fetch the details of the user who booked that ticket
router.get("/ticket/:seatNumber/details", async (req, res) => {
  const { seatNumber } = req.params;
  try {
    isValidSeatNumber(seatNumber);
    const ticket = await BusTicket.findOne({ seatNumber });

    if (!ticket || ticket.isOpen) {
      return res.status(404).json({ error: ERROR_MESSAGES.TICKET_UNAVAILABLE });
    }

    res.json(ticket.userDetails);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// This API will reset all the seat details to default by removing the user details from it & updating the ststus to available
router.post("/admin/reset", async (req, res) => {
  try {
    await BusTicket.updateMany(
      {},
      {
        isOpen: true,
        $unset: { userDetails: 1 },
      }
    );

    res.json({ message: SUCCESS_MESSAGES.RESET_SUCCESS });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
