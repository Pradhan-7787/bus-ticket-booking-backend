const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ticketBookingRoute = require("./routes/TicketBooking");
require("dotenv").config({ path: "./.env" });
const app = express();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
});
app.get("/", (_req, res) => {
  res.send("Hello Suryakant");
});
let PORT_NAME = process.env.PORT;
app.use(bodyParser.json());
app.use(ticketBookingRoute);

app.listen(PORT_NAME, () => {
  console.log(`Server running on PORT ${PORT_NAME}`);
});
