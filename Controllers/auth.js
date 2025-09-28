

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
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey", // this is literally the string "apikey"
    pass: process.env.SENDGRID_API_KEY,
  },
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

    const link = `${process.env.CLIENT_URL}/login/reset/${user.resetToken}`;
    // const link = `${process.env.LOCAL_URL}/login/reset/${user.resetToken}`;

    await transporter.sendMail({
  from: `"MessMate Support" <${process.env.MAIL_USER}>`,
  to: user.email,
  subject: "Password Reset Request - MessMate",
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        
        <h2 style="color: #0d6efd; text-align: center;">🔐 Password Reset Request</h2>
        
        <p>Dear <b>${user.username || "User"}</b>,</p>
        
        <p>We received a request to reset the password for your <b>MessMate</b> account.  
        If this was you, please click the button below to securely reset your password:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${link}" 
             style="background-color: #0d6efd; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; display: inline-block;">
             Reset My Password
          </a>
        </div>
        
        <p>If the button above doesn’t work, copy and paste the link below into your browser:</p>
        <p style="word-break: break-all; color: #555;">${link}</p>
        
        <hr style="margin: 20px 0;">
        
        <p style="font-size: 14px; color: #666;">
          ⚠️ If you did not request this password reset, you can safely ignore this email.  
          Your account will remain secure and no changes will be made.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          This link is valid only for <b>1 hour</b> from the time it was sent.  
          After that, you will need to request another password reset.
        </p>
        
        <p style="margin-top: 30px;">Thanks,<br>
        <b>The MessMate Support Team</b></p>
        
      </div>
    </div>
  `
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
