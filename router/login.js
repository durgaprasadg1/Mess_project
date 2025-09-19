const express = require('express');
const router = express.Router({mergeParams:true});
const passport = require('passport');
const { renderLoginForm, doingLogin, doingLogOut } = require('../Controllers/auth.js');

router.get("/",renderLoginForm);
router.post('/',    
  passport.authenticate('local', { failureRedirect: '/login',failureFlash:true,successFlash:true }),
 doingLogin);

router.get("/logout", doingLogOut);

module.exports = router