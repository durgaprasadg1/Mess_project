const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Mess = require("./mess");
const Order = require("./order");
const Review = require("./reviews");

const consumerSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique:true
  },
  mess: [{
    type: Schema.Types.ObjectId,
    ref: "Mess"
  }],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review"
  }],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: "Order"
  }],

  phone: {
  type: String,
  required: true,
  match: /^[0-9]{10}$/
  },
  isVerified: { 
    type: Boolean,
    default: false
   },

  verifyToken: String,

  verifyTokenExpiry: Date,

  resetToken: String,
  
  resetTokenExpiry: Date


});

consumerSchema.plugin(passportLocalMongoose);

consumerSchema.post("findOneAndDelete", async (consumer) => {
  if (consumer) {
    await Mess.deleteMany({ _id: { $in: consumer.mess } });

    await Review.deleteMany({ _id: { $in: consumer.reviews } });

    await Order.deleteMany({ _id: { $in: consumer.orders } });
  }
});
const Consumer = mongoose.model("Consumer",consumerSchema);
module.exports = Consumer;