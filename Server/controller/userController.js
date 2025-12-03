const User = require('../models/userModel');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { upload,transporter,verifyToken } = require('../middleware/userAuth')
// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const emailExist = await User.findOne({ email });
    if (emailExist) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isProfileComplete: false // Default is false
    });

    const savedUser = await user.save();

    // Generate Token immediately so they can upload profile pic
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);

    res.json({ 
      success: true,
      message: 'Registered successfully', 
      token, 
      userId: savedUser._id,
      // Frontend checks this. If true, show dashboard. If false, show Upload Profile Pic page.
      isProfileComplete: savedUser.isProfileComplete 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. UPLOAD PROFILE PIC (Post-Registration Step)
router.post('/upload-profile-pic', verifyToken, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const imageUrl = `/uploads/${req.file.filename}`;

    // Update user: set image and set profile as complete
    await User.findByIdAndUpdate(req.user._id, {
      profilePic: imageUrl,
      isProfileComplete: true
    });

    res.json({ message: 'Profile picture updated', imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. SKIP PROFILE PIC (Optional: If user clicks "Skip")
router.post('/skip-profile-pic', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true });
    res.json({ message: 'Profile setup skipped' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email or Password wrong' });

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Email or Password wrong' });

    // Create token
    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: "8h" }  
    );

    // NOTE: On login, we do NOT force the profile pic page even if it's missing,
    // per your requirement ("not after logging in").
    res.header('auth-token', token).json({ 
      message: 'Logged in successfully', 
      token,
      user: {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. FORGOT PASSWORD (Send OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and Expiry (10 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    };
    console.log("USER:", process.env.EMAIL_USER);
    console.log("PASS:", process.env.EMAIL_PASS);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        res.json({ message: 'OTP sent to email' });
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
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