const User = require('../models/userModel');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { transporter,sendOtpEmail,verifyToken  } = require('../middleware/userAuth')
const upload = require("../middleware/upload")
// 1. REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Username duplicate check
    const usernameExists = await User.findOne({ username:normalizedUsername });
    if (usernameExists) {
      return res.status(409).json({ message: "Username must be unique" });
    }

    // 3. Email duplicate check
    const emailExists = await User.findOne({ email:normalizedEmail });
    if (emailExists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user
    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      isProfileComplete: false,
    });

    const savedUser = await user.save();

    // 6. Generate token
    const token = jwt.sign(
      { _id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 7. Response
    res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        profilePic: savedUser.profilePic || null,
        isProfileComplete: savedUser.isProfileComplete,
      },
    });

  }catch (err) {
  // 🔴 MongoDB duplicate key error
  if (err.code === 11000) {
    if (err.keyValue?.username) {
      return res.status(409).json({
        message: "Username must be unique",
      });
    }

    if (err.keyValue?.email) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }
  }

  console.error("REGISTER ERROR:", err);
  return res.status(500).json({
    message: "Server error",
  });
}
});


// 2. UPLOAD PROFILE PIC (Post-Registration Step)
router.post(
  "/upload-profile-pic",
  verifyToken,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      console.log("UPLOAD HIT");
      console.log("req.file:", req.file);

      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      // Cloudinary gives URL here
      const imageUrl = req.file.path;

      await User.findByIdAndUpdate(req.user._id, {
        profilePic: imageUrl,
        isProfileComplete: true,
      });

      console.log("CLOUDINARY URL:", imageUrl);

      res.json({
        message: "Profile picture updated",
        imageUrl,
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// 3. SKIP PROFILE PIC (Optional: If user clicks "Skip")
router.post('/skip-profile-pic', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isProfileComplete: true },
      { new: true }
    ).select("_id username email profilePic isProfileComplete");

      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
          isProfileComplete: user.isProfileComplete
        }
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        isProfileComplete: user.isProfileComplete
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. FORGOT PASSWORD (Send OTP)
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Generate 6 digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Set OTP and Expiry (10 minutes)
//     user.otp = otp;
//     user.otpExpires = Date.now() + 10 * 60 * 1000;
//     await user.save();

//     // Send Email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Password Reset OTP',
//       text: `Your OTP for password reset is: ${otp}`
//     };
//     // console.log("USER:", process.env.EMAIL_USER);
//     // console.log("PASS:", process.env.EMAIL_PASS);

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//         return res.status(500).json({ message: 'Error sending email' });
//       } else {
//         res.json({ message: 'OTP sent to email' });
//       }
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// 6. RESET PASSWORD (Verify OTP & Change Password)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() } // Check if expiry is in the future
    });

    if (!user) return res.status(400).json({ message: 'Invalid OTP or OTP Expired' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;