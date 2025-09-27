const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    consumer: {
      type: Schema.Types.ObjectId,
      ref: "Consumer",
      required: true,
    },
    mess: {
      type: Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },

    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },

    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed"],
      default: "created",
    },

    paymentVerified: {
      type: Boolean,
      default: false,
    },
    noOfPlate:{
      type:Number,
      default:1
    },
    done: {
      type: Boolean,
      default: false,
    },
    isTaken: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
