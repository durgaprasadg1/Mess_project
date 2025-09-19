const Joi =  require('joi');
const reviewSchema = Joi.object({
    reviews : Joi.object({
        rating:Joi.number().required().min(1).max(5),
        feedback : Joi.string().required().min(3)
    }).required()
})

const messSchema = Joi.object({ // ye ek object hai jo actual scehema ke field ko use krke validate krr skta hai.
    // .required() means --> vo field required hai , allow() meas allowed hai min(minimum Value) itni honi chahiye
    mess: Joi.object({
        name:Joi.string().required(),
        description:Joi.string().required(),
        address:Joi.string().required(),
        menu : Joi.string().allow("",null),
        image: Joi.string().allow("",null),
        price:Joi.number().required().min(0),
        owner : Joi.string().required(),
        category: Joi.string().required(),
    }).required()
});

const consumerSchema = Joi.object({ 
  consumer: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    mess: Joi.array().items(Joi.string().hex().length(24)).optional(),
  }).required()
});


const orderValidationSchema = Joi.object({
  consumer: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId validation"),

  mess: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId validation"),

  totalPrice: Joi.number().min(0).required(),

  status: Joi.string()
    .valid("created", "pending", "paid", "failed")
    .default("created"),

  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().allow("", null),
  razorpaySignature: Joi.string().allow("", null),

  paymentVerified: Joi.boolean().default(false),
  done: Joi.boolean().default(false),
});

module.exports = {
    reviewSchema,
    messSchema,
    consumerSchema,
    orderValidationSchema,

}
