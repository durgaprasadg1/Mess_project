const express = require('express');
const router = express.Router({mergeParams:true});
const Mess = require("../Models/mess");
const Consumer = require("../Models/consumer.js")
const { isLoggedIn, validateMess } = require('../MiddleWares.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js')
const uploads = multer({ storage });
const wrapAsync = require('../utils/wrapAsync.js');
const {showAllMess, newMessForm, addNewMess} = require('../Controllers/mess.js')


router.get("/", wrapAsync(showAllMess ));

router.get('/new', isLoggedIn,newMessForm);

router.post('/new',uploads.single('image'), isLoggedIn , validateMess , wrapAsync(addNewMess));




module.exports= router;