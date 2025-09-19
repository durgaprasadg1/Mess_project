
const Consumer = require('../Models/consumer');
const passport = require('passport');


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
        await Consumer.register(newUser,password);
        req.flash("success", "Registration SuccessFul. \n Please Login !");
        res.redirect("/mess");
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup")
    }
}