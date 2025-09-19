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
router.get("/search", async (req, res) => {
  try {
    const { search } = req.query;

    // Agar user ne kuch nahi likha
    if (!search) {
      req.flash("error", "Please enter something to search");
      return res.redirect("/mess");
    }

    // Case-insensitive partial match
    const messes = await Mess.find({
      name: { $regex: search, $options: "i" }
    });
    console.log(messes)

    
    if (!messes) {
    req.flash("error", "Mess not found");
    return res.redirect("/mess");
    }

    if (messes.length === 0) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }

    // Yaha tum decide karo: ek single mess show karna hai ya list
    res.render("Mess/singlemess", { messes });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/mess");
  }
});


module.exports= router;