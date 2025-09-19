const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    feedback :{
        type : String,
        minLength:3,
    },
    rating:{
        type:Number,
        default:1,
        min:1,
        max : 5
    },
    createdAt :{
        type : Date,
        default : Date.now()
    },
    author :{
        type : Schema.Types.ObjectId,
        ref : "Consumer",
    }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;