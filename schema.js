const Joi =  require('joi');
const reviewSchema = Joi.object({
    reviews : Joi.object({
        rating:Joi.number().required().min(1).max(5),
        feedback : Joi.string().required().min(3)
    }).required()
})

const messSchema = Joi.object({
  mess: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    address: Joi.string().required(),
    menu: Joi.string().allow("", null),
    image: Joi.string().required(),
    price: Joi.number().required().min(0),
    owner: Joi.string().required(),
    category: Joi.string().required(),
    ownerName: Joi.string().required(),
    adharNumber: Joi.string().pattern(/^\d{12}$/).required(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).required(),
    lat: Joi.number().required().min(-90).max(90),
    lon: Joi.number().required().min(-180).max(180),
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
