const Consumer = require("../Models/consumer.js");
const Order = require("../Models/order.js");
const webpush = require('web-push');


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
    const { id } = req.params; 
    const { consumerSubscription } = req.body; 
    let order = await Order.findById(id);
    if (!order) {
      req.flash("error", "Order not found");
      return res.redirect("/orders");
    }
    if (consumerSubscription) {
      order.consumerSubscription = consumerSubscription;
    }
    order.isTaken = true;
    await order.save();

    if (order.consumerSubscription) {
      await webpush.sendNotification(
        order.consumerSubscription,
        JSON.stringify({
          title: 'Order Update',
          message: 'You have a new order!',
          url: `/mess/${req.user.mess[0]}/orders`
        })
      );
    }

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
    console.error("Error In Cancelling the order : ",err);
    req.flash("error", "Something went wrong while cancelling the order");
    res.redirect("/orders");
  }
};

module.exports.savingSubscription  =  async (req, res) => {
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
}
