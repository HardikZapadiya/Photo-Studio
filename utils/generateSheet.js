const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const passportSheet = require("../models/photoModel");

// ── Config ────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, "..", "public", "generated");
const PHOTO_Width = 400;
const PHOTO_Height = 480;
const GAP = 20;
const TARGET_RATIO = PHOTO_Width / PHOTO_Height; // 3:4 portrait

// ── Helpers ───────────────────────────────────────────

// Create output folder if it doesn't exist
function makeOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Always return { cols, rows } — 4 columns, rows calculated from quantity
function getGrid(quantity) {
  const cols = 4;
  const rows = Math.ceil(quantity / cols);
  return { cols, rows };
}

// Crop source image to match 3:4 passport ratio
// Returns { sx, sy, sWidth, sHeight } — the crop window on the original image
function getCropWindow(image) {
  const sourceRatio = image.width / image.height;

  if (sourceRatio > TARGET_RATIO) {
    // Too wide → trim left & right sides
    const croppedWidth = image.height * TARGET_RATIO;
    return {
      sx: (image.width - croppedWidth) / 2,
      sy: 0,
      sWidth: croppedWidth,
      sHeight: image.height,
    };
  }

  if (sourceRatio < TARGET_RATIO) {
    // Too tall → trim top & bottom
    const croppedHeight = image.width / TARGET_RATIO;
    return {
      sx: 0,
      sy: (image.height - croppedHeight) / 2,
      sWidth: image.width,
      sHeight: croppedHeight,
    };
  }

  // Already correct ratio → no crop needed
  return { sx: 0, sy: 0, sWidth: image.width, sHeight: image.height };
}

// Draw one passport photo at position (x, y) on the canvas
function drawPhoto(ctx, image, crop, x, y) {
  ctx.drawImage(
    image,
    crop.sx,
    crop.sy,
    crop.sWidth,
    crop.sHeight,
    x,
    y,
    PHOTO_Width,
    PHOTO_Height,
  );

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, PHOTO_Width, PHOTO_Height);
}

// ── Main ──────────────────────────────────────────────
async function generateSheet(photoPath, quantity) {
  if (!photoPath) throw new Error("Photo path is required");

  const fullPath = path.resolve(photoPath);

  makeOutputDir();

  const image = await loadImage(fullPath);
  const crop = getCropWindow(image); // calculate crop once, reuse for all photos

  const { cols, rows } = getGrid(quantity);

  const canvasWidth = cols * PHOTO_Width + (cols + 1) * GAP;
  const canvasHeight = rows * PHOTO_Height + (rows + 1) * GAP;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Place each photo on the grid
  for (let i = 0; i < quantity; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = GAP + col * (PHOTO_Width + GAP);
    const y = GAP + row * (PHOTO_Height + GAP);

    drawPhoto(ctx, image, crop, x, y);
  }

  const fileName = `passport-sheet-${Date.now()}-${quantity}.png`;
  fs.writeFileSync(
    path.join(OUTPUT_DIR, fileName),
    canvas.toBuffer("image/png"),
  );

  return `/generated/${fileName}`;
}

module.exports = generateSheet;
