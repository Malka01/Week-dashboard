import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getReportById,
} from "../../services/reportService";

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

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null); 
  const [reviews, setReviews] = useState([]); 
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // const loadReport = async () => {
    //   try {
    //     setLoading(true);
    //     setError("");

    //     const data = await getReportById(id);

    //     setReport(data);
    //   } catch (error) {
    //     console.error(
    //       "Failed to load report:",
    //       error
    //     );

    //     setError(
    //       error.response?.data?.message ||
    //         "Failed to load report."
    //     );
    //   } finally {
    //     setLoading(false);
    //   }
    // };

const loadReport = async () => {
  try {
    setLoading(true);
    setError("");

    const data = await getReportById(id);

    setReport(data.report);
    setReviews(data.reviews || []);
    setVersions(data.versions || []);
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

  const canEdit =
    report &&
    ["DRAFT", "NEEDS_CORRECTION"].includes(
      report.status
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <p className="text-slate-500">
              Loading report...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="text-red-500 mb-4">
              {error || "Report not found."}
            </div>

            <button
              onClick={() =>
                navigate("/team/reports")
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Report History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <button
              onClick={() =>
                navigate("/team/reports")
              }
              className="text-sm text-indigo-600 hover:text-indigo-700 mb-3"
            >
              ← Back to Report History
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Weekly Report
            </h1>

            <p className="text-slate-500 mt-1">
              View your submitted weekly report
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusStyles[report.status] ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              {statusLabels[report.status] ||
                report.status}
            </span>

            {canEdit && (
              <button
                onClick={() =>
                  // navigate(
                  //   `/team/report?id=${report._id}`
                  // )
                  navigate(`/team/report/${report._id}`)
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Edit Report
              </button>
            )}
          </div>
        </div>

        {/* Correction Notice */}
        {report.status === "NEEDS_CORRECTION" && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <h2 className="font-semibold text-orange-800">
              Correction Required
            </h2>

            <p className="text-sm text-orange-700 mt-1">
              Your administrator has requested changes
              to this report. Please review the comments
              and update your report.
            </p>
          </div>
        )}

        {/* Report Information */}
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">
            Report Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div>
              <p className="text-sm text-slate-500">
                Week Start
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {formatDate(report.weekStart)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Week End
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {formatDate(report.weekEnd)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Project
              </p>

              <p className="font-medium text-slate-900 mt-1">
                {report.projectId?.name || "-"}
              </p>
            </div>

          </div>
        </section>

        {/* Tasks */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-slate-900">
              Completed Tasks
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Tasks completed during this reporting period
            </p>
          </div>

          {report.tasks?.length > 0 ? (
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

                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {task.plannedPercentage}%
                      </td>

                      <td className="px-6 py-4">
                        {task.actualPercentage}%
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {task.status.replace(
                            "_",
                            " "
                          )}
                        </span>
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
              No tasks added.
            </div>
          )}
        </section>

        {/* Next Week */}
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Next Week Tasks
          </h2>

          {report.nextWeekTasks?.length > 0 ? (
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
              No next-week tasks added.
            </p>
          )}
        </section>

        {/* Blockers */}
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Blockers & Challenges
          </h2>

          {report.blockers?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {report.blockers.map(
                (blocker, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <p className="text-slate-700">
                        {blocker.description}
                      </p>

                      {blocker.isKeyIssue && (
                        <span className="inline-flex w-fit px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
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
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Achievements & Highlights
          </h2>

          {report.achievements?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {report.achievements.map(
                (achievement, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <p className="text-slate-700">
                        {achievement.description}
                      </p>

                      {achievement.isKeyAchievement && (
                        <span className="inline-flex w-fit px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
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
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Hours by Task Type
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">

            {[
              ["Development", report.hours?.development],
              ["Testing", report.hours?.testing],
              ["Meetings", report.hours?.meetings],
              ["Research", report.hours?.research],
              ["Other", report.hours?.other],
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
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Notes & Links
          </h2>

          <div className="mt-4 bg-slate-50 rounded-lg p-4">
            {report.notes ? (
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

        {/* Admin Review Comments
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Admin Review Comments
          </h2>

          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-5">
            <p className="text-sm text-slate-500">
              No review comments yet.
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Review comments will appear here when an
              administrator reviews this report.
            </p>
          </div>
        </section> */}

        
        {/* Admin Review Comments */}
        <section className="bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Admin Review Comments
          </h2>

          {reviews.length > 0 ? (
            <div className="mt-5 space-y-4">

              {reviews
                .filter(
                  (review) =>
                    review.action ===
                      "REQUESTED_CORRECTION" ||
                    review.action === "APPROVED"
                )
                .map((review) => (
                  <div
                    key={review._id}
                    className="border border-slate-200 rounded-lg p-4"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                      <div>
                        <p className="font-semibold text-slate-900">
                          {review.action ===
                          "REQUESTED_CORRECTION"
                            ? "Correction Requested"
                            : "Report Approved"}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          By{" "}
                          {review.reviewerId?.name ||
                            "Administrator"}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500">
                        {new Date(
                          review.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                    {review.comment && (
                      <div className="mt-4 rounded-lg bg-slate-50 border p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      </div>
                    )}

                  </div>
                ))}

            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-500">
                No administrator review comments yet.
              </p>
            </div>
          )}

        </section>

        {/* Submission Version History */}
      <section className="bg-white rounded-xl shadow-sm border p-6">

        <h2 className="text-lg font-semibold text-slate-900">
          Submission Version History
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Previous submitted versions of this report
        </p>

      {versions.length > 0 ? ( <div className="mt-5 space-y-4">

        {[...versions]
          .sort(
            (a, b) =>
              (b.version || 0) - (a.version || 0)
          )
          .map((version) => (
            <div
              key={version._id}
              className="border border-slate-200 rounded-lg p-4"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                <div>
                  <p className="font-semibold text-slate-900">
                    Version {version.version}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Submitted by{" "}
                    {version.submittedBy?.name ||
                      "Team Member"}
                  </p>
                </div>

                <p className="text-xs text-slate-500">
                  {version.submittedAt
                    ? new Date(
                        version.submittedAt
                      ).toLocaleString()
                    : "-"}
                </p>

              </div>

            </div>
          ))}

      </div>

      ) : ( <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4"> <p className="text-sm text-slate-500">
      No submission versions available yet. </p> </div>
      )}

      </section>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pb-8">

          <button
            onClick={() =>
              navigate("/team/reports")
            }
            className="px-5 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            ← Report History
          </button>

          {canEdit && (
            <button
              onClick={() =>
                navigate(
                  `/team/report?id=${report._id}`
                )
              }
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Edit Report
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default ReportDetail;