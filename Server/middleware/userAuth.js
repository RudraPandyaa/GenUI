import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/* ================= JWT VERIFY ================= */
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

/* ================= SEND OTP ================= */
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

export { verifyToken, sendOtpEmail };