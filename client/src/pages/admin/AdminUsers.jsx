/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
getUsers,
createUser,
updateUser,
deactivateUser,
} from "../../services/userService";

const AdminUsers = () => {
const navigate = useNavigate();

const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

const [search, setSearch] = useState("");
const [roleFilter, setRoleFilter] = useState("");
const [statusFilter, setStatusFilter] =
useState("");

const [showModal, setShowModal] = useState(false);
const [editingUser, setEditingUser] = useState(null);

const [form, setForm] = useState({
name: "",
email: "",
password: "",
role: "TEAM_MEMBER",
});

const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [saving, setSaving] = useState(false);

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
    filters.isActive =
      statusFilter === "ACTIVE";
  }

  const data = await getUsers(filters);

  setUsers(data || []);
} catch (error) {
  console.error("Failed to load users:", error);

  setError(
    error.response?.data?.message ||
      "Failed to load users."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadUsers();
}, [roleFilter, statusFilter]);

const handleSearch = (event) => {
event.preventDefault();


loadUsers();


};

const openCreateModal = () => {
setEditingUser(null);


setForm({
  name: "",
  email: "",
  password: "",
  role: "TEAM_MEMBER",
});

setError("");
setShowModal(true);


};

const openEditModal = (user) => {
setEditingUser(user);


setForm({
  name: user.name || "",
  email: user.email || "",
  password: "",
  role: user.role || "TEAM_MEMBER",
});

setError("");
setShowModal(true);


};

const closeModal = () => {
if (saving) return;


setShowModal(false);
setEditingUser(null);


};

const handleChange = (event) => {
const { name, value } = event.target;


setForm((previous) => ({
  ...previous,
  [name]: value,
}));


};

const handleSubmit = async (event) => {
event.preventDefault();


if (!form.name.trim()) {
  setError("Name is required.");
  return;
}

if (!form.email.trim()) {
  setError("Email is required.");
  return;
}

if (!editingUser && form.password.length < 8) {
  setError(
    "Password must be at least 8 characters."
  );
  return;
}

try {
  setSaving(true);
  setError("");
  setSuccess("");

  if (editingUser) {
    const updateData = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    };

    if (form.password.trim()) {
      updateData.password =
        form.password.trim();
    }

    await updateUser(
      editingUser._id,
      updateData
    );

    setSuccess(
      "User updated successfully."
    );
  } else {
    await createUser({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });

    setSuccess(
      "User created successfully."
    );
  }

  closeModal();

  await loadUsers();
} catch (error) {
  console.error(
    "Failed to save user:",
    error
  );

  setError(
    error.response?.data?.message ||
      "Failed to save user."
  );
} finally {
  setSaving(false);
}


};

const handleToggleStatus = async (user) => {
try {
setError("");
setSuccess("");


  if (user.isActive) {
    await deactivateUser(user._id);

    setSuccess(
      `${user.name} has been deactivated.`
    );
  } else {
    await updateUser(user._id, {
      isActive: true,
    });

    setSuccess(
      `${user.name} has been activated.`
    );
  }

  await loadUsers();
} catch (error) {
  console.error(
    "Failed to update user status:",
    error
  );

  setError(
    error.response?.data?.message ||
      "Failed to update user status."
  );
}


};

const totalUsers = users.length;

const activeUsers = users.filter(
(user) => user.isActive
).length;

const teamMembers = users.filter(
(user) => user.role === "TEAM_MEMBER"
).length;

const admins = users.filter(
(user) => user.role === "ADMIN"
).length;

return ( <div className="min-h-screen bg-slate-50 p-4 md:p-6"> <div className="max-w-7xl mx-auto space-y-6">


    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <div>
        <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="text-sm text-indigo-600 hover:text-indigo-700 mb-3"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          User Management
        </h1>

        <p className="text-slate-500 mt-1">
          Manage team members and administrators.
        </p>
      </div>

      <button
        onClick={openCreateModal}
        className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
      >
        + Add User
      </button>

    </div>

    {/* Messages */}
    {error && !showModal && (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        {error}
      </div>
    )}

    {success && (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
        {success}
      </div>
    )}

    {/* Summary */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Total Users
        </p>

        <p className="text-3xl font-bold text-slate-900 mt-2">
          {totalUsers}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Active Users
        </p>

        <p className="text-3xl font-bold text-green-600 mt-2">
          {activeUsers}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Team Members
        </p>

        <p className="text-3xl font-bold text-blue-600 mt-2">
          {teamMembers}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Administrators
        </p>

        <p className="text-3xl font-bold text-purple-600 mt-2">
          {admins}
        </p>
      </div>

    </div>

    {/* Filters */}
    <section className="bg-white border rounded-xl shadow-sm p-5">

      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search
          </label>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name or email..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Role
          </label>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">
              All Roles
            </option>

            <option value="TEAM_MEMBER">
              Team Member
            </option>

            <option value="ADMIN">
              Admin
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white"
          >
            <option value="">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </div>

        <div className="md:col-span-4">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            Search Users
          </button>
        </div>

      </form>

    </section>

    {/* Users */}
    <section className="bg-white rounded-xl shadow-sm border overflow-hidden">

      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-slate-900">
          Users
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Manage accounts and access permissions.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No users found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  User
                </th>

                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Role
                </th>

                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Status
                </th>

                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Joined
                </th>

                <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {users.map((user) => (

                <tr
                  key={user._id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4">

                    <p className="font-semibold text-slate-900">
                      {user.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {user.email}
                    </p>

                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role === "ADMIN"
                        ? "Admin"
                        : "Team Member"}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                          onClick={() =>
                            navigate(`/admin/team/${user._id}`)
                          }
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Profile
                        </button>
                      <button
                        onClick={() =>
                          openEditModal(user)
                        }
                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleToggleStatus(user)
                        }
                        className={`px-3 py-2 text-sm rounded-lg ${
                          user.isActive
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {user.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </section>

  </div>

  {/* Create / Edit Modal */}
  {showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">

        <div className="flex items-center justify-between p-6 border-b">

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editingUser
                ? "Edit User"
                : "Create User"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {editingUser
                ? "Update account information and role."
                : "Create a new team account."}
            </p>
          </div>

          <button
            onClick={closeModal}
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ×
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={
                editingUser
                  ? "Leave empty to keep current password"
                  : "Minimum 8 characters"
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white"
              disabled={saving}
            >
              <option value="TEAM_MEMBER">
                Team Member
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              Admin accounts have access to all reports,
              users, projects, and review functions.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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
