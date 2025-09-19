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