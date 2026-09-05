import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getUsers,
  createUser,
  updateUser,
  // deactivateUser,
} from "../../services/userService";

import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "TEAM_MEMBER",
  isActive: true,
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // =========================
  // State
  // =========================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // Load Users
  // =========================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {};

      if (search.trim()) {
        filters.search = search.trim();
      }

      if (roleFilter) {
        filters.role = roleFilter;
      }

      if (statusFilter) {
        filters.isActive = statusFilter;
      }

      const data = await getUsers(filters);

      setUsers(data?.users || data || []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reload automatically when role/status changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [roleFilter, statusFilter]);

  // =========================
  // Search
  // =========================

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  // =========================
  // Form
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // Create Modal
  // =========================

  const openCreateModal = () => {
    setEditingUser(null);

    setForm({
      ...emptyForm,
      role: "TEAM_MEMBER",
      isActive: true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =========================
  // Edit Modal
  // =========================

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser);

    setForm({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      password: "",
      role: selectedUser.role || "TEAM_MEMBER",
      isActive:
        selectedUser.isActive !== undefined
          ? selectedUser.isActive
          : true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =========================
  // Close Modal
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
  };

  // =========================
  // Submit Create / Edit
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // -------------------------
      // Validation
      // -------------------------

      if (!form.name.trim()) {
        setError("Name is required.");
        return;
      }

      if (!form.email.trim()) {
        setError("Email is required.");
        return;
      }

      if (!editingUser && !form.password) {
        setError("Password is required when creating a user.");
        return;
      }

      if (!editingUser && form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (
        editingUser &&
        form.password &&
        form.password.length < 8
      ) {
        setError("Password must be at least 8 characters.");
        return;
      }

      // -------------------------
      // Prevent self role change
      // -------------------------

      const isCurrentUser =
        editingUser &&
        String(editingUser._id) === String(currentUser?._id);

      if (
        isCurrentUser &&
        form.role !== currentUser?.role
      ) {
        setError("You cannot change your own role.");
        return;
      }

      // -------------------------
      // Prevent self deactivation
      // -------------------------

      if (
        isCurrentUser &&
        form.isActive === false
      ) {
        setError("You cannot deactivate your own account.");
        return;
      }

      // -------------------------
      // Prepare payload
      // -------------------------

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        isActive: form.isActive,
      };

      // Only send password when needed
      if (form.password.trim()) {
        payload.password = form.password;
      }

      // -------------------------
      // Update
      // -------------------------

      if (editingUser) {
        await updateUser(editingUser._id, payload);

        setSuccess("User updated successfully.");
      }

      // -------------------------
      // Create
      // -------------------------

      else {
        await createUser(payload);

        setSuccess("User created successfully.");
      }

      // Refresh table
      await loadUsers();

      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setEditingUser(null);
        setForm(emptyForm);
        setSuccess("");
      }, 800);
    } catch (err) {
      console.error("Failed to save user:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Activate / Deactivate
  // =========================

  // const handleToggleStatus = async (selectedUser) => {
  //   const isCurrentUser =
  //     String(selectedUser._id) ===
  //     String(currentUser?._id);

  //   // Prevent self-deactivation
  //   if (isCurrentUser && selectedUser.isActive) {
  //     setError("You cannot deactivate your own account.");
  //     return;
  //   }

  //   const action = selectedUser.isActive
  //     ? "deactivate"
  //     : "activate";

  //   const confirmed = window.confirm(
  //     `Are you sure you want to ${action} ${selectedUser.name}?`
  //   );

  //   if (!confirmed) return;

  //   try {
  //     setError("");
  //     setSuccess("");

  //     await deactivateUser(
  //       selectedUser._id,
  //       !selectedUser.isActive
  //     );

  //     setSuccess(
  //       `User ${action}d successfully.`
  //     );

  //     await loadUsers();

  //     setTimeout(() => {
  //       setSuccess("");
  //     }, 2500);
  //   } catch (err) {
  //     console.error("Failed to change user status:", err);

  //     setError(
  //       err.response?.data?.message ||
  //         "Failed to change user status."
  //     );
  //   }
  // };

  // =========================
  // Statistics
  // =========================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const teamMembers = users.filter(
    (user) => user.role === "TEAM_MEMBER"
  ).length;

  const administrators = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  // =========================
  // Render
  // =========================

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* =========================
          Header
      ========================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage team members and administrator accounts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Create User
        </button>
      </div>

      {/* =========================
          Alerts
      ========================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* =========================
          Summary Cards
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Users Found
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalUsers}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Users
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeUsers}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Team Members
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {teamMembers}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Administrators
          </p>

          <p className="mt-2 text-3xl font-bold text-purple-600">
            {administrators}
          </p>
        </div>
      </div>

      {/* =========================
          Filters
      ========================= */}

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
        >

          {/* Search */}

          <div className="xl:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="TEAM_MEMBER">
              Team Member
            </option>
            <option value="ADMIN">
              Administrator
            </option>
          </select>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Buttons */}

          <div className="md:col-span-2 xl:col-span-4 flex flex-col sm:flex-row gap-2">

            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setStatusFilter("");
                setTimeout(() => {
                  loadUsers();
                }, 0);
              }}
              className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* =========================
          Users Table
      ========================= */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">

            <p className="text-slate-500">
              No users found.
            </p>

            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First User
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {users.map((user) => {

                  const isCurrentUser =
                    String(user._id) ===
                    String(currentUser?._id);

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50"
                    >

                      {/* User */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>
                            <div className="font-medium text-slate-900 flex items-center gap-2">

                              {user.name}

                              {isCurrentUser && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  You
                                </span>
                              )}

                            </div>

                            <div className="text-sm text-slate-500">
                              {user.email}
                            </div>
                          </div>

                        </div>

                      </td>

                      {/* Role */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role === "ADMIN"
                            ? "Administrator"
                            : "Team Member"}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.isActive
                                ? "bg-green-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {user.isActive
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>

                      {/* Joined */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end items-center gap-2 flex-wrap">

                          {/* Profile */}

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/team/${user._id}`
                              )
                            }
                            className="px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                          >
                            View Profile
                          </button>

                          {/* Edit */}

                          <button
                            onClick={() =>
                              openEditModal(user)
                            }
                            className="px-3 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                          >
                            Edit
                          </button>

                          {/* Activate / Deactivate */}

                          {/* <button
                            onClick={() =>
                              handleToggleStatus(user)
                            }
                            disabled={isCurrentUser}
                            title={
                              isCurrentUser
                                ? "You cannot deactivate your own account"
                                : ""
                            }
                            className={`px-3 py-2 text-sm rounded-lg transition ${
                              isCurrentUser
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : user.isActive
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button> */}

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>

          </div>
        )}
      </div>

      {/* =========================
          Create / Edit Modal
      ========================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />

          {/* Modal */}

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">

            {/* Header */}

            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingUser
                    ? "Update user account details."
                    : "Create a new user account."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ×
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >

              {/* Error */}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Name */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                  {editingUser && (
                    <span className="ml-1 text-slate-400">
                      (leave blank to keep current)
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current password"
                      : "Minimum 8 characters"
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={
                    editingUser &&
                    String(editingUser._id) ===
                      String(currentUser?._id)
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="TEAM_MEMBER">
                    Team Member
                  </option>

                  <option value="ADMIN">
                    Administrator
                  </option>
                </select>

                {editingUser &&
                  String(editingUser._id) ===
                    String(currentUser?._id) && (
                    <p className="mt-1 text-xs text-slate-500">
                      You cannot change your own role.
                    </p>
                  )}
              </div>

              {/* Status */}

              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  disabled={
                    editingUser &&
                    String(editingUser._id) ===
                      String(currentUser?._id)
                  }
                  className="w-4 h-4"
                />

                <label className="text-sm text-slate-700">
                  Active Account
                </label>

              </div>

              {editingUser &&
                String(editingUser._id) ===
                  String(currentUser?._id) && (
                  <p className="text-xs text-slate-500">
                    Your own account must remain active.
                  </p>
                )}

              {/* Buttons */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;