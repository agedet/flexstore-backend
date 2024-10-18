import { 
	sendPasswordResetEmail, 
	sendResetSuccessEmail, 
	sendVerificationEmail, 
	sendWelcomeEmail 
} from '../lib/mailtrap/send.emails.js';
import Profile from '../models/user.model.js';
import { generateTokenAndSetCookie }  from '../utils/generateTokenAndSetCookies.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

// register user route
export const registerUser = async (req, res) => {
	const { fullName, email, password } = req.body;

	try {
		if (!fullName || !email || !password) {
			console.log("All fields are required");
		}

		const userAlreadyExists = await Profile.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(401).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new Profile({
			fullName,
			email,
			password: hashedPassword,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});

        console.log(user)
	} catch (error) {
        console.log(error)
		res.status(400).json({ success: false, message: error.message });
	}
};

// verify email
export const verifyEmailUser = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await Profile.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired verification code" 
            });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
	}
};

// login
export const loginUser = async (req, res) => {
    const {email, password } = req.body;

    try {
        const user = await Profile.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email',
            });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password); 
        if (isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new DataTransfer();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("Error in login", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// logout
export const logoutUser = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

// forgot password
export const forgotPasswordUser = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await Profile.findOne({ email });

		if (!user) {
			return res.status(400).json({ 
                success: false, 
                message: "User not found" 
            });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// rest password
export const resetPasswordUser = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await Profile.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired reset token" 
            });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// checkauth
export const checkAuthUser = async (req, res) => {
	try {
		const user = await Profile.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// auth midddleware
