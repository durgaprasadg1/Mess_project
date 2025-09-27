const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');
const Order = require('./order');
const messSchema = Schema({
    name : {  
        type :String,
        required : true,
        minLength :3,
    },
    description : {
        type : String,
    },
    image :{
        url : {
            type:String,
        },
        filename:String
    },
    address :{
        type : String, 
    },
    menu:[{
        type : String, 
        default : ""
    }],
    
    price :Number,
    owner : {
        type : Schema.Types.ObjectId,
        ref:"Consumer",
    },
    reviews : [
    {
      type : Schema.Types.ObjectId,
      ref : "Review"
    }
  ],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: "Order"
  }],
  category : {
    type  : String,
    required: true,
    minLength:2
  },
  isOpen :{
    type:Boolean,
    default :true
  },
  ownerName: {
  type: String,
  required: true
  },
  adharNumber: {
    type: String,   
    required: true,
    match: /^\d{12}$/  
  },
  phoneNumber: {
    type: String,   
    required: true,
    match: /^\d{10}$/  
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lon: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  }

});

// on Delete Cascade \/

messSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {

    if (doc.reviews.length) {
      await Review.deleteMany({ _id: { $in: doc.reviews } });
    }

    if (doc.orders.length) {
      await Order.deleteMany({ _id: { $in: doc.orders } });
    }
   
  }
});

const Mess = mongoose.model("Mess",messSchema);
module.exports = Mess;
