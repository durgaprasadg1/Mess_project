const mongoose = require("mongoose");
const Mess = require("../Models/mess");
const data = require('./data.js');

const MONGO_URL = "mongodb://127.0.0.1:27017/MessManagement";
main()
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => {
    console.log("Connection failed");
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}


async function initialiseData(){
  await Mess.deleteMany({});
  await Mess.insertMany(data.messes);
  console.log("Data INitialised");
}
 initialiseData();