const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const photoRouter = require("./routes/photoRouter");
const { default: mongoose } = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded());

app.use((req, res, next) => {
  console.log("Server Will be connected HIT!!!", req.url, req.method);
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/cropperjs",
  express.static(path.join(__dirname, "node_modules", "cropperjs", "dist")),
);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(photoRouter);

const PORT = 2000;
const DB_PATH = "mongodb://localhost:27017/PIGenerator";

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to Database!!");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Server Error Database not Connected!!");
  });
