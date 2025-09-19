const Mess = require("./Models/mess");
const Review = require("./Models/reviews");
const {reviewSchema, messSchema,consumerSchema,orderValidationSchema} = require('./schema.js');
const expressError = require('./utils/expressError.js')
const isLoggedIn = async(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl
        req.flash("error","You must logged in ");
        res.redirect("/login");
    }
    next();
}
const isAuthor =  async(req,res,next)=>{
    let {id,reviewid} = req.params;
    let review = await Review.findById(reviewid);
    if( !review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You Dont have Permission To Delete Review.");
        return res.redirect(`/mess/${id}`);
    }
    next();
}
    

const isOwner =async (req,res,next)=>{
    let {id} = req.params;
    let mess = await Mess.findById(id);

    if( !mess.owner.equals(res.locals.currentUser.id)){
        req.flash("error", "You Dont have Permission To Edit")
        return res.redirect(`/mess/${id}`);
    }
    next();
}
const savedRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();  
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // yaha pe se validate krr rha hai
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    req.flash("error",errMsg)
    return next(error);
        // ye jo err hai vo server side error hai , iske object me bahut saari error related jaankaari rhti hai , chaho to postman se error daalkr dekh skte ho
  }
  next();
};

const validateMess = (req, res, next) => {
  let { error } = messSchema.validate(req.body.mess); // validate req.body.listing

  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    req.flash("error", new expressError(400, msg));
  }
  next();
};
const validateConsumer = (req, res, next) => {
  let { error } = consumerSchema.validate(req.body.consumer); // validate req.body.listing

  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    req.flash("error", new expressError(400, msg));
  }
  next();
};
const validateOrder = (req,res,next)=>{
  let { error } = orderValidationSchema.validate(req.body.order); // validate req.body.listing

  if (error) {
    let msg = error.details.map((el) => el.message).join(",");

    req.flash("error", new expressError(400, msg));
  }
  next();
}




module.exports = {
    isAuthor,
    isLoggedIn,
    isOwner,
    validateReview,
    validateMess,
    validateConsumer,
    validateOrder,
}