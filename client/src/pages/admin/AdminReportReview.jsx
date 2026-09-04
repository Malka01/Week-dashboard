import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminReportById,
  requestCorrection,
  approveReport,
} from "../../services/adminReportService";

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  NEEDS_CORRECTION: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
};

const statusLabels = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs Correction",
  APPROVED: "Approved",
};

const AdminReportReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAdminReportById(id);

      setData(result);
    } catch (error) {
      console.error(
        "Failed to load report:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport();
  }, [id]);

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

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const handleRequestCorrection = async () => {
    if (!comment.trim()) {
      setError(
        "Please enter a correction comment."
      );

      return;
    }

    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      await requestCorrection(
        id,
        comment.trim()
      );

      setSuccess(
        "Correction requested successfully."
      );

      setComment("");

      await loadReport();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to request correction."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");

      await approveReport(
        id,
        comment.trim()
      );

      setSuccess(
        "Report approved successfully."
      );

      setComment("");

      await loadReport();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to approve report."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border rounded-xl p-10 text-center">
            <p className="text-slate-500">
              Loading report...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border rounded-xl p-10 text-center">

            <p className="text-red-600 mb-4">
              {error}
            </p>

            <button
              onClick={() =>
                navigate("/admin/dashboard")
              }
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  }

  const report = data?.report;
  const reviews = data?.reviews || [];
  const versions = data?.versions || [];

  const canReview =
    report?.status === "SUBMITTED";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                WeeklyReport
              </h1>

              <p className="text-xs text-slate-500">
                Admin / Manager Portal
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/admin/dashboard")
              }
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-sm"
            >
              Dashboard
            </button>

          </div>

        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Header */}
        <div>

          <button
            onClick={() =>
              navigate("/admin/dashboard")
            }
            className="text-sm text-indigo-600 hover:text-indigo-700 mb-3"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Weekly Report Review
              </h2>

              <p className="text-slate-500 mt-1">
                Review and manage the submitted report.
              </p>
            </div>

            <span
              className={`w-fit px-4 py-2 rounded-full text-sm font-semibold ${
                statusStyles[report?.status] ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              {statusLabels[report?.status] ||
                report?.status}
            </span>

          </div>

        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
            {success}
          </div>
        )}

        {/* Employee / Report Info */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900 mb-5">
            Report Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            <div>
              <p className="text-sm text-slate-500">
                Team Member
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                {report?.userId?.name || "-"}
              </p>

              <p className="text-xs text-slate-500">
                {report?.userId?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Project
              </p>

              <p className="font-semibold text-slate-900 mt-1">
                {report?.projectId?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Week Start
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {formatDate(report?.weekStart)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Week End
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {formatDate(report?.weekEnd)}
              </p>
            </div>

          </div>

        </section>

        {/* Tasks */}
        <section className="bg-white border rounded-xl shadow-sm overflow-hidden">

          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-slate-900">
              Completed Tasks
            </h3>
          </div>

          {report?.tasks?.length > 0 ? (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-slate-50">
                  <tr>

                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                      Task
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                      Priority
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                      Planned
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                      Actual
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                      Status
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">
                      Time
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">

                  {report.tasks.map((task) => (
                    <tr key={task._id}>

                      <td className="px-6 py-4">

                        <p className="font-medium text-slate-900">
                          {task.taskName}
                        </p>

                        {task.output && (
                          <p className="text-xs text-slate-500 mt-1">
                            {task.output}
                          </p>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm">
                        {task.priority}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {task.plannedPercentage}%
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {task.actualPercentage}%
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {task.status.replace(
                          "_",
                          " "
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {task.timeSpent}h /{" "}
                        {task.timePlanned}h
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          ) : (
            <div className="p-6 text-slate-500">
              No tasks found.
            </div>
          )}

        </section>

        {/* Next Week Tasks */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Next Week Tasks
          </h3>

          {report?.nextWeekTasks?.length > 0 ? (
            <ul className="mt-4 space-y-3">

              {report.nextWeekTasks.map(
                (task, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-slate-700"
                  >
                    <span className="text-indigo-600">
                      •
                    </span>

                    <span>{task}</span>
                  </li>
                )
              )}

            </ul>
          ) : (
            <p className="text-slate-500 mt-3">
              No next-week tasks.
            </p>
          )}

        </section>

        {/* Blockers */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Blockers & Challenges
          </h3>

          {report?.blockers?.length > 0 ? (
            <div className="mt-4 space-y-3">

              {report.blockers.map(
                (blocker, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                      <p className="text-slate-700">
                        {blocker.description}
                      </p>

                      {blocker.isKeyIssue && (
                        <span className="w-fit px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          Key Issue
                        </span>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="text-slate-500 mt-3">
              No blockers reported.
            </p>
          )}

        </section>

        {/* Achievements */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Achievements & Highlights
          </h3>

          {report?.achievements?.length > 0 ? (
            <div className="mt-4 space-y-3">

              {report.achievements.map(
                (achievement, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                      <p className="text-slate-700">
                        {achievement.description}
                      </p>

                      {achievement.isKeyAchievement && (
                        <span className="w-fit px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          Key Achievement
                        </span>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          ) : (
            <p className="text-slate-500 mt-3">
              No achievements reported.
            </p>
          )}

        </section>

        {/* Hours */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Hours by Task Type
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">

            {[
              [
                "Development",
                report?.hours?.development,
              ],
              [
                "Testing",
                report?.hours?.testing,
              ],
              [
                "Meetings",
                report?.hours?.meetings,
              ],
              [
                "Research",
                report?.hours?.research,
              ],
              [
                "Other",
                report?.hours?.other,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-slate-50 rounded-lg p-4"
              >
                <p className="text-sm text-slate-500">
                  {label}
                </p>

                <p className="text-xl font-bold text-slate-900 mt-1">
                  {value || 0}h
                </p>
              </div>
            ))}

          </div>

        </section>

        {/* Notes */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Notes & Links
          </h3>

          <div className="mt-4 bg-slate-50 rounded-lg p-4">

            {report?.notes ? (
              <p className="text-slate-700 whitespace-pre-wrap">
                {report.notes}
              </p>
            ) : (
              <p className="text-slate-500">
                No notes added.
              </p>
            )}

          </div>

        </section>

        {/* Review History */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Review History
          </h3>

          {reviews.length > 0 ? (
            <div className="mt-5 space-y-4">

              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border rounded-lg p-4"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.action.replace(
                          "_",
                          " "
                        )}
                      </p>

                      <p className="text-sm text-slate-500">
                        {review.reviewerId?.name ||
                          "Unknown reviewer"}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      {formatDateTime(
                        review.createdAt
                      )}
                    </p>

                  </div>

                  {review.comment && (
                    <div className="mt-3 bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </div>
                  )}

                </div>
              ))}

            </div>
          ) : (
            <p className="text-slate-500 mt-4">
              No review history yet.
            </p>
          )}

        </section>

        {/* Version History */}
        <section className="bg-white border rounded-xl shadow-sm p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Submission Versions
          </h3>

          {versions.length > 0 ? (
            <div className="mt-5 space-y-3">

              {versions.map((version) => (
                <div
                  key={version._id}
                  className="border rounded-lg p-4"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <div>
                      <p className="font-semibold text-slate-900">
                        Version {version.version}
                      </p>

                      <p className="text-sm text-slate-500">
                        Submitted by{" "}
                        {version.submittedBy?.name ||
                          "Unknown"}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500">
                      {formatDateTime(
                        version.submittedAt
                      )}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-slate-500 mt-4">
              No submission versions yet.
            </p>
          )}

        </section>

        {/* Review Actions */}
        {canReview && (
          <section className="bg-white border rounded-xl shadow-sm p-6">

            <h3 className="text-lg font-semibold text-slate-900">
              Review Action
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Add an optional approval comment or a
              required correction comment.
            </p>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              rows={5}
              placeholder="Enter your review comment..."
              className="w-full mt-4 border border-slate-300 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">

              <button
                onClick={handleRequestCorrection}
                disabled={processing}
                className="px-5 py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 disabled:opacity-50 font-semibold"
              >
                {processing
                  ? "Processing..."
                  : "Request Correction"}
              </button>

              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {processing
                  ? "Processing..."
                  : "Approve Report"}
              </button>

            </div>

          </section>
        )}

        {/* Already Reviewed */}
        {!canReview && (
          <section className="bg-slate-100 border border-slate-200 rounded-xl p-5 mb-8">

            <p className="text-sm text-slate-600">
              This report is currently{" "}
              <strong>
                {statusLabels[report?.status] ||
                  report?.status}
              </strong>
              . No review action is available.
            </p>

          </section>
        )}

      </main>
    </div>
  );
};

export default AdminReportReview;