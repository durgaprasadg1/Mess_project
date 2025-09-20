const Mess = require("../Models/mess");
const Consumer = require("../Models/consumer")
module.exports.showAllMess = async (req, res) => {

  let messes = await Mess.find({});
  if(!messes){
    req.flash("error", "No Mess Found");
    res.redirect("/");
  }
  res.render("mess.ejs", { messes });
}

module.exports.newMessForm =  (req,res)=>{
  res.render("newMessForm.ejs");
}

module.exports.addNewMess = async(req,res)=>{ 
  try{
    let url = req.file.path;
    let filename = req.file.filename;
    let {name,description,address,category} = req.body;
    let newMess = new Mess ({ name : name, description : description, address:address, category : category});
    if(!newMess){
      req.flash("error","No mess Added!");
      res.redirect("/"); 
    }
    newMess.owner = req.user._id;
    let consumer = await Consumer.findById(req.user._id);
    consumer.mess.push(newMess._id);
    newMess.image = {url,filename};
    await consumer.save();
    await newMess.save();
    req.flash("success","New Mess Added !");
    res.redirect("/"); 
  }
  catch{
    req.flash("error","Failed In addition Of New Mess");
    res.redirect("/"); 
  }
}
module.exports.searchMess =  async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      req.flash("error", "Please enter something to search");
      return res.redirect("/mess");
    }

    const messes = await Mess.find({
      name: { $regex: search, $options: "i" }
    });

    
    if (!messes) {
    req.flash("error", "Mess not found");
    return res.redirect("/mess");
    }

    if (messes.length === 0) {
      req.flash("error", "Mess not found");
      return res.redirect("/mess");
    }

    res.render("Mess/singlemess", { messes });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/mess");
  }
}