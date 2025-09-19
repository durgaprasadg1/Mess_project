const Mess = require("../Models/mess");
const Consumer = require("../Models/consumer")
module.exports.showAllMess = async (req, res) => {
  let messes = await Mess.find({});
  res.render("mess.ejs", { messes });
}

module.exports.newMessForm =  (req,res)=>{
  res.render("newMessForm.ejs");
}

module.exports.addNewMess = async(req,res)=>{
  let url = req.file.path;
  let filename = req.file.filename;
  let {name,description,address} = req.body;
  let newMess = new Mess ({ name : name, description : description, address:address});
  newMess.owner = req.user._id;
  let consumer = await Consumer.findById(req.user._id);
  consumer.mess.push(newMess._id);
  newMess.image = {url,filename};
  await consumer.save();
  await newMess.save();
  req.flash("success","New Mess Added !")
  res.redirect("/");
}