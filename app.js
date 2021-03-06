const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
var path = require("path");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  ensureAdmin,
} = require("./config/auth");
const User = require("./models/User");
const { uuid } = require("uuidv4");
const axios = require("axios");
const bodyParser = require("body-parser");
const JSONHelper = require("./lib/jsonHelper");
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const boolParser = require("express-query-boolean");
const nocache = require("nocache");
const dotenv = require("dotenv").config();

const app = express();

const version = JSONHelper.readFile(__dirname + "/.", "package").version;
const location = JSONHelper.readFile(__dirname + "/.", "package").location;

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({ limit: "5mb", extended: true, parameterLimit: 50000 })
);
app.use(boolParser());

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

//No caching
app.disable("view cache");
app.use(nocache());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index.js"));
app.use("/users", require("./routes/users.js"));
app.use("/admin", require("./routes/admin.js"));
app.use("/share", require("./routes/share.js"));
app.use("/dashboard", require("./routes/dashboard.js"));
app.use("/api", require("./routes/api.js"));

//Error catcher
app.use((err, req, res, next) => {
  if (err) {
    var errCode = uuid();
    res.status("500").json({
      status: 500,
      errorInfo: "Please report the following errorcode to an administrator.",
      errorCode: errCode,
    });

    console.log(err);

    axios
      .post(process.env.WEBHOOK_ERROR, {
        embeds: [
          {
            title: "New Error!",
            description: `New error generated at: ${req.path}`,
            color: 15746887,
            fields: [
              {
                name: "Error code",
                value: `${errCode}`,
              },
              {
                name: "Error status",
                value: "500",
              },
              {
                name: "Error Info",
                value: `${err}`,
              },
            ],
            footer: {
              text: "Error Catcher",
            },
            timestamp: new Date(),
          },
        ],
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    next();
  }
});

//STATIC
app.use("/media", express.static(path.join(__dirname, "/media")));
app.use(express.static(path.join(__dirname, "/public")));

// Error Pages
app.use(function (req, res) {
  res.status(404).render("404/404", {
    data: {
      input: "cx",
      version: version,
      location: location,
      dateNow: Date.now(),
    },
  });
});

//Nightly run
//Soon-ish
// schedule.scheduleJob('0 0 * * *', () => {
// 	const arrayOfFiles = fs.readdirSync(__dirname + '/../raw');
// 	arrayOfFiles.forEach((file) => {
// 		var read = JSONHelper.readFile(__dirname + '/../raw', file.toString().slice(0, -5));
// 		var fileDate = Date(read.date);
// 	});
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
