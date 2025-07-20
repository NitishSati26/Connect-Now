import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

export const signup = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  try {
    if (!fullName) {
      return res.status(400).json({ message: "fullName is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email field is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password field is required" });
    }

    if (!confirmPassword) {
      return res
        .status(400)
        .json({ message: "Confirm password field is required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate JWT Token
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    // console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate request fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id, res);

    // Respond with user details and token
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    // console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    // console.log("Error in logout controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    // Emit real-time profile update to all connected users
    io.emit("profileUpdated", {
      userId: updatedUser._id,
      profilePic: updatedUser.profilePic,
      updatedAt: updatedUser.updatedAt,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    // console.log("Error in Update Profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    // console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Validate request fields
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Password validation (same as signup)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, and one special character",
      });
    }

    // Find user by email (email is already validated before modal opens)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    // console.log("Error in resetPassword controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate request fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "You are not registered with this email address",
        exists: false,
      });
    }

    res.status(200).json({
      message: "Email found",
      exists: true,
    });
  } catch (error) {
    // console.log("Error in checkEmail controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
