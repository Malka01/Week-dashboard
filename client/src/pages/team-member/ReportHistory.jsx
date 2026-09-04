import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyReports } from "../../services/reportService";

const ReportHistory = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyReports();

        setReports(data);
      } catch (error) {
        console.error(
          "Failed to load reports:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load report history."
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
        return "bg-slate-100 text-slate-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatStatus = (status) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-16 flex items-center justify-between">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                WeeklyReport
              </h1>

              <p className="text-xs text-slate-500">
                Report History
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/team/dashboard")
              }
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Dashboard
            </button>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              My Report History
            </h2>

            <p className="text-slate-500 mt-1">
              View your previous weekly reports and their status.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/team/report")
            }
            className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            + New Weekly Report
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500">
              Loading report history...
            </p>
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">

            <div className="text-4xl mb-4">
              📋
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              No reports yet
            </h3>

            <p className="text-slate-500 mt-2">
              Create your first weekly report to get started.
            </p>

            <button
              onClick={() =>
                navigate("/team/report")
              }
              className="mt-6 px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Create Weekly Report
            </button>

          </div>
        ) : (
          /* Reports */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Week
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Project
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Updated
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-200">

                  {reports.map((report) => (

                    <tr
                      key={report._id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-semibold text-slate-900">
                          {formatDate(
                            report.weekStart
                          )}
                        </p>

                        <p className="text-sm text-slate-500">
                          to{" "}
                          {formatDate(
                            report.weekEnd
                          )}
                        </p>

                      </td>

                      <td className="px-6 py-5">

                        <p className="font-medium text-slate-900">
                          {report.projectId?.name ||
                            "Unknown Project"}
                        </p>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            report.status
                          )}`}
                        >
                          {formatStatus(
                            report.status
                          )}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(
                          report.updatedAt
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">

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

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-200">

              {reports.map((report) => (

                <div
                  key={report._id}
                  className="p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-semibold text-slate-900">
                        {formatDate(
                          report.weekStart
                        )}
                      </p>

                      <p className="text-sm text-slate-500">
                        to{" "}
                        {formatDate(
                          report.weekEnd
                        )}
                      </p>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        report.status
                      )}`}
                    >
                      {formatStatus(
                        report.status
                      )}
                    </span>

                  </div>

                  <div className="mt-4">

                    <p className="text-sm text-slate-500">
                      Project
                    </p>

                    <p className="font-medium text-slate-900">
                      {report.projectId?.name ||
                        "Unknown Project"}
                    </p>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-xs text-slate-500">
                      Updated{" "}
                      {formatDate(
                        report.updatedAt
                      )}
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          `/team/reports/${report._id}`
                        )
                      }
                      className="text-sm font-semibold text-indigo-600"
                    >
                      View Report
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default ReportHistory;