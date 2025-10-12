if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const Consumer = require("./Models/consumer");
const indvMessRouter = require("./router/indvMess");
const messRouter = require("./router/mess");
const userRouter = require("./router/signin");
const loginRouter = require("./router/login");
const orderRouter = require("./router/orders");
const consumerRouter = require("./router/consumer");
const webpush = require('web-push')


const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

webpush.setVapidDetails(
  "mailto:messmated@gmail.com",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE
);

const MONGO_URL = "mongodb://127.0.0.1:27017/MessManagement";
// const dbUrl = MONGO_URL;
const dbUrl = process.env.ATLASDB_URL;
mongoose
  .connect(dbUrl)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(" MongoDB Connection Failed", err));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});
store.on("error", () => {
  console.log("Session store error");
});

const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(session(sessionOption));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Consumer.authenticate()));
passport.serializeUser(Consumer.serializeUser());
passport.deserializeUser(Consumer.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.noOfMess = req.user?.mess ? req.user.mess.length : 0;
  res.locals.open = true;

  next();
});

app.get("/", (req, res) => res.render("home.ejs"));

app.use("/mess", messRouter);          
app.use("/signup", userRouter);        
app.use("/login", loginRouter);         
app.use("/mess/:id", indvMessRouter);   
app.use("/orders/:id", orderRouter);   
app.use("/consumer/:id", consumerRouter);  

app.all("*", (req, res) => {
  res.status(404).render("error/pagenotfound.ejs");
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  console.error("Error: ", err);
  res.status(statusCode).render("error/error.ejs", { message });
});


  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });



