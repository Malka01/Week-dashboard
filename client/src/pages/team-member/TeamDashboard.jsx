import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getMyReports } from "../../services/reportService";

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  /*
   * Temporary dashboard data.
   *
   * We will replace this with the real API
   * when we build the Report model in Phase 3.
   */
  // useEffect(() => {
  //   const loadReports = async () => {
  //     try {
  //       setLoading(true);

  //       Temporary:
  //       const response = await api.get("/reports/my-reports");
  //       setReports(response.data.data);

  //       setReports([
  //         {
  //           id: 1,
  //           week: "Aug 24 - Aug 30, 2026",
  //           project: "Weekly Report Dashboard",
  //           status: "SUBMITTED",
  //         },
  //         {
  //           id: 2,
  //           week: "Aug 17 - Aug 23, 2026",
  //           project: "Weather Analytics",
  //           status: "APPROVED",
  //         },
  //         {
  //           id: 3,
  //           week: "Aug 10 - Aug 16, 2026",
  //           project: "Weather Analytics",
  //           status: "NEEDS_CORRECTION",
  //         },
  //       ]);
  //     } catch (error) {
  //       console.error("Failed to load reports:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadReports();
  // }, []);


  useEffect(() => {
  const loadReports = async () => {
    try {
      setLoading(true);

      const data = await getMyReports();

      setReports(data);
    } catch (error) {
      console.error(
        "Failed to load reports:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  loadReports();
}, []);


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

  const formatStatus = (status) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* Current Week */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Current Week
            </p>

            <p className="text-xl font-bold text-slate-900 mt-2">
              Aug 31 - Sep 6
            </p>

            <p className="text-xs text-slate-500 mt-1">
              2026
            </p>
          </div>

          {/* Submitted */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Submitted
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              2
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Previous reports
            </p>
          </div>

          {/* Needs Correction */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              Needs Correction
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-2">
              1
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
              1
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Reports approved
            </p>
          </div>

        </div>

        {/* Current Week */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                This Week's Report
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Aug 31 - Sep 6, 2026
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
              Not Started
            </span>

          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">

            <button
              onClick={() => navigate("/team/report")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Start Report
            </button>

            <button
              onClick={() => navigate("/team/reports")}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              View History
            </button>

          </div>

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
              onClick={() => navigate("/team/reports")}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>

          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-500">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">

              <p className="text-slate-500">
                No reports found.
              </p>

              <button
                onClick={() => navigate("/team/report")}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Create Your First Report
              </button>

            </div>
          ) : (
            <div className="divide-y divide-slate-200">

              {reports.map((report) => (
                <div
                  key={report._id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50"
                >

                  <div>
                    <p className="font-semibold text-slate-900">
                      {report.projectId?.name || "Unknown Project"}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {report.week}
                      {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
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
                        navigate(`/team/reports/${report._id}`)
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