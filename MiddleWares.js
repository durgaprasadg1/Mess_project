const Mess = require("./Models/mess");
const Review = require("./Models/reviews");
const {
  reviewSchema,
  messSchema,
  consumerSchema,
  orderValidationSchema,
} = require("./schema.js");
const expressError = require("./utils/expressError.js");
const isLoggedIn = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must logged in ");
    res.redirect("/login");
  }
  next();
};
const isAuthor = async (req, res, next) => {
  let { id, reviewid } = req.params;
  let review = await Review.findById(reviewid);
  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You Dont have Permission To Delete Review.");
    return res.redirect(`/mess/${id}`);
  }
  next();
};

const isOwner = async (req, res, next) => {
  const { id } = req.params;
  const mess = await Mess.findById(id);
  console.log(true)

  // If mess not found, avoid accessing properties on null
  if (!mess) {
    req.flash("error", "Mess not found");
    return res.redirect("/mess");
  }

  // Ensure we have a logged in user (isLoggedIn middleware should usually run first)
  const user = req.user || res.locals.currentUser;
  if (!user) {
    req.flash("error", "You must be logged in to perform this action");
    return res.redirect("/login");
  }

  const userId = user._id || user.id;
  if (!mess.owner || !mess.owner.equals(userId)) {
    req.flash("error", "You don't have permission to edit this mess");
    return res.redirect(`/mess/${id}`);
  }
  return next();
};
const savedRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // yaha pe se validate krr rha hai
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    req.flash("error", errMsg);
    return next(error);
    // ye jo err hai vo server side error hai , iske object me bahut saari error related jaankaari rhti hai , chaho to postman se error daalkr dekh skte ho
  }
  next();
};

const validateMess = (req, res, next) => {
  let { error } = messSchema.validate(req.body.mess);

  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    req.flash("error", new expressError(400, msg));
  }
  next();
};
const validateConsumer = (req, res, next) => {
  let { error } = consumerSchema.validate(req.body.consumer);

  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    req.flash("error", new expressError(400, msg));
  }
  next();
};
const validateOrder = (req, res, next) => {
  let { error } = orderValidationSchema.validate(req.body.order);

  if (error) {
    let msg = error.details.map((el) => el.message).join(",");

    req.flash("error", new expressError(400, msg));
  }
  next();
};

module.exports = {
  isAuthor,
  isLoggedIn,
  isOwner,
  validateReview,
  validateMess,
  validateConsumer,
  validateOrder,
};
