import express from 'express';
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    checkAuthUser, 
    verifyEmailUser,
    forgotPasswordUser,
    resetPasswordUser
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router();

// check if user is signed in when refers page
router.get("/check-auth", verifyToken, checkAuthUser);

router.post('/register', registerUser);
router.get('/login', loginUser);
router.post("/logout", logoutUser);

router.post("/verify-email", verifyEmailUser);
router.post("/forgot-password", forgotPasswordUser);

router.post("/reset-password/:token", resetPasswordUser);

export default router;
