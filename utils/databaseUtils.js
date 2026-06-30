const mongoose = require("mongoose");
const connectionDB = mongoose.connect("mongodb://localhost:27017");
console.log("mongodb connected");
module.exports = connectionDB;
