const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const { orderCompletion,takingOrder,cancelOrder } = require("../Controllers/orders.js");
const { isLoggedIn, validateOrder } = require('../MiddleWares.js');


router.post("/done",isLoggedIn , validateOrder,wrapAsync(orderCompletion));
router.post("/taken", wrapAsync(takingOrder));
router.delete("/cancel", wrapAsync(cancelOrder));



module.exports = router;
