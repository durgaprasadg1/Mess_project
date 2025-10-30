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
  closeOpen,
  editMessForm,
  editTheMess,
} = require("../Controllers/individualMess.js");
const Mess = require("../Models/mess");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const uploads = multer({ storage });

router.get("/", wrapAsync(thatMess));

router.get("/menu", isLoggedIn, isOwner, wrapAsync(renderMenu));

router.post("/menu", isLoggedIn, isOwner, wrapAsync(addedMenu));

router.get(
  "/menu/json",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const mess = await Mess.findById(id);
    if (!mess) return res.status(404).json({ error: "Mess not found" });
    return res.json({
      vegMenu: mess.vegMenu || [],
      nonVegMenu: mess.nonVegMenu || [],
      vegPrice: mess.vegPrice || 0,
      nonVegPrice: mess.nonVegPrice || 0,
      mealTime: mess.mealTime || null,
    });
  })
);

router.post("/review", isLoggedIn, validateReview, wrapAsync(addReview));

router.delete(
  "/review/:reviewid",
  isLoggedIn,
  isAuthor,
  wrapAsync(deleteReview)
);

router.delete("/delete", isLoggedIn, isOwner, wrapAsync(deleteThatMess));

router.get("/orders", isLoggedIn, isOwner, wrapAsync(showingOrders));

router.post("/booking", isLoggedIn, validateOrder, wrapAsync(gettingPayment));

router.post("/verify-payment", wrapAsync(verifyingPayment));
router.delete("/orders/delete", wrapAsync(deleteOrdersOfThisMess));
router.get("/closeOpen", isLoggedIn, isOwner, wrapAsync(closeOpen));

router.get("/edit", isLoggedIn, isOwner, wrapAsync(editMessForm));

router.put(
  "/edit",
  isLoggedIn,
  isOwner,
  uploads.single("image"),
  wrapAsync(editTheMess)
);

module.exports = router;
