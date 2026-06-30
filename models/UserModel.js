const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  //name
  name: String,
  //email
  email: String,
});

module.exports = mongoose.model("User", userSchema);
