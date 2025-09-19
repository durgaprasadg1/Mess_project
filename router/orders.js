const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const { orderCompletion } = require("../Controllers/orders.js");

router.post("/done", wrapAsync(orderCompletion));

module.exports = router;
