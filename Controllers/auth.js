

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const Consumer = require('../Models/consumer');
const passport = require('passport');
const crypto = require("crypto");
const nodemailer = require("nodemailer");



module.exports.renderLoginForm = (req,res)=>{
    res.render('user/login');
}
module.exports.doingLogin = (req, res)=> {
    if(req.user.mess &&  req.user.mess.length > 0){
        req.flash("success","Welcome , 🍽️ Your mess may have got an order.  ")
    }
    else{
        req.flash("success","Welcome Back")
    }
    res.redirect('/mess');
}
module.exports.doingLogOut  = (req,res)=>{
   req.logOut((err)=>{
    if(err)  return next(err);
    req.flash("success", "You are logged out");
    res.redirect("/mess");
   
   })
}
module.exports.renderSigninForm = (req,res)=>{
    res.render('user/signup');
}

module.exports.signingIn = async(req,res) => {
    try{
        let {username,password,email,phone} = req.body;
        const newUser = new Consumer({ email , username,phone } );

        const registeredUser = await Consumer.register(newUser,password);
        registeredUser.verifyToken = crypto.randomBytes(32).toString("hex");
        registeredUser.verifyTokenExpiry = Date.now() + 3600000;
        await registeredUser.save();

        const link =  `${process.env.LOCAL_URL}/verify/${registeredUser.verifyToken}`;
        req.flash("success", "Registration SuccessFul. \n Please Login !");
        res.redirect("/login");
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup")
    }
}

module.exports.forgetFormRender = (req,res)=>{
    res.render("user/forget.ejs");
}

const transporter = nodemailer.createTransport({
    
  service: "gmail", 
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS
  }
});



module.exports.forgetPassWord = async (req, res) => {
  try {
    const user = await Consumer.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No user with that email");
      return res.redirect("/login/forget");
    }

    user.resetToken = crypto.randomBytes(32).toString("hex");
    user.resetTokenExpiry = Date.now() + 3600000; 
    await user.save();

    const link = `${process.env.LOCAL_URL}/login/reset/${user.resetToken}`;

    await transporter.sendMail({
      from: `"MessMate Support" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`
    });

    req.flash("success", "Reset link sent to your email");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/login/forget");
  }
};



module.exports.makingToken =  async (req, res) => {
  const user = await Consumer.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Invalid or expired reset link");
    return res.redirect("/forget");
  }
  res.render("user/reset", { token: req.params.token }); 
};

module.exports.resetToken = async (req, res) => {
  try {
    const user = await Consumer.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("error", "Invalid or expired token");
      return res.redirect("/forget");
    }

    await user.setPassword(req.body.password); 
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    req.flash("success", "Password reset successful. Please login.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/login/forget");
  }
};
