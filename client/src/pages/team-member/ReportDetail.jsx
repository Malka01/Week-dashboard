import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  ClipboardList,
  FileText,
  MessageSquare,
  History,
  Eye,
  AlertTriangle,
  Check,
  Users,
  BookOpen,
  Link,
  Code,
  Beaker,
  Coffee,
  Star
} from "lucide-react";

import { getReportById } from "../../services/reportService";

// ─── Status helpers ──────────────────────────────
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

const statusIcons = {
  DRAFT: FileText,
  SUBMITTED: Clock,
  NEEDS_CORRECTION: AlertTriangle,
  APPROVED: Check,
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getReportById(id);
        setReport(data.report);
        setReviews(data.reviews || []);
        setVersions(data.versions || []);
      } catch (error) {
        console.error("Failed to load report:", error);
        setError(error.response?.data?.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Admin review comments (only correction requests and approvals)
  const adminReviews = useMemo(() => {
    return reviews.filter(
      (review) =>
        review.action === "REQUESTED_CORRECTION" || review.action === "APPROVED"
    );
  }, [reviews]);

  const canEdit = report && ["DRAFT", "NEEDS_CORRECTION"].includes(report.status);
  const StatusIcon = report ? statusIcons[report.status] : FileText;

  // ─── Loading state ──────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center animate-pulse">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
            <p className="mt-4 text-slate-500">Loading report…</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────
  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || "Report not found."}</p>
            <button
              onClick={() => navigate("/team/reports")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Report History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ─── Header ────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/team/reports")}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Report History
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              Weekly Report
            </h1>
            <p className="text-slate-500 mt-1 text-sm">View your submitted weekly report</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                statusStyles[report.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusLabels[report.status] || report.status}
            </span>
            {canEdit && (
              <button
                onClick={() => navigate(`/team/report/${report._id}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Report
              </button>
            )}
          </div>
        </div>

        {/* ─── Correction Notice ────────────────────── */}
        {report.status === "NEEDS_CORRECTION" && (
          <div className="flex items-start gap-4 bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-orange-800">Correction Required</h2>
              <p className="text-sm text-orange-700 mt-1">
                Your administrator has requested changes to this report. Please review the comments
                and update your report.
              </p>
            </div>
          </div>
        )}

        {/* ─── Report Information ────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Report Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Week Start</p>
                <p className="font-medium text-slate-900 mt-1">{formatDate(report.weekStart)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Week End</p>
                <p className="font-medium text-slate-900 mt-1">{formatDate(report.weekEnd)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Project</p>
                <p className="font-medium text-slate-900 mt-1">{report.projectId?.name || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Tasks ──────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
          <div className="p-6 border-b border-slate-200 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Completed Tasks</h2>
              <p className="text-sm text-slate-500 mt-0.5">Tasks completed during this reporting period</p>
            </div>
          </div>
          {report.tasks?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Task</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Priority</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Planned</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actual</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{task.taskName}</p>
                        {task.output && <p className="text-xs text-slate-500 mt-1">{task.output}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === "HIGH" ? "bg-red-100 text-red-700" :
                          task.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{task.plannedPercentage}%</td>
                      <td className="px-6 py-4 text-sm font-medium">{task.actualPercentage}%</td>
                      <td className="px-6 py-4 text-sm">{task.status.replace("_", " ")}</td>
                      <td className="px-6 py-4 text-sm">{task.timeSpent}h / {task.timePlanned}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No tasks added.</p>
            </div>
          )}
        </section>

        {/* ─── Next Week Tasks ────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Next Week Tasks
          </h2>
          {report.nextWeekTasks?.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {report.nextWeekTasks.map((task, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-700">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 mt-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              No next-week tasks added.
            </p>
          )}
        </section>

        {/* ─── Blockers ────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Blockers & Challenges
          </h2>
          {report.blockers?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {report.blockers.map((blocker, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="text-slate-700">{blocker.description}</p>
                    {blocker.isKeyIssue && (
                      <span className="inline-flex items-center gap-1 w-fit px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Key Issue
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 mt-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No blockers reported.
            </p>
          )}
        </section>

        {/* ─── Achievements ────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Achievements & Highlights
          </h2>
          {report.achievements?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {report.achievements.map((achievement, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="text-slate-700">{achievement.description}</p>
                    {achievement.isKeyAchievement && (
                      <span className="inline-flex items-center gap-1 w-fit px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        <Check className="w-3 h-3" />
                        Key Achievement
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 mt-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              No achievements reported.
            </p>
          )}
        </section>

        {/* ─── Hours ────────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Hours by Task Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
            {[
              ["Development", report.hours?.development, Code],
              ["Testing", report.hours?.testing, Beaker],
              ["Meetings", report.hours?.meetings, Users],
              ["Research", report.hours?.research, BookOpen],
              ["Other", report.hours?.other, Coffee],
            ].map(([label, value, Icon]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4 text-center hover:bg-slate-100 transition-colors">
                <Icon className="w-5 h-5 text-indigo-600 mx-auto" />
                <p className="text-xs text-slate-500 mt-2">{label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{value || 0}h</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Notes ────────────────────────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-600" />
            Notes & Links
          </h2>
          <div className="mt-4 bg-slate-50 rounded-xl p-4">
            {report.notes ? (
              <p className="text-slate-700 whitespace-pre-wrap">{report.notes}</p>
            ) : (
              <p className="text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                No notes added.
              </p>
            )}
          </div>
        </section>

        {/* ─── Admin Review Comments ──────────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Admin Review Comments
          </h2>
          {adminReviews.length > 0 ? (
            <div className="mt-5 space-y-4">
              {adminReviews.map((review) => (
                <div key={review._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        review.action === "REQUESTED_CORRECTION" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                      }`}>
                        {review.action === "REQUESTED_CORRECTION" ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {review.action === "REQUESTED_CORRECTION" ? "Correction Requested" : "Report Approved"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">By {review.reviewerId?.name || "Administrator"}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{formatDateTime(review.createdAt)}</p>
                  </div>
                  {review.comment && (
                    <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-center text-sm text-slate-500">
              <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              No administrator review comments yet.
            </div>
          )}
        </section>

        {/* ─── Submission Version History ──────────────── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex items-start gap-2">
              <History className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Submission Version History</h2>
                <p className="text-sm text-slate-500 mt-1">Previous submitted versions of this report</p>
              </div>
            </div>
            <span className="w-fit px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              {versions.length} Version{versions.length !== 1 ? "s" : ""}
            </span>
          </div>

          {versions.length > 0 ? (
            <div className="mt-6 space-y-4">
              {[...versions]
                .sort((a, b) => (b.version || 0) - (a.version || 0))
                .map((version, index) => {
                  const isCurrent = index === 0;
                  return (
                    <div
                      key={version._id}
                      className={`border rounded-xl p-5 ${
                        isCurrent ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200"
                      } hover:shadow-sm transition-all`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            v{version.version}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-slate-900">Version {version.version}</h4>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                  <Check className="w-3 h-3" />
                                  Current Version
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              Submitted by{" "}
                              <span className="font-medium text-slate-700">
                                {version.submittedBy?.name || "Team Member"}
                              </span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{formatDateTime(version.submittedAt)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVersion(version)}
                          className="inline-flex items-center gap-2 w-full md:w-auto px-4 py-2 border border-indigo-300 text-indigo-700 rounded-xl hover:bg-indigo-50 text-sm font-semibold transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          View Version
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-5 text-center text-sm text-slate-500">
              <History className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              No submission versions available yet.
            </div>
          )}
        </section>

        {/* ─── Bottom Actions ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pb-8">
          <button
            onClick={() => navigate("/team/reports")}
            className="inline-flex items-center gap-2 px-5 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Report History
          </button>
          {canEdit && (
            <button
              onClick={() => navigate(`/team/report/${report._id}`)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Report
            </button>
          )}
        </div>
      </div>

      {/* ─── Version Viewer Modal ────────────────────── */}
      {selectedVersion && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      Report Version {selectedVersion.version}
                    </h2>
                    <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      Historical Version
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Submitted by {selectedVersion.submittedBy?.name || "Unknown"} on{" "}
                    {formatDateTime(selectedVersion.submittedAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVersion(null)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 text-xl flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
              {selectedVersion.content ? (
                <>
                  {/* Tasks */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <ClipboardList className="w-5 h-5 text-indigo-600" />
                      Tasks
                    </h3>
                    {selectedVersion.content.tasks?.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="min-w-full">
                          <thead className="bg-slate-50/80">
                            <tr>
                              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Task</th>
                              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Priority</th>
                              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Planned</th>
                              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Actual</th>
                              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Status</th>
                              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {selectedVersion.content.tasks.map((task, idx) => (
                              <tr key={task._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3">
                                  <p className="font-medium text-slate-900">{task.taskName}</p>
                                  {task.output && <p className="text-xs text-slate-500 mt-1">{task.output}</p>}
                                </td>
                                <td className="px-4 py-3 text-sm">{task.priority}</td>
                                <td className="px-4 py-3 text-sm">{task.plannedPercentage}%</td>
                                <td className="px-4 py-3 text-sm">{task.actualPercentage}%</td>
                                <td className="px-4 py-3 text-sm">{task.status?.replaceAll("_", " ")}</td>
                                <td className="px-4 py-3 text-sm">{task.timeSpent || 0}h / {task.timePlanned || 0}h</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No tasks recorded.</p>
                    )}
                  </div>

                  {/* Next Week */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      Next Week Tasks
                    </h3>
                    {selectedVersion.content.nextWeekTasks?.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedVersion.content.nextWeekTasks.map((task, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-slate-700">
                            <span className="text-indigo-600 font-bold">•</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No next-week tasks.</p>
                    )}
                  </div>

                  {/* Blockers */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Blockers
                    </h3>
                    {selectedVersion.content.blockers?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedVersion.content.blockers.map((blocker, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                              <p className="text-sm text-slate-700">{blocker.description}</p>
                              {blocker.isKeyIssue && (
                                <span className="inline-flex items-center gap-1 w-fit px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                  <AlertCircle className="w-3 h-3" />
                                  Key Issue
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No blockers.</p>
                    )}
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Achievements
                    </h3>
                    {selectedVersion.content.achievements?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedVersion.content.achievements.map((ach, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                              <p className="text-sm text-slate-700">{ach.description}</p>
                              {ach.isKeyAchievement && (
                                <span className="inline-flex items-center gap-1 w-fit px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                  <Check className="w-3 h-3" />
                                  Key Achievement
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No achievements.</p>
                    )}
                  </div>

                  {/* Hours */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      Hours by Task Type
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        ["Development", selectedVersion.content.hours?.development, Code],
                        ["Testing", selectedVersion.content.hours?.testing, Beaker],
                        ["Meetings", selectedVersion.content.hours?.meetings, Users],
                        ["Research", selectedVersion.content.hours?.research, BookOpen],
                        ["Other", selectedVersion.content.hours?.other, Coffee],
                      ].map(([label, value, Icon]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                          <Icon className="w-4 h-4 text-indigo-600 mx-auto" />
                          <p className="text-xs text-slate-500 mt-1">{label}</p>
                          <p className="font-bold text-slate-900 mt-1">{value || 0}h</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                      <Link className="w-5 h-5 text-indigo-600" />
                      Notes & Links
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4">
                      {selectedVersion.content.notes ? (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedVersion.content.notes}</p>
                      ) : (
                        <p className="text-sm text-slate-500">No notes.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 rounded-xl p-6 text-center text-sm text-slate-500">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Historical content is not available for this version.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;