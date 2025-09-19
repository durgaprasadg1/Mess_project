const express = require("express");
const router = express.Router({ mergeParams: true });
const Mess = require("../Models/mess.js");
const Order = require("../Models/order.js");
const Consumer = require("../Models/consumer.js");
const wrapAsync = require('../utils/wrapAsync.js');
const { showHistory, deleteHistory } = require("../Controllers/consumer.js");

router.get("/:id/history", wrapAsync(showHistory));

router.delete("/:id/history",  wrapAsync(deleteHistory));
// router.delete("/:id/orders",  wrapAsync(deleteOrders));




module.exports = router