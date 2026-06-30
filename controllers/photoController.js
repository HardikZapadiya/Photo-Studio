const {
  createPhoto,
  updatePhoto,
  markPrinted,
  allPhotos,
  cropPhoto,
} = require("../services/photoService");

// 1. GET HOME PAGE
exports.getHome = (req, res) => {
  res.render("dashboard", { titleName: "Dashboard" });
};

//2. UPLOAD IMAGE + GENERATE SHEET
exports.uploadPhoto = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!req.file || !quantity) {
      return res.status(400).send("Missing file or quantity");
    }

    const photo = await createPhoto(req.file, quantity);
    res.render("printedPhotoUrl", {
      photos: photo,
      titleName: "Printed Photos",
    });
  } catch (error) {
    next(error);
  }
};

// 3. UPDATE QUANTITY + REGENERATE
exports.updateQuantity = async (req, res, next) => {
  try {
    const updatedPhoto = await updatePhoto(req.params.id, req.body.quantity);
    res.render("printedPhotoUrl", {
      photos: updatedPhoto,
      titleName: "Updated Printed Photos",
    });
  } catch (error) {
    next(error);
  }
};

//4. GET ALL PHOTOS (LIST PAGE)
exports.getAllPhotos = async (req, res, next) => {
  try {
    const photos = await allPhotos();
    res.render("photoList", { photos, titleName: "Photo List" });
  } catch (error) {
    next(error);
  }
};

// 5. MARK AS PRINTED
exports.markPrinted = async (req, res, next) => {
  try {
    const photo = await markPrinted(req.params.id);
    if (!photo) {
      return res.status(404).send("Photo not found");
    }
    await markPrinted(req.params.id);
    res.render("markPrinted", { photo, titleName: "Photo Marked as Printed" });
  } catch (error) {
    next(error);
  }
};

// 6. CROP PHOTO ✂️
exports.cropPhoto = async (req, res, next) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, error: "No cropped file received" });
    const photo = await cropPhoto(req.params.id, req.file);
    res.json({ success: true, photoId: photo._id, printUrl: photo.printUrl });
  } catch (error) {
    next(error);
  }
};
