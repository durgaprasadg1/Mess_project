const Consumer = require("../Models/consumer.js");
const Order = require("../Models/order.js");

module.exports.orderCompletion = async (req, res) => {
  let { id } = req.params;
  let order = await Order.findById(id);
  if (!order) {
    req.flash("error", "Order not found");
    return res.redirect("/orders");
  };
  order.done = true;
  await order.save();
  req.flash("success", "Order marked as done");
  res.redirect(`/mess/${order.mess}/orders`);
}

module.exports.takingOrder = async (req, res) => {
  try {
    let { id } = req.params;
    let order = await Order.findById(id);

    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }

    order.isTaken = true;
    await order.save();

    req.flash("success", "Order Taken");
    res.redirect(`/mess/${order.mess}/orders`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while taking the order");
    res.redirect("/orders");
  }
};

module.exports.cancelOrder = async (req, res) => {
  try {
    let { id } = req.params;
    let order = await Order.findByIdAndDelete(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }
    
    req.flash("success", "Order cancelled, refund will be processed soon");
    res.redirect(`/consumer/${req.user._id}/History`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while cancelling the order");
    res.redirect("/orders");
  }
};
