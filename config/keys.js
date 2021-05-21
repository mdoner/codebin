const dotenv = require("dotenv").config();

dbPassword =
  "mongodb+srv://" +
  process.env.CDBN +
  ":" +
  encodeURIComponent(process.env.DB_PW) +
  "@" +
  process.env.CDBN +
  "-db.uckpf.azure.mongodb.net/" +
  process.env.CDBN +
  "?retryWrites=true";

module.exports = {
  mongoURI: dbPassword,
};
