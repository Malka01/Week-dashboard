import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";

import { getAllAdminReports } from "../../services/adminReportService";
import { getUsers } from "../../services/userService";
import { getProjects } from "../../services/projectService";

const AdminReports = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    member: "",
    project: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Load data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [reportsData, usersData, projectsData] = await Promise.all([
        getAllAdminReports(),
        getUsers(),
        getProjects(),
      ]);

      setReports(reportsData || []);
      setUsers(usersData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Failed to load reports:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load reports. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Filter reports
  // --------------------------------------------------

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const memberName =
        report.userId?.name ||
        report.user?.name ||
        "";

      const projectName =
        report.projectId?.name ||
        report.project?.name ||
        "";

      const searchText = filters.search.toLowerCase();

      const matchesSearch =
        !searchText ||
        memberName.toLowerCase().includes(searchText) ||
        projectName.toLowerCase().includes(searchText) ||
        report.notes?.toLowerCase().includes(searchText) ||
        report.tasks?.some((task) =>
          task.taskName?.toLowerCase().includes(searchText)
        );

      const matchesMember =
        !filters.member ||
        report.userId?._id === filters.member ||
        report.userId === filters.member;

      const matchesProject =
        !filters.project ||
        report.projectId?._id === filters.project ||
        report.projectId === filters.project;

      const matchesStatus =
        !filters.status ||
        report.status === filters.status;

      const reportStartDate = report.weekStart
        ? new Date(report.weekStart)
        : null;

      const matchesStartDate =
        !filters.startDate ||
        (reportStartDate &&
          reportStartDate >= new Date(filters.startDate));

      const matchesEndDate =
        !filters.endDate ||
        (reportStartDate &&
          reportStartDate <= new Date(`${filters.endDate}T23:59:59`));

      return (
        matchesSearch &&
        matchesMember &&
        matchesProject &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [reports, filters]);

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const summary = useMemo(() => {
    return {
      total: reports.length,

      submitted: reports.filter(
        (report) => report.status === "SUBMITTED"
      ).length,

      needsCorrection: reports.filter(
        (report) => report.status === "NEEDS_CORRECTION"
      ).length,

      approved: reports.filter(
        (report) => report.status === "APPROVED"
      ).length,

      draft: reports.filter(
        (report) => report.status === "DRAFT"
      ).length,
    };
  }, [reports]);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getStatusClass = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700";

      case "SUBMITTED":
        return "bg-blue-100 text-blue-700";

      case "NEEDS_CORRECTION":
        return "bg-orange-100 text-orange-700";

      case "APPROVED":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "DRAFT":
        return "Draft";

      case "SUBMITTED":
        return "Submitted";

      case "NEEDS_CORRECTION":
        return "Needs Correction";

      case "APPROVED":
        return "Approved";

      default:
        return status;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTotalHours = (hours = {}) => {
    return (
      Number(hours.development || 0) +
      Number(hours.testing || 0) +
      Number(hours.meetings || 0) +
      Number(hours.research || 0) +
      Number(hours.other || 0)
    );
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      member: "",
      project: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Reports
        </h1>

        <p className="text-slate-500 mt-1">
          Review and manage team member reports.
        </p>

        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-500">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* -------------------------------------------- */}
      {/* Page Header */}
      {/* -------------------------------------------- */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Reports
        </h1>

        <p className="text-slate-500 mt-1">
          Review and manage team member reports.
        </p>
      </div>

      {/* -------------------------------------------- */}
      {/* Error */}
      {/* -------------------------------------------- */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>

            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------- */}
      {/* Summary Cards */}
      {/* -------------------------------------------- */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Reports
            </p>

            <FileText className="w-5 h-5 text-slate-400" />
          </div>

          <p className="text-3xl font-bold text-slate-900 mt-3">
            {summary.total}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            All team reports
          </p>
        </div>

        {/* Submitted */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Submitted
            </p>

            <Clock className="w-5 h-5 text-blue-500" />
          </div>

          <p className="text-3xl font-bold text-blue-600 mt-3">
            {summary.submitted}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Waiting for review
          </p>
        </div>

        {/* Needs Correction */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Needs Correction
            </p>

            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>

          <p className="text-3xl font-bold text-orange-600 mt-3">
            {summary.needsCorrection}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Returned to team members
          </p>
        </div>

        {/* Approved */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Approved
            </p>

            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>

          <p className="text-3xl font-bold text-green-600 mt-3">
            {summary.approved}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Completed reviews
          </p>
        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* Filters */}
      {/* -------------------------------------------- */}

      <div className="bg-white border border-slate-200 rounded-xl p-5">

        <div className="flex items-center gap-2 mb-5">
          <Filter className="w-5 h-5 text-slate-500" />

          <h2 className="font-semibold text-slate-900">
            Filter Reports
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Search */}
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search member, project, task or notes..."
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Team Member */}
          <select
            value={filters.member}
            onChange={(e) =>
              setFilters({
                ...filters,
                member: e.target.value,
              })
            }
            className="px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              All Team Members
            </option>

            {users
              .filter((user) => user.role === "TEAM_MEMBER")
              .map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                >
                  {user.name}
                </option>
              ))}
          </select>

          {/* Project */}
          <select
            value={filters.project}
            onChange={(e) =>
              setFilters({
                ...filters,
                project: e.target.value,
              })
            }
            className="px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              All Projects
            </option>

            {projects.map((project) => (
              <option
                key={project._id}
                value={project._id}
              >
                {project.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
            className="px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              All Statuses
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="SUBMITTED">
              Submitted
            </option>

            <option value="NEEDS_CORRECTION">
              Needs Correction
            </option>

            <option value="APPROVED">
              Approved
            </option>
          </select>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Start Date
            </label>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  startDate: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              End Date
            </label>

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  endDate: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------- */}
      {/* Reports Table */}
      {/* -------------------------------------------- */}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Team Reports
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {filteredReports.length} report
              {filteredReports.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />

            <p className="text-slate-600 font-medium mt-3">
              No reports found
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Team Member
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Week
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Project
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Tasks
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Hours
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-right px-5 py-3 font-semibold text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredReports.map((report) => {

                  const memberName =
                    report.userId?.name ||
                    report.user?.name ||
                    "Unknown";

                  const projectName =
                    report.projectId?.name ||
                    report.project?.name ||
                    "No Project";

                  return (
                    <tr
                      key={report._id}
                      className="hover:bg-slate-50 transition"
                    >

                      {/* Member */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {memberName}
                        </div>

                        <div className="text-xs text-slate-400 mt-1">
                          {report.userId?.email ||
                            report.user?.email ||
                            ""}
                        </div>
                      </td>

                      {/* Week */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-slate-700">
                          {formatDate(report.weekStart)}
                        </div>

                        <div className="text-xs text-slate-400">
                          to {formatDate(report.weekEnd)}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-5 py-4">
                        <span className="text-slate-700">
                          {projectName}
                        </span>
                      </td>

                      {/* Tasks */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-700">
                          {report.tasks?.length || 0}
                        </span>
                      </td>

                      {/* Hours */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-700">
                          {getTotalHours(report.hours)}h
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            report.status
                          )}`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/reports/${report._id}/review`
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {report.status === "SUBMITTED" ||
                          report.status === "NEEDS_CORRECTION" ? (
                            <>
                              <Eye className="w-4 h-4" />
                              Review
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              View
                            </>
                          )}
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminReports;
