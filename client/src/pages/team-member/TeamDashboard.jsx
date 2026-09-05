/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getMyReports } from "../../services/reportService";
import { useToast } from "../../context/ToastContext";

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showError } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    needsCorrection: 0,
    approved: 0,
  });

  // -----------------------------------------
  // Current week calculation
  // -----------------------------------------
  const getCurrentWeek = () => {
    const today = new Date();

    const day = today.getDay();

    // Monday = 1
    // Sunday = 0
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      start: monday,
      end: sunday,
    };
  };

  const currentWeek = getCurrentWeek();

  // -----------------------------------------
  // Format date
  // -----------------------------------------
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatShortDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // -----------------------------------------
  // Status styles
  // -----------------------------------------
  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "SUBMITTED":
        return "bg-blue-100 text-blue-700";

      case "NEEDS_CORRECTION":
        return "bg-orange-100 text-orange-700";

      case "DRAFT":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // -----------------------------------------
  // Status text
  // -----------------------------------------
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // -----------------------------------------
  // Check whether report belongs to current week
  // -----------------------------------------
  const isCurrentWeekReport = (report) => {
    if (!report?.weekStart || !report?.weekEnd) {
      return false;
    }

    const reportStart = new Date(report.weekStart);
    const reportEnd = new Date(report.weekEnd);

    reportStart.setHours(0, 0, 0, 0);
    reportEnd.setHours(23, 59, 59, 999);

    return (
      reportStart.getTime() === currentWeek.start.getTime() &&
      reportEnd.getTime() === currentWeek.end.getTime()
    );
  };

  // -----------------------------------------
  // Load dashboard data
  // -----------------------------------------
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const data = await getMyReports();

        setReports(data);

        setSummary({
          total: data.length,

          draft: data.filter(
            (report) => report.status === "DRAFT"
          ).length,

          submitted: data.filter(
            (report) => report.status === "SUBMITTED"
          ).length,

          needsCorrection: data.filter(
            (report) => report.status === "NEEDS_CORRECTION"
          ).length,

          approved: data.filter(
            (report) => report.status === "APPROVED"
          ).length,
        });
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        showError(
          error.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [showError]);

  // -----------------------------------------
  // Find current week's report
  // -----------------------------------------
  const currentWeekReport =
    reports.find((report) =>
      isCurrentWeekReport(report)
    ) || null;

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-16 flex items-center justify-between">

            {/* Logo */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                WeeklyReport
              </h1>

              <p className="text-xs text-slate-500">
                Team Member Portal
              </p>
            </div>

            {/* User */}
            <div className="flex items-center gap-4">

              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>

                <p className="text-xs text-slate-500">
                  Team Member
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Logout
              </button>

            </div>
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name}
            </h2>

            <p className="text-slate-500 mt-1">
              Manage your weekly reports and track your submissions.
            </p>
          </div>

          <button
            onClick={() => navigate("/team/report")}
            className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            + Create Weekly Report
          </button>

        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">

          {/* Total Reports */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Total Reports
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {summary.total}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              All your reports
            </p>
          </div>

          {/* Submitted */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Submitted
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {summary.submitted}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Awaiting review
            </p>
          </div>

          {/* Needs Correction */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Needs Correction
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-2">
              {summary.needsCorrection}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Action required
            </p>
          </div>

          {/* Approved */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Approved
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {summary.approved}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Completed
            </p>
          </div>

          {/* Drafts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Drafts
            </p>

            <p className="text-3xl font-bold text-slate-700 mt-2">
              {summary.draft}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Not submitted
            </p>
          </div>

        </div>

        {/* Current Week Report */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                This Week's Report
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {formatShortDate(currentWeek.start)}
                {" - "}
                {formatShortDate(currentWeek.end)}
                {", "}
                {currentWeek.start.getFullYear()}
              </p>
            </div>

            {/* Current report status */}
            {currentWeekReport ? (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                  currentWeekReport.status
                )}`}
              >
                {formatStatus(currentWeekReport.status)}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                Not Started
              </span>
            )}

          </div>

          {/* Current report information */}
          {currentWeekReport ? (
            <div className="mt-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Project */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500">
                    Project
                  </p>

                  <p className="font-semibold text-slate-900 mt-1">
                    {currentWeekReport.projectId?.name ||
                      "Unknown Project"}
                  </p>
                </div>

                {/* Last Updated */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500">
                    Last Updated
                  </p>

                  <p className="font-semibold text-slate-900 mt-1">
                    {formatDate(
                      currentWeekReport.updatedAt
                    )}
                  </p>
                </div>

                {/* Tasks */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500">
                    Tasks
                  </p>

                  <p className="font-semibold text-slate-900 mt-1">
                    {currentWeekReport.tasks?.length || 0}
                  </p>
                </div>

              </div>

              {/* Correction message */}
              {currentWeekReport.status ===
                "NEEDS_CORRECTION" && (
                <div className="mt-5 p-4 bg-orange-50 border border-orange-200 rounded-lg">

                  <p className="font-semibold text-orange-800">
                    Action Required
                  </p>

                  <p className="text-sm text-orange-700 mt-1">
                    Your report needs correction before it can
                    be approved.
                  </p>

                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() =>
                    navigate(
                      `/team/reports/${currentWeekReport._id}`
                    )
                  }
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  View Report
                </button>

                {(currentWeekReport.status === "DRAFT" ||
                  currentWeekReport.status ===
                    "NEEDS_CORRECTION") && (
                  <button
                    onClick={() =>
                      navigate(
                        `/team/report/${currentWeekReport._id}`
                      )
                    }
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                  >
                    Edit Report
                  </button>
                )}

              </div>

            </div>
          ) : (
            /* No report for current week */
            <div className="mt-6">

              <div className="bg-slate-50 rounded-lg p-6 text-center">

                <p className="text-slate-600">
                  You haven't created your weekly report yet.
                </p>

                <button
                  onClick={() =>
                    navigate("/team/report")
                  }
                  className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Start Report
                </button>

              </div>

            </div>
          )}

        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-slate-200">

          <div className="p-6 border-b border-slate-200 flex items-center justify-between">

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Recent Reports
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Your latest weekly submissions
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/team/reports")
              }
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>

          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">

              <p className="text-slate-500">
                No reports found.
              </p>

              <button
                onClick={() =>
                  navigate("/team/report")
                }
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Your First Report
              </button>

            </div>
          ) : (
            <div className="divide-y divide-slate-200">

              {reports.slice(0, 5).map((report) => (
                <div
                  key={report._id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition"
                >

                  <div>

                    <p className="font-semibold text-slate-900">
                      {report.projectId?.name ||
                        "Unknown Project"}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(report.weekStart)}
                      {" - "}
                      {formatDate(report.weekEnd)}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Updated {formatDate(report.updatedAt)}
                    </p>

                  </div>

                  <div className="flex items-center gap-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        report.status
                      )}`}
                    >
                      {formatStatus(report.status)}
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/team/reports/${report._id}`
                        )
                      }
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>
    </div>
  );
};

export default TeamDashboard;