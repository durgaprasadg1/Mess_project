const express = require('express');
const router = express.Router({mergeParams:true});
const passport = require('passport');
const Consumer = require('../Models/consumer.js');
const wrapAsync = require('../utils/wrapAsync.js')
const { renderLoginForm, doingLogin, doingLogOut, forgetPassWord,resetToken, forgetFormRender, makingToken } = require('../Controllers/auth.js');

router.get("/",renderLoginForm);
router.post('/',    
  passport.authenticate('local', { failureRedirect: '/login',failureFlash:true,successFlash:true }),
 doingLogin);

router.get("/logout", doingLogOut);


router.get("/forget", forgetFormRender);

router.post("/forget", wrapAsync(forgetPassWord));


router.get("/reset/:token",wrapAsync(makingToken));

router.post("/reset/:token",wrapAsync( resetToken ))


module.exports = router;


