const Order = require("../Models/order.js");
const Consumer = require("../Models/consumer.js");
const Mess = require("../Models/mess");
const Review = require("../Models/reviews");
const Razorpay = require("razorpay");
const crypto = require("crypto");
// let paymentDone = true;

module.exports.thatMess = async (req, res) => {
  let { id } = req.params;
  let mess = await Mess.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  let isOwner = false;
  if (req.user && mess.owner) {
    isOwner = mess.owner.equals(req.user._id);
  }
  res.render("show.ejs", { mess, isOwner });
};

module.exports.renderMenu = async (req, res) => {
  let { id } = req.params;
  res.render("messMenu.ejs", { id });
};

module.exports.addedMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu, price } = req.body; 
    let mess = await Mess.findByIdAndUpdate(id, { menu: menu, price: price }, { new: true });
    req.flash("success", "Menu Updated Successfully");
    res.redirect(`/mess/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while updating the menu");
    res.redirect(`/mess/${id}`);
  }
};

module.exports.addReview = async (req, res) => {
  try{
    let { id } = req.params;
  let mess = await Mess.findById(id);
  let newReview = new Review(req.body.reviews);
  newReview.author = req.user._id;
  mess.reviews.push(newReview);
  await newReview.save();
  await mess.save();
  await Consumer.findByIdAndUpdate(req.user._id, {
    $push: { reviews: newReview._id },
  });
  req.flash("success", "New Review Saved");
  res.redirect(`/mess/${mess._id}`)
  }
  catch{
    req.flash("error","Rating Star is required.")
    res.redirect(`/mess/${id}`)
  }
};

module.exports.deleteReview = async (req, res) => {
  let { id } = req.params;
  await Mess.findByIdAndUpdate(req.params.id, {
    $pull: { reviews: req.params.reviewid },
  });
  await Review.findByIdAndDelete(req.params.reviewid);
  req.flash("success", "Review Deleted Successfully");
  res.redirect(`/Mess/${id}`);
};

module.exports.deleteThatMess = async (req, res) => {
  let { id } = req.params;
  await Mess.findByIdAndDelete(id);
  req.flash("success", "Deleted Succesfully");
  res.redirect("/mess");
};

module.exports.showingOrders = async (req, res) => {
  try {
    let { id } = req.params;
    let mess = await Mess.findById(id).populate({
      path: "orders",
      populate: { path: "consumer mess" },
    });

    if (!mess) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }

    let orders = mess.orders;
    res.render("order.ejs", { orders });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/mess");
  }
};

module.exports.gettingPayment = async (req, res) => {
  let { id } = req.params;
  let mess = await Mess.findById(id);
  if (!mess) {
    req.flash("error", "Mess not found");
    return res.redirect("/mess");
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const options = {
    amount: mess.price * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  const order = await razorpay.orders.create(options);

  let dbOrder = new Order({
    mess: id,
    consumer: req.user._id,
    totalPrice: mess.price,
    status: "pending",
    razorpayOrderId: order.id,
  });

  await dbOrder.save();

  res.render("checkout", {
    key: process.env.RAZORPAY_KEY_ID,
    order,
    mess,
    currentUser: req.user,
  });
};

module.exports.verifyingPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(sign)
    .digest("hex");

  const dbOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!dbOrder) return res.status(404).send("Order not found");
  if (razorpay_signature === expectedSign) {
    dbOrder.status = "paid";
    dbOrder.razorpayPaymentId = razorpay_payment_id;
    dbOrder.paymentVerified = true;

    await Consumer.findByIdAndUpdate(req.user._id, {
      $push: { orders: dbOrder._id },
    });

    await Mess.findByIdAndUpdate(dbOrder.mess, {
      $push: { orders: dbOrder._id },
    });

    await dbOrder.save();

    req.flash("success", "Ordered Successfully");
    return res.redirect("/mess");
  } else {
    dbOrder.status = "failed";
    await dbOrder.save();
    return res.status(400).send("Payment verification failed!");
  }
};


module.exports.deleteOrdersOfThisMess = async (req, res) => {
  try {
    const { id } = req.params;
    const mess = await Mess.findById(id); 

    if (!mess) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }

    mess.orders = mess.orders.filter(order => !order.done);
    await mess.save();

    req.flash("success", "Completed orders cleared successfully.");
    res.redirect(`/mess/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting orders");
    res.redirect("/mess");
  }
};


module.exports.closeOpen = async (req, res) => {
  try {
    let { id } = req.params;
    let mess = await Mess.findById(id);
    if (!mess) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }
    mess.isOpen = !mess.isOpen;
    res.locals.open = mess.isOpen;
    await mess.save();
    
    if (mess.isOpen) {
      req.flash("success", "Mess Opened");
    } else {
      req.flash("success", "Mess Closed");
    }
    // console.log(mess.isOpen)
    res.redirect(`/mess/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect(`/mess/${id}`);
  }
};

module.exports.editMessForm = async (req, res) => {
  try {
    let { id } = req.params;
    let mess = await Mess.findById(id);

    if (!mess) {
      req.flash("error", "Mess not found, cannot edit");
      return res.redirect("/mess"); 
    }

    res.render("Mess/editMessForm.ejs", { mess });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/mess"); 
  }
};


module.exports.editTheMess = async (req, res) => {
  try {
    let { id } = req.params;
    let { name, description, address, category } = req.body;
    let mess = await Mess.findByIdAndUpdate(
      id,{ name, description, address, category },
      { new: true, runValidators: true }
    );
    if (!mess) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }
    if (req.file) {
      let url = req.file.path;
      let filename = req.file.filename;
      mess.image = { url, filename };
      await mess.save(); 
    }
    req.flash("success", "Updates Saved");
    res.redirect(`/mess/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect(`/mess/${req.params.id}`);
  }
};

