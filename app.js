const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { authroutes } = require("./routes/auth-routes");

dotenv.config();

const MONGOURL = process.env.MONGO_URL;

app.use(express.json());
app.use(cors());

mongoose.connect(MONGOURL).then(() => {
  console.log("MONGO_DB Connected");
}).catch((e) => {
  console.log(e.message);
});

app.use("/auth", authroutes);

app.get("/", (req, res) => {
  console.log("Server Running>>>>>>>>>");
  res.send("Express on Vercel");
});

module.exports = app;