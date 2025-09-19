const Order = require("../Models/order.js");
const Consumer = require("../Models/consumer.js");

module.exports.showHistory = async (req, res) => {
  try {
    let { id } = req.params;
    let consumer = await Consumer.findById(id).populate({
      path: "orders",
      populate: { path: "mess" } 
    });

    if (!consumer) {
      req.flash("error", "Consumer not found");
      return res.redirect("/");
    }

    res.render("user/history.ejs", { orders: consumer.orders });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
}
module.exports.deleteHistory = async (req, res) => {
  try {
    let { id } = req.params;
    let consumer = await Consumer.findById(id).populate("orders");

    if (!consumer) {
      req.flash("error", "Consumer not found");
      return res.redirect("/");
    }

    if (!consumer.orders || consumer.orders.length === 0) {
      req.flash("error", "No orders found");
      return res.redirect("/");
    }

    // Delete all orders belonging to this consumer
    // await Order.deleteMany({ _id: { $in: consumer.orders } });
    // Clear orders array in consumer
    consumer.orders = [];
    await consumer.save();

    req.flash("success", "History deleted successfully");
    res.redirect(`/mess`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
}

