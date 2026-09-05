const User = require("../models/User"); 
const bcrypt = require("bcryptjs"); 
const Joi = require("joi");

const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
// ============================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// Protected
// ============================================================
const updateProfile = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
          "string.empty": "Name is required",
          "string.min": "Name must be at least 2 characters",
          "string.max": "Name cannot exceed 100 characters",
        }),

      email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
          "string.empty": "Email is required",
          "string.email": "Please enter a valid email address",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, email } = value;

    // Check whether another account already uses this email
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email address is already in use.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

// ============================================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// Protected
// ============================================================
const changePassword = async (req, res) => {
  try {
    const schema = Joi.object({
      currentPassword: Joi.string()
        .required()
        .messages({
          "string.empty": "Current password is required",
        }),

      newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
        )
        .required()
        .messages({
          "string.empty": "New password is required",
          "string.min": "New password must be at least 8 characters",
          "string.max": "New password cannot exceed 128 characters",
          "string.pattern.base":
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),

      confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "Passwords do not match",
          "string.empty": "Please confirm your new password",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      currentPassword,
      newPassword,
    } = value;

    // Password must actually be different
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password.",
      });
    }

    // Explicitly select password because User model uses select:false
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Check current password
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  changePassword,
};