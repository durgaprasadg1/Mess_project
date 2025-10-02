const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const Order = require('../Models/order.js')
const { orderCompletion,takingOrder,cancelOrder } = require("../Controllers/orders.js");
const { isLoggedIn, validateOrder } = require('../MiddleWares.js');


router.post("/done",isLoggedIn , validateOrder,wrapAsync(orderCompletion));
router.post("/taken",isLoggedIn, wrapAsync(takingOrder));
router.delete("/cancel", wrapAsync(cancelOrder));

router.post("/save-subscription", async (req, res) => {
  const { orderId, consumerSubscription } = req.body;
  try {
    await Order.updateOne(
      { _id: orderId },
      { $set: { consumerSubscription } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});



module.exports = router;
