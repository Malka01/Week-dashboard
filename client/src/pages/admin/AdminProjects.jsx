import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
getAllProjects,
createProject,
updateProject,
deleteProject,
} from "../../services/projectService";
import { useToast } from "../../context/ToastContext";

const AdminProjects = () => {
const navigate = useNavigate();
const { showSuccess, showError } = useToast();

const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [showModal, setShowModal] = useState(false);
const [editingProject, setEditingProject] = useState(null);

const [form, setForm] = useState({
name: "",
description: "",
});

const loadProjects = async () => {
try {
setLoading(true);

  const data = await getAllProjects();

  setProjects(data || []);
} catch (error) {
  console.error("Failed to load projects:", error);

  showError(error.response?.data?.message || "Failed to load projects.");
} finally {
  setLoading(false);
}

};

useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
loadProjects();
}, []);

const openCreateModal = () => {
setEditingProject(null);


setForm({
  name: "",
  description: "",
});

setShowModal(true);

};

const openEditModal = (project) => {
setEditingProject(project);


setForm({
  name: project.name || "",
  description: project.description || "",
});

setShowModal(true);


};

const closeModal = () => {
if (saving) return;


setShowModal(false);
setEditingProject(null);

setForm({
  name: "",
  description: "",
});


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
  showError("Project name is required.");
  return;
}

try {
  setSaving(true);
  if (editingProject) {
    await updateProject(editingProject._id, {
      name: form.name.trim(),
      description: form.description.trim(),
    });

    showSuccess("Project updated successfully.");
  } else {
    await createProject({
      name: form.name.trim(),
      description: form.description.trim(),
    });

    showSuccess("Project created successfully.");
  }

  closeModal();
  await loadProjects();
} catch (error) {
  console.error("Failed to save project:", error);

  showError(error.response?.data?.message || "Failed to save project.");
} finally {
  setSaving(false);
}


};

const handleToggleStatus = async (project) => {
try {
  await updateProject(project._id, {
    isActive: !project.isActive,
  });

  showSuccess(
    `${project.name} ${
      project.isActive ? "deactivated" : "activated"
    } successfully.`
  );

  await loadProjects();
} catch (error) {
  console.error(
    "Failed to update project status:",
    error
  );

  showError(error.response?.data?.message || "Failed to update project status.");
}


};

const handleDelete = async (project) => {
const confirmed = window.confirm(
`Are you sure you want to delete "${project.name}"?`
);


if (!confirmed) return;

try {
  await deleteProject(project._id);

  showSuccess("Project deleted successfully.");

  await loadProjects();
} catch (error) {
  console.error("Failed to delete project:", error);

  showError(error.response?.data?.message || "Failed to delete project.");
}


};

return ( <div className="min-h-screen bg-slate-50 p-4 md:p-6"> <div className="max-w-7xl mx-auto space-y-6">


    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <div>
        {/* <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="text-sm text-indigo-600 hover:text-indigo-700 mb-3"
        >
          ← Back to Dashboard
        </button> */}

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Projects & Categories
        </h1>

        <p className="text-slate-500 mt-1">
          Manage projects available for weekly reports.
        </p>
      </div>

      <button
        onClick={openCreateModal}
        className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
      >
        + Add Project
      </button>
    </div>

    {/* Summary */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Total Projects
        </p>

        <p className="text-3xl font-bold text-slate-900 mt-2">
          {projects.length}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Active Projects
        </p>

        <p className="text-3xl font-bold text-green-600 mt-2">
          {
            projects.filter(
              (project) => project.isActive
            ).length
          }
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500">
          Inactive Projects
        </p>

        <p className="text-3xl font-bold text-slate-500 mt-2">
          {
            projects.filter(
              (project) => !project.isActive
            ).length
          }
        </p>
      </div>

    </div>

    {/* Projects */}
    <section className="bg-white rounded-xl shadow-sm border overflow-hidden">

      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-slate-900">
          All Projects
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Create, update, activate, or deactivate projects.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center">

          <p className="text-slate-500">
            No projects have been created yet.
          </p>

          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create First Project
          </button>

        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50">

              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Project
                </th>

                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Description
                </th>

                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Members
                </th>

                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Status
                </th>

                <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y">

              {projects.map((project) => (

                <tr
                  key={project._id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {project.name}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-md">
                      {project.description ||
                        "No description"}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">
                      {project.assignedMembers?.length || 0}
                    </span>
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        project.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {project.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() =>
                          openEditModal(project)
                        }
                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleToggleStatus(
                            project
                          )
                        }
                        className={`px-3 py-2 text-sm rounded-lg ${
                          project.isActive
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {project.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(project)
                        }
                        className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Delete
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

  {/* Modal */}
  {showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">

        <div className="flex items-center justify-between p-6 border-b">

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editingProject
                ? "Edit Project"
                : "Create Project"}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {editingProject
                ? "Update project information."
                : "Add a new project."}
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Weekly Report Dashboard"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter a short project description..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              disabled={saving}
            />
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
                : editingProject
                ? "Update Project"
                : "Create Project"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )}

</div>

);
};

export default AdminProjects;
