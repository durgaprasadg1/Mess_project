const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const Order = require('../Models/order.js')
const { orderCompletion,takingOrder,cancelOrder, savingSubscription } = require("../Controllers/orders.js");
const { isLoggedIn, validateOrder } = require('../MiddleWares.js');


router.post("/done",isLoggedIn , validateOrder,wrapAsync(orderCompletion));
router.post("/taken",isLoggedIn, wrapAsync(takingOrder));
router.delete("/cancel", wrapAsync(cancelOrder));

router.post("/save-subscription",wrapAsync(savingSubscription));



module.exports = router;
