const path = require("path");

const express = require("express");
const photoRouter = express.Router();

//👉 Multer = tool that lets your Express app receive uploaded files
const multer = require("multer");

const photoController = require("../controllers/photoController");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "public", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// 1. GET HOME PAGE
photoRouter.get("/", photoController.getHome);
//2. UPLOAD IMAGE + GENERATE SHEET
photoRouter.post(
  "/upload",
  upload.single("photo"),
  photoController.uploadPhoto,
);
// 3. UPDATE QUANTITY + REGENERATE
photoRouter.post("/update-quantity/:id", photoController.updateQuantity);
//4. GET ALL PHOTOS (LIST PAGE)
photoRouter.get("/photos", photoController.getAllPhotos);

photoRouter.get("/printedAck/:id", photoController.markPrinted);

// 5. CROP PHOTO
photoRouter.post("/crop/:id", upload.single("photo"), photoController.cropPhoto);

module.exports = photoRouter;
