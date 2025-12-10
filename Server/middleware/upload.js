const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "genui/profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [
      { width: 400, height: 400, crop: "fill" }
    ],
  },
});

const upload = multer({ storage });

module.exports = upload;