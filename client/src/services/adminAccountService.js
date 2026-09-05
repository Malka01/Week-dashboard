import api from "./api";

// ============================================================
// GET CURRENT LOGGED-IN USER
// GET /api/auth/me
// ============================================================
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data.data;
};

// ============================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ============================================================
export const updateProfile = async (profileData) => {
  const response = await api.put(
    "/auth/profile",
    profileData
  );

  return response.data.data;
};

// ============================================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ============================================================
export const changePassword = async (passwordData) => {
  const response = await api.put(
    "/auth/change-password",
    passwordData
  );

  return response.data;
};