const express = require('express');
const router = express.Router();

const {
  register,
  login,
  uploadProfilePic,
  skipProfilePic,
  forgotPassword,
  resetPassword,
} = require('../controller/userController');

const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/userAuth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post(
  '/upload-profile-pic',
  verifyToken,
  upload.single('profilePic'),
  uploadProfilePic
);

router.post('/skip-profile-pic', verifyToken, skipProfilePic);

module.exports = router;