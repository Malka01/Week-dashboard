import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTeamMemberProfile,
  assignProjectToMember,
  removeProjectFromMember,
} from "../../services/teamService";

const statusStyles = {
  // DRAFT:
  //   "bg-slate-100 text-slate-700",
  SUBMITTED:
    "bg-blue-100 text-blue-700",
  NEEDS_CORRECTION:
    "bg-amber-100 text-amber-700",
  APPROVED:
    "bg-green-100 text-green-700",
};

const statusLabels = {
  // DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved",
};

const TeamMemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [selectedProject, setSelectedProject] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const profile =
        await getTeamMemberProfile(id);

      setData(profile);
    } catch (error) {
      console.error(
        "Failed to load team member:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load team member profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedProject) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const updated =
        await assignProjectToMember(
          id,
          selectedProject
        );

      setData(updated);
      setSelectedProject("");
    } catch (error) {
      console.error(
        "Failed to assign project:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to assign project."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (projectId) => {
    try {
      setActionLoading(true);
      setError("");

      const updated =
        await removeProjectFromMember(
          id,
          projectId
        );

      setData(updated);
    } catch (error) {
      console.error(
        "Failed to remove project:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to remove project."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">
          Loading team member...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() =>
              navigate("/admin/users")
            }
            className="mb-6 text-sm text-blue-600 hover:underline"
          >
            ← Back to Users
          </button>

          <div className="bg-white border border-red-200 rounded-xl p-6">
            <p className="text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    user,
    statistics,
    assignedProjects,
    availableProjects,
    recentReports,
  } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() =>
            navigate("/admin/users")
          }
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Users
        </button>

        {/* Profile Header */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {user.name}
              </h1>

              <p className="text-slate-500 mt-1">
                {user.email}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Team Member
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>

            <div className="text-sm text-slate-500">
              Joined{" "}
              {user.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString()
                : "-"}
            </div>

          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            label="Total Reports"
            value={statistics.totalReports}
          />

          <StatCard
            label="Approved"
            value={statistics.approvedReports}
          />

          <StatCard
            label="Submitted"
            value={statistics.submittedReports}
          />

          <StatCard
            label="Needs Correction"
            value={statistics.correctionReports}
          />

          {/* <StatCard
            label="Drafts"
            value={statistics.draftReports}
          /> */}

        </section>

        {/* Projects */}
        <section className="grid lg:grid-cols-2 gap-6">

          {/* Assigned */}
          <div className="bg-white border rounded-xl shadow-sm p-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Assigned Projects
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Projects currently assigned to this
              team member.
            </p>

            <div className="mt-5 space-y-3">

              {assignedProjects.length > 0 ? (
                assignedProjects.map(
                  (project) => (
                    <div
                      key={project._id}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {project.name}
                        </p>

                        {project.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          handleRemove(
                            project._id
                          )
                        }
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )
              ) : (
                <div className="bg-slate-50 border rounded-lg p-4">
                  <p className="text-sm text-slate-500">
                    No projects assigned.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white border rounded-xl shadow-sm p-6">

            <h2 className="text-lg font-semibold text-slate-900">
              Assign Project
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Assign an active project to this
              team member.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">

              <select
                value={selectedProject}
                onChange={(event) =>
                  setSelectedProject(
                    event.target.value
                  )
                }
                className="flex-1 border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  Select project
                </option>

                {availableProjects.map(
                  (project) => (
                    <option
                      key={project._id}
                      value={project._id}
                    >
                      {project.name}
                    </option>
                  )
                )}
              </select>

              <button
                disabled={
                  !selectedProject ||
                  actionLoading
                }
                onClick={handleAssign}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? "Processing..."
                  : "Assign"}
              </button>

            </div>

            {availableProjects.length === 0 && (
              <p className="text-sm text-slate-500 mt-4">
                No additional active projects
                available.
              </p>
            )}

          </div>

        </section>

        {/* Recent Reports */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Reports
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Latest reports submitted by this
                team member.
              </p>
            </div>
          </div>

          {recentReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-3 pr-4">
                      Week
                    </th>

                    <th className="py-3 pr-4">
                      Project
                    </th>

                    <th className="py-3 pr-4">
                      Status
                    </th>

                    <th className="py-3">
                      Updated
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentReports.map(
                    (report) => (
                      <tr
                        key={report._id}
                        className="border-b last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium text-slate-900">
                            {new Date(
                              report.weekStart
                            ).toLocaleDateString()}
                          </p>

                          <p className="text-xs text-slate-500">
                            to{" "}
                            {new Date(
                              report.weekEnd
                            ).toLocaleDateString()}
                          </p>
                        </td>

                        <td className="py-4 pr-4">
                          {report.projectId?.name ||
                            "No project"}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              statusStyles[
                                report.status
                              ] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {statusLabels[
                              report.status
                            ] ||
                              report.status}
                          </span>
                        </td>

                        <td className="py-4 text-slate-500">
                          {report.updatedAt
                            ? new Date(
                                report.updatedAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          ) : (
            <div className="bg-slate-50 border rounded-lg p-5">
              <p className="text-sm text-slate-500">
                No reports found for this team
                member.
              </p>
            </div>
          )}

        </section>

      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
}) => {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-2xl font-bold text-slate-900 mt-2">
        {value}
      </p>
    </div>
  );
};

export default TeamMemberProfile;