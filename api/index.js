const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const { authroutes } = require("../routes/auth-routes");

dotenv.config();

const app = express();
const MONGOURL = process.env.MONGO_URL;


app.use(express.json());


const corsOptions = {
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true, 
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

mongoose
    .connect(MONGOURL)
    .then(() => {
        console.log("MONGO_DB Connected");
    })
    .catch((e) => {
        console.error("MongoDB Connection Error: ", e.message);
    });

// Routes
app.use("/auth", authroutes);

app.get("/", (req, res) => {
    res.json({ message: "Server Running" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
