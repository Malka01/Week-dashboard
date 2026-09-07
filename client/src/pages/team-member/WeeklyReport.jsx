import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calendar,
  Clock,
  ClipboardList,
  AlertCircle,
  Star,
  FileText,
  BookOpen,
  Code,
  Users,
  Coffee,
  Link,
  XCircle,
} from "lucide-react";

import {
  createReport,
  updateReport,
  submitReport,
  getReportById,
} from "../../services/reportService";

import { getProjects } from "../../services/projectService";
import { useToast } from "../../context/ToastContext";

// ─── Helpers ──────────────────────────────────────
const emptyTask = {
  taskName: "",
  priority: "MEDIUM",
  plannedPercentage: 0,
  actualPercentage: 0,
  status: "NOT_STARTED",
  timePlanned: 0,
  timeSpent: 0,
  output: "",
};

const emptyBlocker = {
  description: "",
  isKeyIssue: false,
};

const emptyAchievement = {
  description: "",
  isKeyAchievement: false,
};

const initialForm = {
  weekStart: "",
  weekEnd: "",
  projectId: "",
  tasks: [{ ...emptyTask }],
  nextWeekTasks: [""],
  blockers: [{ ...emptyBlocker }],
  achievements: [{ ...emptyAchievement }],
  hours: {
    development: 0,
    testing: 0,
    meetings: 0,
    research: 0,
    other: 0,
  },
  notes: "",
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  const dateString = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.substring(0, 10);
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── Component ────────────────────────────────────
const WeeklyReport = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // ── State ──────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ...initialForm,
    tasks: [{ ...emptyTask }],
    nextWeekTasks: [""],
    blockers: [{ ...emptyBlocker }],
    achievements: [{ ...emptyAchievement }],
    hours: { ...initialForm.hours },
  });

  // ── Load Projects ──────────────────────────────
  useEffect(() => {
    let mounted = true;
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        if (!mounted) return;
        const projectList = Array.isArray(data) ? data : data?.projects || [];
        setProjects(projectList);
      } catch (error) {
        console.error("Failed to load projects:", error);
        if (mounted) showError("Unable to load projects.");
      }
    };
    loadProjects();
    return () => { mounted = false; };
  }, [showError]);

  // ── Load Existing Report ────────────────────────
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const loadReport = async () => {
      try {
        setLoading(true);
        const response = await getReportById(id);
        if (!mounted) return;
        const report = response?.report || response?.data?.report || response?.data || response;
        if (!report?._id) {
          showError("Report not found.");
          navigate(`/team/reports/${id}`, { replace: true });
          return;
        }
        if (!["DRAFT", "NEEDS_CORRECTION"].includes(report.status)) {
          navigate(`/team/reports/${id}`, { replace: true });
          return;
        }
        setReportId(report._id);
        setForm({
          weekStart: formatDateForInput(report.weekStart),
          weekEnd: formatDateForInput(report.weekEnd),
          projectId: report.projectId?._id || report.projectId || "",
          tasks: Array.isArray(report.tasks) && report.tasks.length > 0
            ? report.tasks.map((task) => ({ ...task }))
            : [{ ...emptyTask }],
          nextWeekTasks: Array.isArray(report.nextWeekTasks) && report.nextWeekTasks.length > 0
            ? report.nextWeekTasks.map((t) => t || "")
            : [""],
          blockers: Array.isArray(report.blockers) && report.blockers.length > 0
            ? report.blockers.map((b) => ({ ...b }))
            : [{ ...emptyBlocker }],
          achievements: Array.isArray(report.achievements) && report.achievements.length > 0
            ? report.achievements.map((a) => ({ ...a }))
            : [{ ...emptyAchievement }],
          hours: {
            development: report.hours?.development ?? 0,
            testing: report.hours?.testing ?? 0,
            meetings: report.hours?.meetings ?? 0,
            research: report.hours?.research ?? 0,
            other: report.hours?.other ?? 0,
          },
          notes: report.notes || "",
        });
      } catch (error) {
        console.error("Failed to load report:", error);
        if (mounted) showError(error.response?.data?.message || "Failed to load report.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadReport();
    return () => { mounted = false; };
  }, [id, navigate, showError]);

  // ── Handlers ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Tasks
  const handleTaskChange = (index, field, value) => {
    setForm((prev) => {
      const tasks = [...prev.tasks];
      tasks[index] = { ...tasks[index], [field]: value };
      return { ...prev, tasks };
    });
  };
  const addTask = () => setForm((prev) => ({ ...prev, tasks: [...prev.tasks, { ...emptyTask }] }));
  const removeTask = (index) => {
    if (form.tasks.length === 1) return;
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  // Next Week Tasks
  const handleNextWeekTaskChange = (index, value) => {
    setForm((prev) => {
      const nwt = [...prev.nextWeekTasks];
      nwt[index] = value;
      return { ...prev, nextWeekTasks: nwt };
    });
  };
  const addNextWeekTask = () => setForm((prev) => ({ ...prev, nextWeekTasks: [...prev.nextWeekTasks, ""] }));
  const removeNextWeekTask = (index) => {
    if (form.nextWeekTasks.length === 1) return;
    setForm((prev) => ({
      ...prev,
      nextWeekTasks: prev.nextWeekTasks.filter((_, i) => i !== index),
    }));
  };

  // Blockers
  const handleBlockerChange = (index, field, value) => {
    setForm((prev) => {
      const blockers = [...prev.blockers];
      blockers[index] = { ...blockers[index], [field]: value };
      return { ...prev, blockers };
    });
  };
  const addBlocker = () => setForm((prev) => ({ ...prev, blockers: [...prev.blockers, { ...emptyBlocker }] }));
  const removeBlocker = (index) => {
    if (form.blockers.length === 1) return;
    setForm((prev) => ({
      ...prev,
      blockers: prev.blockers.filter((_, i) => i !== index),
    }));
  };

  // Achievements
  const handleAchievementChange = (index, field, value) => {
    setForm((prev) => {
      const achievements = [...prev.achievements];
      achievements[index] = { ...achievements[index], [field]: value };
      return { ...prev, achievements };
    });
  };
  const addAchievement = () => setForm((prev) => ({ ...prev, achievements: [...prev.achievements, { ...emptyAchievement }] }));
  const removeAchievement = (index) => {
    if (form.achievements.length === 1) return;
    setForm((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  // Hours
  const handleHoursChange = (field, value) => {
    const numericValue = Number(value);
    setForm((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [field]: Number.isNaN(numericValue) ? 0 : Math.max(0, numericValue),
      },
    }));
  };

  // ── Validation ──────────────────────────────────
  const validateDraft = () => {
    if (form.weekStart && form.weekEnd && form.weekStart > form.weekEnd) {
      return "Week start date cannot be after week end date.";
    }
    return null;
  };

  const validateSubmitForm = () => {
    if (!form.weekStart) return "Please select the week start date.";
    if (!form.weekEnd) return "Please select the week end date.";
    if (form.weekStart > form.weekEnd) return "Week start date cannot be after week end date.";
    if (!form.projectId) return "Please select a project.";
    if (!Array.isArray(form.tasks) || form.tasks.length === 0) return "Please add at least one task.";
    const invalidTask = form.tasks.some((task) => !task.taskName || !task.taskName.trim());
    if (invalidTask) return "Every task must have a task name.";
    const invalidPercentages = form.tasks.some(
      (task) => Number(task.plannedPercentage) < 0 || Number(task.plannedPercentage) > 100 ||
                 Number(task.actualPercentage) < 0 || Number(task.actualPercentage) > 100
    );
    if (invalidPercentages) return "Task percentages must be between 0 and 100.";
    return null;
  };

  // ── API Calls ──────────────────────────────────
  const prepareData = () => ({
    weekStart: form.weekStart,
    weekEnd: form.weekEnd,
    projectId: form.projectId,
    tasks: form.tasks.map((task) => ({
      taskName: task.taskName?.trim() || "",
      priority: task.priority || "MEDIUM",
      plannedPercentage: Math.min(100, Math.max(0, Number(task.plannedPercentage) || 0)),
      actualPercentage: Math.min(100, Math.max(0, Number(task.actualPercentage) || 0)),
      status: task.status || "NOT_STARTED",
      timePlanned: Math.max(0, Number(task.timePlanned) || 0),
      timeSpent: Math.max(0, Number(task.timeSpent) || 0),
      output: task.output?.trim() || "",
    })),
    nextWeekTasks: form.nextWeekTasks.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean),
    blockers: form.blockers.map((b) => ({ description: b.description?.trim() || "", isKeyIssue: Boolean(b.isKeyIssue) }))
                 .filter((b) => b.description),
    achievements: form.achievements.map((a) => ({ description: a.description?.trim() || "", isKeyAchievement: Boolean(a.isKeyAchievement) }))
                    .filter((a) => a.description),
    hours: {
      development: Math.max(0, Number(form.hours.development) || 0),
      testing: Math.max(0, Number(form.hours.testing) || 0),
      meetings: Math.max(0, Number(form.hours.meetings) || 0),
      research: Math.max(0, Number(form.hours.research) || 0),
      other: Math.max(0, Number(form.hours.other) || 0),
    },
    notes: form.notes?.trim() || "",
  });

  const handleSaveDraft = async () => {
    if (saving) return;
    const validationError = validateDraft();
    if (validationError) { showError(validationError); return; }
    try {
      setSaving(true);
      const data = prepareData();
      let savedReport;
      if (reportId) {
        savedReport = await updateReport(reportId, data);
      } else {
        savedReport = await createReport(data);
        const createdReport = savedReport?.report || savedReport;
        setReportId(createdReport?._id || null);
      }
      showSuccess("Draft saved successfully.");
    } catch (error) {
      console.error("Failed to save draft:", error);
      showError(error.response?.data?.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (saving) return;
    const validationError = validateSubmitForm();
    if (validationError) { showError(validationError); return; }
    try {
      setSaving(true);
      const data = prepareData();
      let currentReportId = reportId;
      if (!currentReportId) {
        const createdResponse = await createReport(data);
        const createdReport = createdResponse?.report || createdResponse;
        currentReportId = createdReport?._id;
        if (!currentReportId) throw new Error("Report was created but no report ID was returned.");
        setReportId(currentReportId);
      } else {
        await updateReport(currentReportId, data);
      }
      await submitReport(currentReportId);
      showSuccess("Report submitted successfully.");
      setTimeout(() => navigate("/team/dashboard"), 1000);
    } catch (error) {
      console.error("Failed to submit report:", error);
      showError(error.response?.data?.message || error.message || "Failed to submit report.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading ────────────────────────────────────
  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100">

      {/* ─── Header ──────────────────────────────── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-16 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Weekly Report</h1>
                <p className="text-xs text-slate-500">Weekly Report Generator</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/team/dashboard")}
              disabled={saving}
              className="inline-flex items-center gap-2 w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main ────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            {isEditMode ? "Edit Weekly Report" : "Create Weekly Report"}
          </h2>
          <p className="text-slate-500 mt-1">
            {isEditMode
              ? "Review and update your report before resubmitting."
              : "Complete your weekly activity report."}
          </p>
        </div>

        <div className="space-y-6">

          {/* ─── 1. Report Information ──────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
              <Calendar className="w-5 h-5 text-indigo-600" />
              1. Report Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Week Start</label>
                <input
                  type="date"
                  name="weekStart"
                  value={form.weekStart}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Week End</label>
                <input
                  type="date"
                  name="weekEnd"
                  value={form.weekEnd}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Project / Category</label>
                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ─── 2. Tasks ────────────────────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-bold">2. Completed Tasks</h3>
                  <p className="text-sm text-slate-500 mt-1">Record your work and progress.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addTask}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            <div className="space-y-6">
              {form.tasks.map((task, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-5">
                  <div className="flex justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {index + 1}
                      </span>
                      Task
                    </h4>
                    {form.tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        disabled={saving}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium mb-2">Task Name</label>
                      <input
                        type="text"
                        value={task.taskName}
                        onChange={(e) => handleTaskChange(index, "taskName", e.target.value)}
                        disabled={saving}
                        placeholder="e.g. Implement login API"
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={task.priority}
                        onChange={(e) => handleTaskChange(index, "priority", e.target.value)}
                        disabled={saving}
                        className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskChange(index, "status", e.target.value)}
                        disabled={saving}
                        className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Planned %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.plannedPercentage}
                        onChange={(e) => handleTaskChange(index, "plannedPercentage", e.target.value)}
                        disabled={saving}
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Actual %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.actualPercentage}
                        onChange={(e) => handleTaskChange(index, "actualPercentage", e.target.value)}
                        disabled={saving}
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time Planned</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={task.timePlanned}
                        onChange={(e) => handleTaskChange(index, "timePlanned", e.target.value)}
                        disabled={saving}
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time Spent</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={task.timeSpent}
                        onChange={(e) => handleTaskChange(index, "timeSpent", e.target.value)}
                        disabled={saving}
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-4">
                      <label className="block text-sm font-medium mb-2">Output / Deliverable</label>
                      <textarea
                        rows="2"
                        value={task.output}
                        onChange={(e) => handleTaskChange(index, "output", e.target.value)}
                        disabled={saving}
                        placeholder="Describe the output or deliverable..."
                        className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 3. Next Week ────────────────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                3. Next-Week Tasks
              </h3>
              <button
                type="button"
                onClick={addNextWeekTask}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            <div className="space-y-3">
              {form.nextWeekTasks.map((task, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleNextWeekTaskChange(index, e.target.value)}
                    disabled={saving}
                    placeholder="Next week's planned task..."
                    className="flex-1 w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                  {form.nextWeekTasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNextWeekTask(index)}
                      disabled={saving}
                      className="px-3 text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ─── 4. Blockers ────────────────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                4. Blockers / Challenges
              </h3>
              <button
                type="button"
                onClick={addBlocker}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Blocker
              </button>
            </div>

            <div className="space-y-4">
              {form.blockers.map((blocker, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-start border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <textarea
                    rows="2"
                    value={blocker.description}
                    onChange={(e) => handleBlockerChange(index, "description", e.target.value)}
                    disabled={saving}
                    placeholder="Describe a blocker or challenge..."
                    className="flex-1 w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                  <div className="flex items-center gap-4 md:pt-0 pt-2">
                    <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={blocker.isKeyIssue}
                        onChange={(e) => handleBlockerChange(index, "isKeyIssue", e.target.checked)}
                        disabled={saving}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Key Issue
                    </label>
                    {form.blockers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBlocker(index)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 5. Achievements ────────────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                5. Achievements / Highlights
              </h3>
              <button
                type="button"
                onClick={addAchievement}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Achievement
              </button>
            </div>

            <div className="space-y-4">
              {form.achievements.map((achievement, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-start border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <textarea
                    rows="2"
                    value={achievement.description}
                    onChange={(e) => handleAchievementChange(index, "description", e.target.value)}
                    disabled={saving}
                    placeholder="Describe an achievement..."
                    className="flex-1 w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                  <div className="flex items-center gap-4 md:pt-0 pt-2">
                    <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={achievement.isKeyAchievement}
                        onChange={(e) => handleAchievementChange(index, "isKeyAchievement", e.target.checked)}
                        disabled={saving}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Key Achievement
                    </label>
                    {form.achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 6. Hours ────────────────────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-indigo-600" />
              6. Hours by Task Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                ["development", "Development", Code],
                ["testing", "Testing", Code],
                ["meetings", "Meetings", Users],
                ["research", "Research", BookOpen],
                ["other", "Other", Coffee],
              ].map(([field, label, Icon]) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Icon className="w-4 h-4 text-indigo-500" />
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hours[field]}
                    onChange={(e) => handleHoursChange(field, e.target.value)}
                    disabled={saving}
                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ─── 7. Notes ────────────────────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-5">
              <Link className="w-5 h-5 text-indigo-600" />
              7. Notes / Links
            </h3>
            <textarea
              name="notes"
              rows="5"
              value={form.notes}
              onChange={handleChange}
              disabled={saving}
              placeholder="Add optional notes, links, references, or additional information..."
              className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            />
          </section>

          {/* ─── Actions ────────────────────────────── */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/team/dashboard")}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveDraft}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {saving ? "Submitting..." : isEditMode ? "Resubmit Report" : "Submit Report"}
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default WeeklyReport;