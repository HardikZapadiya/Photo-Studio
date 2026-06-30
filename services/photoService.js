const path = require("path");
const fs = require("fs");

// Import model + utils
const PhotoModel = require("../models/photoModel");
const generateSheet = require("../utils/generateSheet");

//2. CREATE PHOTO + GENERATE SHEET
//Flow: 1. Receive file + quantity 2. Save file info 3. Generate sheet 4. Save to DB
exports.createPhoto = async (file, quantity) => {
  const photo = new PhotoModel({
    filename: file.filename,
    fileSize: Number(file.size),
    path: file.path,
    mimeType: file.mimetype, //MIME type = file identity(.png, .jpeg, ext..)
    quantity: Number(quantity),
    originalUrl: `/uploads/${file.filename}`,
    status: "Pending",
  });
  console.log("photo is in create photo: ✅", photo);

  const sheetPath = await generateSheet(photo.path, photo.quantity);
  photo.printUrl = sheetPath;
  await photo.save();
  return photo;
};

//3. UPDATE QUANTITY + REGENERATE
//Flow: 1.Find photo 2.Update quantity 3.Regenerate sheet 4.Save again
exports.updatePhoto = async (id, quantity) => {
  const photo = await PhotoModel.findById(id);
  console.log("photo is before: ✅", photo);
  if (!photo) {
    throw Error("Photo is not Found!!");
  }

  // ✅ delete old generated file (prevents folder clutter)
  if (photo.printUrl) {
    const oldFilePath = path.join(__dirname, "..", "public", photo.printUrl);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }
  photo.quantity = Number(quantity);
  photo.printUrl = await generateSheet(photo.path, photo.quantity);
  await photo.save();
  console.log("photo is after : ✅", photo);
  return photo;
};

//4. GET ALL PHOTOS (LIST PAGE)
exports.allPhotos = async () => {
  const photos = await PhotoModel.find().sort({ createdAt: -1 });
  return photos;
};

//5. MARK PRINTED
exports.markPrinted = async (photoId) => {
  const photo = await PhotoModel.findById(photoId);

  if (!photo) {
    throw Error("Photo not Found!!");
  }
  photo.status = "Printed";
  await photo.save();
  return photo;
};

// 6. CROP PHOTO ✂️
// Flow: 1. Find photo  2. Delete old original + sheet  3. Save new cropped file  4. Regenerate sheet
exports.cropPhoto = async (id, file) => {
  const photo = await PhotoModel.findById(id);
  if (!photo) throw Error("Photo not Found!");

  // Delete old generated sheet
  if (photo.printUrl) {
    const oldSheet = path.join(__dirname, "..", "public", photo.printUrl);
    if (fs.existsSync(oldSheet)) fs.unlinkSync(oldSheet);
  }

  // Delete old original upload
  if (photo.path) {
    if (fs.existsSync(photo.path)) fs.unlinkSync(photo.path);
  }

  // Save new cropped file info
  photo.filename = file.filename;
  photo.fileSize = Number(file.size);
  photo.path = file.path;
  photo.mimeType = file.mimetype;
  photo.originalUrl = `/uploads/${file.filename}`;

  // Regenerate sheet with new cropped image
  photo.printUrl = await generateSheet(photo.path, photo.quantity);
  await photo.save();

  return photo;
};
