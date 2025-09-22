if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  isLoggedIn,
  isAuthor,
  isOwner,
  validateReview,
  validateOrder,
} = require("../MiddleWares.js");

const wrapAsync = require("../utils/wrapAsync.js");

const {
  thatMess,
  renderMenu,
  addedMenu,
  addReview,
  deleteReview,
  deleteThatMess,
  deleteOrdersOfThisMess,
  showingOrders,
  gettingPayment,
  verifyingPayment,
  closeOpen
} = require("../Controllers/individualMess.js");


router.get("/", wrapAsync(thatMess));

router.get("/menu", wrapAsync(renderMenu));

router.post("/menu", wrapAsync(addedMenu));

router.post("/review", isLoggedIn, validateReview, wrapAsync(addReview));

router.delete( "/review/:reviewid", isLoggedIn, isAuthor, wrapAsync(deleteReview)
);

router.delete("/delete", isLoggedIn, isOwner, wrapAsync(deleteThatMess));

router.get("/orders", isLoggedIn, isOwner, wrapAsync(showingOrders));

router.post( "/booking", isLoggedIn, validateOrder, wrapAsync(gettingPayment));

router.post( "/verify-payment" , wrapAsync(verifyingPayment));
router.delete( '/orders/delete' , wrapAsync(deleteOrdersOfThisMess))
router.get('/closeOpen', isLoggedIn,isOwner , wrapAsync(closeOpen))

module.exports = router;
