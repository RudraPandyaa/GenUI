require("dotenv").config();
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

// -------------------- MULTER --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// -------------------- NODEMAILER --------------------
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // APP PASSWORD ONLY
//   },
// });

// Verify email connection once
// transporter.verify((error) => {
//   if (error) {
//     console.error("❌ Email config error:", error.message);
//   } else {
//     console.log("✅ Email server ready");
//   }
// });


const sendOtpEmail = async (to, otp) => {
  const res = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "GenUI", email: "viralpandya079@gmail.com" },
      to: [{ email: to }],
      subject: "Password Reset OTP",
      htmlContent: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

// -------------------- JWT VERIFY --------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token Invalid or Expired" });
  }
};

module.exports = {
  upload,
  // transporter,
  verifyToken,
  sendOtpEmail
};