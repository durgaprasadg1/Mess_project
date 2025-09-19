const express = require('express');
const router = express.Router({mergeParams:true});
const { validateConsumer } = require('../MiddleWares');
const wrapAsync = require('../utils/wrapAsync.js');
const { renderSigninForm, signingIn } = require('../Controllers/auth.js');

router.get("/",renderSigninForm);

router.post("/",validateConsumer,  wrapAsync(signingIn))



module.exports =router