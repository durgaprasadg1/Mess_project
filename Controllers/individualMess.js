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
  try {
    const { id } = req.params;
    const mess = await Mess.findById(id);

    if (!mess) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }
    // console.log(mess);

    res.render("messMenu.ejs", { id, mess });
  } catch (err) {
    console.error("Error loading mess menu:", err);
    req.flash("error", "Something went wrong while loading the menu page.");
    res.redirect("/mess");
  }
};

module.exports.addedMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { mealTime, menutype, menu, price, dishes } = req.body;

    const mess = await Mess.findById(id);
    if (!mess) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }

    // New: support nested dishes structure (dishes -> items with price)
    let menuItems = [];

    const toArray = (v) => {
      if (v === undefined || v === null) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === "object") return Object.keys(v).map((k) => v[k]);
      return [v];
    };

    if (dishes) {
      const dishArray = toArray(dishes);
      menuItems = dishArray
        .map((d) => {
          const dishName = d && d.name ? String(d.name).trim() : "";
          const dishPriceRaw =
            d && d.price !== undefined && d.price !== null ? d.price : 0;
          const dishPrice = Number(dishPriceRaw) || 0;
          const itemsRaw = toArray(d && d.items);
          const items = itemsRaw
            .map((it) => {
              const itemName =
                it && it.name
                  ? String(it.name).trim()
                  : typeof it === "string"
                  ? String(it).trim()
                  : "";
              const rawPrice =
                it && it.price !== undefined && it.price !== null
                  ? it.price
                  : 0;
              const itemPrice = Number(rawPrice) || 0;
              return { name: itemName, price: itemPrice };
            })
            .filter((i) => i.name);
          return { name: dishName || "", price: dishPrice, items };
        })
        .filter((d) => d.name || (d.items && d.items.length > 0));
      // root price still stored in vegPrice/nonVegPrice if provided
      if (price) {
        if (menutype === "vegMenu") mess.vegPrice = price;
        else mess.nonVegPrice = price;
      }
    } else if (Array.isArray(menu) && menu.length) {
      // backward compatibility: each menu entry is dish name string
      if (price) {
        if (menutype === "vegMenu") mess.vegPrice = price;
        else mess.nonVegPrice = price;
      }
      menuItems = menu
        .map((item) => ({ name: item.trim(), items: [] }))
        .filter((d) => d.name);
    } else if (typeof menu === "string" && menu.trim() !== "") {
      menuItems = [{ name: menu.trim(), items: [] }];
    }

    if (menuItems.length === 0) {
      req.flash("error", "Please add at least one dish.");
      return res.redirect(`/mess/${id}`);
    }

    if (menutype === "vegMenu") {
      mess.vegMenu = menuItems;
    } else if (menutype === "nonVegMenu") {
      mess.nonVegMenu = menuItems;
    }
    mess.mealTime = mealTime;
    await mess.save();

    req.flash("success", "Menu added successfully!");
    res.redirect(`/mess/${id}`);
  } catch (err) {
    console.error("Error while adding menu:", err);
    req.flash("error", "Something went wrong while updating the menu.");
    res.redirect(`/mess/${req.params.id}`);
  }
};

module.exports.addReview = async (req, res) => {
  try {
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
    res.redirect(`/mess/${mess._id}`);
  } catch {
    req.flash("error", "Rating Star is required.");
    res.redirect(`/mess/${id}`);
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
  let { noOfPlate } = req.body;
  let mess = await Mess.findById(id).populate("orders");

  if (!mess) {
    req.flash("error", "Mess not found");
    return res.redirect("/mess");
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
  const razorpayOrderCreate = async (amount) => {
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    return await razorpay.orders.create(options);
  };

  // Determine selected dish price (if provided) otherwise fallback to menu-level price
  const { menutype, selectedDish } = req.body;
  let pricePerPlate = 0;
  let selectedDishName = "";

  if (menutype && selectedDish !== undefined) {
    const menuArray = mess[menutype] || [];
    const idx = Number(selectedDish);
    const dish = menuArray[idx];
    if (dish) {
      selectedDishName = typeof dish === "string" ? dish : dish.name || "";
      if (typeof dish === "object" && dish.price && Number(dish.price) > 0) {
        pricePerPlate = Number(dish.price);
      } else if (
        typeof dish === "object" &&
        Array.isArray(dish.items) &&
        dish.items.length
      ) {
        pricePerPlate = dish.items.reduce(
          (s, it) => s + (Number(it.price) || 0),
          0
        );
      }
    }
  }

  if (!pricePerPlate) {
    if (mess.category === "veg" || menutype === "vegMenu")
      pricePerPlate = mess.vegPrice || 0;
    else pricePerPlate = mess.nonVegPrice || 0;
  }

  const amount = Math.round(pricePerPlate * 100 * Number(noOfPlate || 1));
  const order = await razorpayOrderCreate(amount);

  let dbOrder = new Order({
    mess: id,
    consumer: req.user._id,
    totalPrice: amount,
    status: "pending",
    razorpayOrderId: order.id,
    noOfPlate: noOfPlate,
    selectedDishName,
    selectedDishPrice: pricePerPlate,
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
    const mess = await Mess.findById(id).populate("orders");

    if (!mess) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }

    mess.orders = mess.orders.filter((order) => !order.done && !order.isTaken);
    await mess.save();

    req.flash("success", "Completed orders cleared successfully.");
    res.redirect(`/mess/${id}/orders`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting orders");
    res.redirect(`/mess/${id}/orders`);
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
    let {
      name,
      description,
      address,
      category,
      mealTime,
      vegPrice,
      nonVegPrice,
      ownerName,
      adharNumber,
      phoneNumber,
      lat,
      lon,
      isLimited,
    } = req.body;

    // normalize numeric and boolean fields
    const update = {
      name,
      description,
      address,
      category,
      mealTime: mealTime || "",
      vegPrice:
        vegPrice !== undefined && vegPrice !== ""
          ? Number(vegPrice)
          : undefined,
      nonVegPrice:
        nonVegPrice !== undefined && nonVegPrice !== ""
          ? Number(nonVegPrice)
          : undefined,
      ownerName,
      adharNumber,
      phoneNumber,
      lat: lat !== undefined && lat !== "" ? Number(lat) : undefined,
      lon: lon !== undefined && lon !== "" ? Number(lon) : undefined,
      isLimited:
        isLimited === "on" || isLimited === true || isLimited === "true",
    };

    // remove undefined keys so validators don't override existing values unintentionally
    Object.keys(update).forEach(
      (k) => update[k] === undefined && delete update[k]
    );

    let mess = await Mess.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
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
