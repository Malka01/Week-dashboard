import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  LogOut,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Users,
  ClipboardList,
  Eye,
  Edit,
  AlertTriangle,
  Check,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyReports } from "../../services/reportService";
import { useToast } from "../../context/ToastContext";

// ─── Helpers ──────────────────────────────────────
const getStatusMeta = (status) => {
  const map = {
    DRAFT: { label: "Draft", style: "bg-slate-100 text-slate-700", icon: FileText },
    SUBMITTED: { label: "Submitted", style: "bg-blue-100 text-blue-700", icon: Clock },
    NEEDS_CORRECTION: { label: "Needs Correction", style: "bg-orange-100 text-orange-700", icon: AlertTriangle },
    APPROVED: { label: "Approved", style: "bg-green-100 text-green-700", icon: Check },
  };
  return map[status] || map.DRAFT;
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};

const formatShortDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
};

const getCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
};

// ─── Component ────────────────────────────────────
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

  const currentWeek = getCurrentWeek();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getMyReports();
        setReports(data);
        setSummary({
          total: data.length,
          draft: data.filter((r) => r.status === "DRAFT").length,
          submitted: data.filter((r) => r.status === "SUBMITTED").length,
          needsCorrection: data.filter((r) => r.status === "NEEDS_CORRECTION").length,
          approved: data.filter((r) => r.status === "APPROVED").length,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        showError(error.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [showError]);

  const isCurrentWeekReport = (report) => {
    if (!report?.weekStart || !report?.weekEnd) return false;
    const rs = new Date(report.weekStart);
    const re = new Date(report.weekEnd);
    rs.setHours(0, 0, 0, 0);
    re.setHours(23, 59, 59, 999);
    return rs.getTime() === currentWeek.start.getTime() &&
           re.getTime() === currentWeek.end.getTime();
  };

  const currentWeekReport = reports.find(isCurrentWeekReport) || null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ─── Skeleton Loader ────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* ─── Navbar ──────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">WeeklyReport</h1>
            <p className="text-xs text-slate-500 font-medium">Team Member Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Team Member</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* ─── Welcome + CTA ──────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-700 tracking-tight">
              Welcome back, {user?.name}
            </h2>
            <p className="text-slate-500 mt-1">Manage your weekly reports and track submissions.</p>
          </div>
          <button
            onClick={() => navigate("/team/report")}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md font-medium"
          >
            <Plus className="w-5 h-5" />
            New Weekly Report
          </button>
        </div>

        {/* ─── Summary Cards ──────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            { label: "Total Reports", value: summary.total, icon: FileText, color: "text-slate-900" },
            { label: "Submitted", value: summary.submitted, icon: Clock, color: "text-blue-600" },
            { label: "Needs Correction", value: summary.needsCorrection, icon: AlertTriangle, color: "text-orange-600" },
            { label: "Approved", value: summary.approved, icon: CheckCircle, color: "text-green-600" },
            { label: "Drafts", value: summary.draft, icon: FileText, color: "text-slate-600" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{item.label}</span>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className={`text-3xl font-bold ${item.color} mt-2`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* ─── Current Week Report ────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">This Week's Report</h3>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {formatShortDate(currentWeek.start)} – {formatShortDate(currentWeek.end)}, {currentWeek.start.getFullYear()}
              </p>
            </div>
            {currentWeekReport ? (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusMeta(currentWeekReport.status).style}`}>
                {getStatusMeta(currentWeekReport.status).label}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                Not Started
              </span>
            )}
          </div>

          {currentWeekReport ? (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Project</p>
                    <p className="font-semibold text-slate-900">{currentWeekReport.projectId?.name || "Unknown Project"}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Last Updated</p>
                    <p className="font-semibold text-slate-900">{formatDate(currentWeekReport.updatedAt)}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tasks</p>
                    <p className="font-semibold text-slate-900">{currentWeekReport.tasks?.length || 0}</p>
                  </div>
                </div>
              </div>

              {currentWeekReport.status === "NEEDS_CORRECTION" && (
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-orange-800">Action Required</p>
                    <p className="text-sm text-orange-700">Your report needs correction before it can be approved.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/team/reports/${currentWeekReport._id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Report
                </button>
                {(currentWeekReport.status === "DRAFT" || currentWeekReport.status === "NEEDS_CORRECTION") && (
                  <button
                    onClick={() => navigate(`/team/report/${currentWeekReport._id}`)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Report
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-slate-50 rounded-2xl p-8 text-center">
              <div className="inline-flex p-4 bg-indigo-100 rounded-full text-indigo-600 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">No report for this week</h4>
              <p className="text-sm text-slate-500 mt-1">Get started by creating your weekly report.</p>
              <button
                onClick={() => navigate("/team/report")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Report
              </button>
            </div>
          )}
        </div>

        {/* ─── Recent Reports ────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Reports</h3>
              <p className="text-sm text-slate-500 mt-1">Your latest weekly submissions</p>
            </div>
            {reports.length > 0 && (
              <button
                onClick={() => navigate("/team/reports")}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-flex p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-slate-500">No reports found.</p>
              <button
                onClick={() => navigate("/team/report")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Your First Report
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reports.slice(0, 5).map((report) => {
                const statusMeta = getStatusMeta(report.status);
                return (
                  <div
                    key={report._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:block mt-1">
                        <div className={`p-2 rounded-lg ${statusMeta.style}`}>
                          <statusMeta.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {report.projectId?.name || "Unknown Project"}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(report.weekStart)} – {formatDate(report.weekEnd)}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>Updated {formatDate(report.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.style}`}>
                        {statusMeta.label}
                      </span>
                      <button
                        onClick={() => navigate(`/team/reports/${report._id}`)}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default TeamDashboard;