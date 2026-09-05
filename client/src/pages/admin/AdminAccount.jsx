import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
  KeyRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  updateProfile,
  changePassword,
} from "../../services/adminAccountService";

const AdminAccount = () => {

  // ----------------------------------------------------------
  // Profile state
  // ----------------------------------------------------------
  const { user, updateUser } = useAuth();
  

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // ----------------------------------------------------------
  // Password state
  // ----------------------------------------------------------

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  // ----------------------------------------------------------
  // Load current user
  // ----------------------------------------------------------

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // ----------------------------------------------------------
  // Profile handlers
  // ----------------------------------------------------------

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileError("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!profile.name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    if (profile.name.trim().length < 2) {
      setProfileError(
        "Name must be at least 2 characters."
      );
      return;
    }

    if (!profile.email.trim()) {
      setProfileError("Email is required.");
      return;
    }

    try {
      setProfileLoading(true);

      const data = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });

      const updatedUser = data.user;

      // Update local AuthContext immediately
      updateUser(updatedUser);

      // Update local profile
      setProfile({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
      });

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error("Profile update error:", error);

      setProfileError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  

  // ----------------------------------------------------------
  // Password handlers
  // ----------------------------------------------------------

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  const validatePassword = () => {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwords;

    if (!currentPassword) {
      return "Current password is required.";
    }

    if (!newPassword) {
      return "New password is required.";
    }

    if (newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (newPassword.length > 128) {
      return "New password cannot exceed 128 characters.";
    }

    if (!/[A-Z]/.test(newPassword)) {
      return "Password must contain an uppercase letter.";
    }

    if (!/[a-z]/.test(newPassword)) {
      return "Password must contain a lowercase letter.";
    }

    if (!/[0-9]/.test(newPassword)) {
      return "Password must contain a number.";
    }

    if (!/[@$!%*?&]/.test(newPassword)) {
      return "Password must contain a special character.";
    }

    if (newPassword === currentPassword) {
      return "New password must be different from your current password.";
    }

    if (!confirmPassword) {
      return "Please confirm your new password.";
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const validationError = validatePassword();

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      setPasswordLoading(true);

      await changePassword(passwords);

      setPasswordMessage(
        "Password changed successfully."
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);

      setPasswordError(
        error.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Password strength
  // ----------------------------------------------------------

  const passwordStrength = (() => {
    const password = passwords.newPassword;

    if (!password) {
      return {
        label: "",
        width: "w-0",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        width: "w-1/3",
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        width: "w-2/3",
      };
    }

    return {
      label: "Strong",
      width: "w-full",
    };
  })();

  // ----------------------------------------------------------
  // Reusable input class
  // ----------------------------------------------------------

  const inputClass =
    "w-full px-3 py-2.5 border border-slate-300 rounded-lg " +
    "outline-none transition focus:ring-2 focus:ring-blue-500 " +
    "focus:border-blue-500";

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ================================================== */}
      {/* Header */}
      {/* ================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Account Settings
        </h1>

        <p className="text-slate-500 mt-1">
          Manage your administrator profile and account
          security.
        </p>
      </div>

      {/* ================================================== */}
      {/* Profile */}
      {/* ================================================== */}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Profile Information
              </h2>

              <p className="text-sm text-slate-500">
                Update your personal account information.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="p-6"
        >

          {/* Profile Avatar */}
          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {profile.name || "Administrator"}
              </p>

              <p className="text-sm text-slate-500">
                Administrator account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="admin@example.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>

              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-blue-600" />

                <span className="text-sm font-medium text-slate-700">
                  ADMIN
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1">
                Your administrator role cannot be changed
                here.
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Status
              </label>

              <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full" />

                <span className="text-sm font-medium text-green-700">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Message */}
          {profileMessage && (
            <div className="flex items-center gap-2 mt-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="flex items-center gap-2 mt-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              {profileError}
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Save className="w-4 h-4" />

              {profileLoading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* ================================================== */}
      {/* Security */}
      {/* ================================================== */}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">

            <div className="p-2 bg-purple-50 rounded-lg">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Security
              </h2>

              <p className="text-sm text-slate-500">
                Change your account password.
              </p>
            </div>

          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="p-6"
        >

          <div className="max-w-xl space-y-5">

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password
              </label>

              <div className="relative">

                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className={`${inputClass} pl-10 pr-10`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className={`${inputClass} pl-10 pr-10`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>

              {/* Password Strength */}
              {passwords.newPassword && (
                <div className="mt-2">

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.width} transition-all`}
                    />
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Password strength:{" "}
                    <span className="font-medium">
                      {passwordStrength.label}
                    </span>
                  </p>

                </div>
              )}

              <div className="mt-2 text-xs text-slate-500 space-y-1">
                <p>• At least 8 characters</p>
                <p>• One uppercase letter</p>
                <p>• One lowercase letter</p>
                <p>• One number</p>
                <p>• One special character</p>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={`${inputClass} pl-10 pr-10`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>

              {/* Match indicator */}
              {passwords.confirmPassword && (
                <p
                  className={`text-xs mt-1 ${
                    passwords.newPassword ===
                    passwords.confirmPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwords.newPassword ===
                  passwords.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

          </div>

          {/* Password Message */}
          {passwordMessage && (
            <div className="flex items-center gap-2 mt-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-2 mt-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              {passwordError}
            </div>
          )}

          {/* Change Password */}
          <div className="flex justify-end mt-6">

            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Lock className="w-4 h-4" />

              {passwordLoading
                ? "Changing..."
                : "Change Password"}
            </button>

          </div>

        </form>
      </div>

      {/* ================================================== */}
      {/* Security Information */}
      {/* ================================================== */}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

        <div className="flex gap-3">

          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />

          <div>
            <h3 className="font-semibold text-blue-900">
              Account Security
            </h3>

            <p className="text-sm text-blue-700 mt-1">
              Keep your administrator password secure and
              never share it with other users.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminAccount;
