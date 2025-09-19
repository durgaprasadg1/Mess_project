const express = require("express");
const router = express.Router({ mergeParams: true });
const Mess = require("../Models/mess.js");
const Order = require("../Models/order.js");
const Consumer = require("../Models/consumer.js");
const wrapAsync = require('../utils/wrapAsync.js');
const { showHistory, deleteHistory, consumerInfo } = require("../Controllers/consumer.js");

router.get("/:id/history", wrapAsync(showHistory));

router.delete("/:id/history",  wrapAsync(deleteHistory));

router.get("/:id/info",wrapAsync(consumerInfo));





module.exports = router