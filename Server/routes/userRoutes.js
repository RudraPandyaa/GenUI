import express from "express";
import {
    register,
    login,
    uploadProfilePic,
    skipProfilePic,
    forgotPassword,
    resetPassword,
} from "../controller/userController.js";

import upload from '../middleware/upload.js'
import {verifyToken} from "../middleware/userAuth.js";

const router = express.Router();
router.post("/register",register)
router.post("/login", login);
router.post(
    "/upload-profile-pic",
    verifyToken,
    upload.single("profilePic"),
    uploadProfilePic
);
router.post("/skip-profile-pic", verifyToken, skipProfilePic);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;