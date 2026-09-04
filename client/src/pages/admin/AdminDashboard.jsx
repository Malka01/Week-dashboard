/* eslint-disable react-hooks/static-components */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllAdminReports } from "../../services/adminReportService";
import { getProjects } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getDashboardAnalytics } from "../../services/analyticsService";


// Status helpers
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

// Status colour map for pie chart
const statusColours = {
  DRAFT: "#94a3b8",
  SUBMITTED: "#3b82f6",
  NEEDS_CORRECTION: "#f97316",
  APPROVED: "#22c55e",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    projectId: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  const [search, setSearch] = useState("");

  // --- Data fetching ---
  // const loadAnalytics = async () => {
  //   try {
  //     setAnalyticsLoading(true);
  //     setAnalyticsError("");
  //     const data = await getDashboardAnalytics();
  //     setAnalytics(data);
  //   } catch (error) {
  //     console.error("Failed to load analytics:", error);
  //     setAnalyticsError("Could not load analytics. Please refresh.");
  //   } finally {
  //     setAnalyticsLoading(false);
  //   }
  // };
  const loadAnalytics = async () => {
  try {
    setAnalyticsLoading(true);
    setAnalyticsError("");

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) =>
          value !== "" &&
          value !== null &&
          value !== undefined
      )
    );

    const data =
      await getDashboardAnalytics(
        cleanFilters
      );

    setAnalytics(data);
  } catch (error) {
    console.error(
      "Failed to load analytics:",
      error
    );

    setAnalyticsError(
      error.response?.data?.message ||
        "Failed to load analytics."
    );
  } finally {
    setAnalyticsLoading(false);
  }
};

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllAdminReports(filters);
      setReports(data);
    } catch (error) {
      console.error("Failed to load admin reports:", error);
      setError(error.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnalytics();
    loadReports();
    loadProjects();
  }, [filters]);

  // --- Filter handlers ---
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    loadReports();
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: "",
      projectId: "",
      userId: "",
      startDate: "",
      endDate: "",
    };
    setFilters(emptyFilters);
    // small delay to allow state update before refetch
    setTimeout(() => loadReports(), 0);
  };

  // --- Derived data ---
  const uniqueMembers = useMemo(() => {
    const members = new Map();
    reports.forEach((report) => {
      if (report.userId) {
        members.set(report.userId._id, report.userId);
      }
    });
    return Array.from(members.values());
  }, [reports]);

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase();
    return reports.filter((report) => {
      const reportUserId = report.userId?._id || report.userId;
      const reportProjectId = report.projectId?._id || report.projectId;
      const memberName = report.userId?.name?.toLowerCase() || "";
      const memberEmail = report.userId?.email?.toLowerCase() || "";
      const projectName = report.projectId?.name?.toLowerCase() || "";

      const matchesSearch = !query ||
        memberName.includes(query) ||
        memberEmail.includes(query) ||
        projectName.includes(query);
      const matchesUser = !filters.userId || reportUserId === filters.userId;
      const matchesProject = !filters.projectId || reportProjectId === filters.projectId;
      const matchesStatus = !filters.status || report.status === filters.status;

      return matchesSearch && matchesUser && matchesProject && matchesStatus;
    });
  }, [filters, reports, search]);

  const summary = useMemo(() => ({
    total: reports.length,
    submitted: reports.filter((r) => r.status === "SUBMITTED").length,
    needsCorrection: reports.filter((r) => r.status === "NEEDS_CORRECTION").length,
    approved: reports.filter((r) => r.status === "APPROVED").length,
    draft: reports.filter((r) => r.status === "DRAFT").length,
  }), [reports]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // --- Helper: loading skeleton for chart ---
  const ChartSkeleton = () => (
    <div className="h-80 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
      <div className="text-slate-400 text-sm">Loading chart…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* ---------- Navbar ---------- */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              WeeklyReport
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Admin / Manager Portal
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* ---------- Header ---------- */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Admin Dashboard
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Monitor and review weekly team reports.
            </p>
          </div>
          <button
            onClick={loadReports}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm font-medium text-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ---------- Summary Cards ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Reports", value: summary.total, colour: "text-slate-900" },
            { label: "Submitted", value: summary.submitted, colour: "text-blue-600" },
            { label: "Needs Correction", value: summary.needsCorrection, colour: "text-orange-600" },
            { label: "Approved", value: summary.approved, colour: "text-green-600" },
            { label: "Draft", value: summary.draft, colour: "text-slate-600" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-slate-300"
            >
              <span className="text-sm font-medium text-slate-500">{item.label}</span>
              <span className={`text-3xl font-bold ${item.colour}`}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* ---------- Filters + Search ---------- */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Report Filters</h3>
              <p className="text-sm text-slate-500">Filter by member, project, status, or date range.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search member or project…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
              <button
                onClick={applyFilters}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-all shadow-sm hover:shadow-md text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm"
            >
              <option value="">All Members</option>
              {uniqueMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>

            <select
              name="projectId"
              value={filters.projectId}
              onChange={handleFilterChange}
              className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="APPROVED">Approved</option>
            </select>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm"
            />

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
        </section>

        {/* ---------- Analytics Section ---------- */}
        {analyticsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
            ⚠️ {analyticsError}
          </div>
        )}

        {analyticsLoading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        ) : analytics && (
          <>
            {/* Row 1: Status Distribution + Reports by Member */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
                <h2 className="text-lg font-semibold text-slate-900">Report Status</h2>
                <p className="text-sm text-slate-500 mt-1">Distribution of report statuses</p>
                <div className="h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusDistribution.map((item) => ({
                          name: statusLabels[item._id] || item._id,
                          value: item.count,
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColours[entry._id] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
                <h2 className="text-lg font-semibold text-slate-900">Reports by Team Member</h2>
                <p className="text-sm text-slate-500 mt-1">Reporting activity by team member</p>
                <div className="h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.reportsByMember}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="submitted" name="Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="correction" name="Correction" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Task Completion Trend */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Task Completion Trend</h2>
              <p className="text-sm text-slate-500 mt-1">Planned vs actual task completion</p>
              <div className="h-80 mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.taskCompletionTrend.map((item) => ({
                      week: new Date(item._id).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      }),
                      planned: Math.round(item.planned),
                      actual: Math.round(item.actual),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planned" name="Planned %" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="actual" name="Actual %" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 3: Workload by Project + Time by Task Type */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
                <h2 className="text-lg font-semibold text-slate-900">Workload by Project</h2>
                <p className="text-sm text-slate-500 mt-1">Report count and time spent by project</p>
                <div className="h-80 mt-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.workloadByProject} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalTimeSpent" name="Hours" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
                <h2 className="text-lg font-semibold text-slate-900">Time by Task Type</h2>
                <p className="text-sm text-slate-500 mt-1">Total reported hours</p>
                <div className="h-80 mt-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { type: "Development", hours: analytics.timeByTaskType?.development || 0 },
                        { type: "Testing", hours: analytics.timeByTaskType?.testing || 0 },
                        { type: "Meetings", hours: analytics.timeByTaskType?.meetings || 0 },
                        { type: "Research", hours: analytics.timeByTaskType?.research || 0 },
                        { type: "Other", hours: analytics.timeByTaskType?.other || 0 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" name="Hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 4: Open Blockers */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
              <h2 className="text-lg font-semibold text-slate-900">Open Blockers</h2>
              <p className="text-sm text-slate-500 mt-1">Recent blockers reported by team members</p>
              <div className="mt-5 space-y-3">
                {analytics.reportsWithBlockers?.length > 0 ? (
                  analytics.reportsWithBlockers.map((report) => (
                    <div key={report._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col md:flex-row md:justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">
                            {report.blockers?.description}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {report.userId?.name || "Unknown member"} · {report.projectId?.name || "No project"}
                          </p>
                        </div>
                        {report.blockers?.isKeyIssue && (
                          <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            Key Issue
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 text-center text-sm text-slate-500">
                    No blockers reported.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {analyticsError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-600">
              {analyticsError}
            </p>
          </div>
        )}

        {/* ---------- Reports Table ---------- */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Team Reports</h3>
              <p className="text-sm text-slate-500 mt-1">
                {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500 animate-pulse">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]" />
              <p className="mt-4">Loading reports…</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={loadReports} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
                Try Again
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No reports found.</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Team Member</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Project</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Week</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Updated</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredReports.map((report) => (
                      <tr key={report._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{report.userId?.name || "Unknown"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{report.projectId?.name || "-"}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {formatDate(report.weekStart)} – {formatDate(report.weekEnd)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[report.status] || "bg-slate-100 text-slate-700"}`}>
                            {statusLabels[report.status] || report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(report.updatedAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/reports/${report._id}/review`)}
                            className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md font-medium"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-200">
                {filteredReports.map((report) => (
                  <div key={report._id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{report.userId?.name || "Unknown"}</p>
                        <p className="text-sm text-slate-500">{report.projectId?.name || "-"}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[report.status] || "bg-slate-100 text-slate-700"}`}>
                        {statusLabels[report.status] || report.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      Week: <span className="text-slate-700">{formatDate(report.weekStart)} – {formatDate(report.weekEnd)}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/reports/${report._id}/review`)}
                      className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      Review Report
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;