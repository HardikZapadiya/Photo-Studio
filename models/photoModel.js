const mongoose = require("mongoose");

const photoSchema = mongoose.Schema(
  {
    //who upload - link to user model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Image name
    filename: {
      type: String,
      required: true,
    },
    // Path of uploaded image
    path: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/webp"],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    // Quantity (4, 8, 16, 20)
    quantity: {
      type: Number,
      required: true,
      enum: [4, 8, 16, 20],
    },
    // Generated sheet image
    printUrl: {
      type: String,
      default: null,
    },
    // Original uploaded image URL for in-browser crop preview
    originalUrl: {
      type: String,
      default: null,
    },
    // Status (pending → printed)
    status: {
      type: String,
      enum: ["Pending", "Printed"],
    },
  },
  {
    timestamps: true,
  },
);

//for performing db operations on this schema, we need to create a model type exports.
module.exports = mongoose.model("photo", photoSchema);
