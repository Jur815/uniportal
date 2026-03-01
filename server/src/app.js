const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("devs"));

app.use("/api/v1", routes); 

module.exports = app; 
