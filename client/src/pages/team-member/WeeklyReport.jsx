import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createReport,
  updateReport,
  submitReport,
  getReportById,
} from "../../services/reportService";

import { getProjects } from "../../services/projectService";
import { useToast } from "../../context/ToastContext";

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

/*
 * Convert API date to YYYY-MM-DD safely.
 *
 * Avoid using toISOString() for date-only
 * form values because timezone conversion can
 * move the date backward/forward.
 */
const formatDateForInput = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const dateString = String(dateValue);

  /*
   * If backend already returns:
   * 2026-09-01
   * or
   * 2026-09-01T00:00:00.000Z
   *
   * taking the first 10 characters keeps
   * the original calendar date.
   */
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.substring(0, 10);
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const WeeklyReport = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  // =========================
  // State
  // =========================

  const [projects, setProjects] = useState([]);

  const [reportId, setReportId] = useState(null);

  /*
   * loading = loading initial page/report data
   * saving = create/update/submit operation
   */
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ...initialForm,
    tasks: [{ ...emptyTask }],
    nextWeekTasks: [""],
    blockers: [{ ...emptyBlocker }],
    achievements: [{ ...emptyAchievement }],
    hours: {
      ...initialForm.hours,
    },
  });

  // =========================
  // Load Projects
  // =========================

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        const data = await getProjects();

        if (!mounted) {
          return;
        }

        /*
         * Support either:
         *
         * data = [...]
         *
         * or:
         *
         * data = { projects: [...] }
         */
        const projectList = Array.isArray(data)
          ? data
          : data?.projects || [];

        setProjects(projectList);
      } catch (error) {
        console.error(
          "Failed to load projects:",
          error
        );

        if (mounted) {
          showError(
            "Unable to load projects."
          );
        }
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, [showError]);

  // =========================
  // Load Existing Report
  // =========================

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    const loadReport = async () => {
      try {
        setLoading(true);

        const response = await getReportById(id);

        if (!mounted) {
          return;
        }

        /*
         * Your current API structure is expected
         * to return:
         *
         * {
         *   report,
         *   reviews,
         *   versions
         * }
         *
         * But this also safely supports a direct
         * report response.
         */
        const report =
          response?.report ||
          response?.data?.report ||
          response?.data ||
          response;

        if (!report || !report._id) {
          showError("Report not found.");
          navigate(`/team/reports/${id}`, {
            replace: true,
          });
          return;
        }

        /*
         * Only DRAFT and NEEDS_CORRECTION
         * can be edited.
         */
        const editableStatuses = [
          "DRAFT",
          "NEEDS_CORRECTION",
        ];

        if (
          !editableStatuses.includes(
            report.status
          )
        ) {
          // showError(
          //   "This report cannot be edited in its current status."
          // );

          /*
           * Send the user to the read-only
           * report details page.
           */
          navigate(`/team/reports/${id}`, {
            replace: true,
          });

          return;
        }

        setReportId(report._id);

        setForm({
          weekStart: formatDateForInput(
            report.weekStart
          ),

          weekEnd: formatDateForInput(
            report.weekEnd
          ),

          projectId:
            report.projectId?._id ||
            report.projectId ||
            "",

          tasks:
            Array.isArray(report.tasks) &&
            report.tasks.length > 0
              ? report.tasks.map((task) => ({
                  taskName:
                    task.taskName || "",

                  priority:
                    task.priority ||
                    "MEDIUM",

                  plannedPercentage:
                    task.plannedPercentage ??
                    0,

                  actualPercentage:
                    task.actualPercentage ??
                    0,

                  status:
                    task.status ||
                    "NOT_STARTED",

                  timePlanned:
                    task.timePlanned ??
                    0,

                  timeSpent:
                    task.timeSpent ??
                    0,

                  output:
                    task.output || "",
                }))
              : [{ ...emptyTask }],

          nextWeekTasks:
            Array.isArray(
              report.nextWeekTasks
            ) &&
            report.nextWeekTasks.length > 0
              ? report.nextWeekTasks.map(
                  (task) => task || ""
                )
              : [""],

          blockers:
            Array.isArray(report.blockers) &&
            report.blockers.length > 0
              ? report.blockers.map(
                  (blocker) => ({
                    description:
                      blocker.description ||
                      "",

                    isKeyIssue: Boolean(
                      blocker.isKeyIssue
                    ),
                  })
                )
              : [{ ...emptyBlocker }],

          achievements:
            Array.isArray(
              report.achievements
            ) &&
            report.achievements.length > 0
              ? report.achievements.map(
                  (achievement) => ({
                    description:
                      achievement.description ||
                      "",

                    isKeyAchievement:
                      Boolean(
                        achievement.isKeyAchievement
                      ),
                  })
                )
              : [{ ...emptyAchievement }],

          hours: {
            development:
              report.hours?.development ??
              0,

            testing:
              report.hours?.testing ?? 0,

            meetings:
              report.hours?.meetings ?? 0,

            research:
              report.hours?.research ?? 0,

            other:
              report.hours?.other ?? 0,
          },

          notes: report.notes || "",
        });
      } catch (error) {
        console.error(
          "Failed to load report:",
          error
        );

        if (mounted) {
          showError(
            error.response?.data?.message ||
              "Failed to load report."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      mounted = false;
    };
  }, [id, navigate, showError]);

  // =========================
  // Generic Field Change
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // Task Change
  // =========================

  const handleTaskChange = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const tasks = [...previous.tasks];

      tasks[index] = {
        ...tasks[index],
        [field]: value,
      };

      return {
        ...previous,
        tasks,
      };
    });
  };

  // =========================
  // Add Task
  // =========================

  const addTask = () => {
    setForm((previous) => ({
      ...previous,

      tasks: [
        ...previous.tasks,
        {
          ...emptyTask,
        },
      ],
    }));
  };

  // =========================
  // Remove Task
  // =========================

  const removeTask = (index) => {
    if (form.tasks.length === 1) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      tasks: previous.tasks.filter(
        (_, taskIndex) =>
          taskIndex !== index
      ),
    }));
  };

  // =========================
  // Next Week Task Change
  // =========================

  const handleNextWeekTaskChange = (
    index,
    value
  ) => {
    setForm((previous) => {
      const nextWeekTasks = [
        ...previous.nextWeekTasks,
      ];

      nextWeekTasks[index] = value;

      return {
        ...previous,
        nextWeekTasks,
      };
    });
  };

  // =========================
  // Add Next Week Task
  // =========================

  const addNextWeekTask = () => {
    setForm((previous) => ({
      ...previous,

      nextWeekTasks: [
        ...previous.nextWeekTasks,
        "",
      ],
    }));
  };

  // =========================
  // Remove Next Week Task
  // =========================

  const removeNextWeekTask = (index) => {
    if (form.nextWeekTasks.length === 1) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      nextWeekTasks:
        previous.nextWeekTasks.filter(
          (_, taskIndex) =>
            taskIndex !== index
        ),
    }));
  };

  // =========================
  // Blocker Change
  // =========================

  const handleBlockerChange = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const blockers = [
        ...previous.blockers,
      ];

      blockers[index] = {
        ...blockers[index],
        [field]: value,
      };

      return {
        ...previous,
        blockers,
      };
    });
  };

  // =========================
  // Add Blocker
  // =========================

  const addBlocker = () => {
    setForm((previous) => ({
      ...previous,

      blockers: [
        ...previous.blockers,
        {
          ...emptyBlocker,
        },
      ],
    }));
  };

  // =========================
  // Remove Blocker
  // =========================

  const removeBlocker = (index) => {
    if (form.blockers.length === 1) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      blockers: previous.blockers.filter(
        (_, blockerIndex) =>
          blockerIndex !== index
      ),
    }));
  };

  // =========================
  // Achievement Change
  // =========================

  const handleAchievementChange = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const achievements = [
        ...previous.achievements,
      ];

      achievements[index] = {
        ...achievements[index],
        [field]: value,
      };

      return {
        ...previous,
        achievements,
      };
    });
  };

  // =========================
  // Add Achievement
  // =========================

  const addAchievement = () => {
    setForm((previous) => ({
      ...previous,

      achievements: [
        ...previous.achievements,
        {
          ...emptyAchievement,
        },
      ],
    }));
  };

  // =========================
  // Remove Achievement
  // =========================

  const removeAchievement = (index) => {
    if (form.achievements.length === 1) {
      return;
    }

    setForm((previous) => ({
      ...previous,

      achievements:
        previous.achievements.filter(
          (_, achievementIndex) =>
            achievementIndex !== index
        ),
    }));
  };

  // =========================
  // Hours Change
  // =========================

  const handleHoursChange = (
    field,
    value
  ) => {
    const numericValue = Number(value);

    setForm((previous) => ({
      ...previous,

      hours: {
        ...previous.hours,

        [field]: Number.isNaN(
          numericValue
        )
          ? 0
          : Math.max(0, numericValue),
      },
    }));
  };

  // =========================
  // Draft Validation
  // =========================

  /*
   * Drafts are intentionally allowed
   * to be incomplete.
   *
   * Only validate the data structure
   * needed to save safely.
   */
  const validateDraft = () => {
    if (
      form.weekStart &&
      form.weekEnd &&
      form.weekStart > form.weekEnd
    ) {
      return "Week start date cannot be after week end date.";
    }

    return null;
  };

  // =========================
  // Submit Validation
  // =========================

  const validateSubmitForm = () => {
    if (!form.weekStart) {
      return "Please select the week start date.";
    }

    if (!form.weekEnd) {
      return "Please select the week end date.";
    }

    if (form.weekStart > form.weekEnd) {
      return "Week start date cannot be after week end date.";
    }

    if (!form.projectId) {
      return "Please select a project.";
    }

    if (
      !Array.isArray(form.tasks) ||
      form.tasks.length === 0
    ) {
      return "Please add at least one task.";
    }

    const invalidTask = form.tasks.some(
      (task) =>
        !task.taskName ||
        !task.taskName.trim()
    );

    if (invalidTask) {
      return "Every task must have a task name.";
    }

    const invalidPercentages =
      form.tasks.some(
        (task) =>
          Number(task.plannedPercentage) <
            0 ||
          Number(task.plannedPercentage) >
            100 ||
          Number(task.actualPercentage) <
            0 ||
          Number(task.actualPercentage) >
            100
      );

    if (invalidPercentages) {
      return "Task percentages must be between 0 and 100.";
    }

    return null;
  };

  // =========================
  // Prepare API Data
  // =========================

  const prepareData = () => {
    return {
      weekStart: form.weekStart,

      weekEnd: form.weekEnd,

      projectId: form.projectId,

      tasks: form.tasks.map((task) => ({
        taskName:
          task.taskName?.trim() || "",

        priority:
          task.priority || "MEDIUM",

        plannedPercentage: Math.min(
          100,
          Math.max(
            0,
            Number(
              task.plannedPercentage
            ) || 0
          )
        ),

        actualPercentage: Math.min(
          100,
          Math.max(
            0,
            Number(
              task.actualPercentage
            ) || 0
          )
        ),

        status:
          task.status || "NOT_STARTED",

        timePlanned: Math.max(
          0,
          Number(task.timePlanned) || 0
        ),

        timeSpent: Math.max(
          0,
          Number(task.timeSpent) || 0
        ),

        output:
          task.output?.trim() || "",
      })),

      nextWeekTasks:
        form.nextWeekTasks
          .map((task) =>
            typeof task === "string"
              ? task.trim()
              : ""
          )
          .filter(Boolean),

      blockers:
        form.blockers
          .map((blocker) => ({
            description:
              blocker.description?.trim() ||
              "",

            isKeyIssue: Boolean(
              blocker.isKeyIssue
            ),
          }))
          .filter(
            (blocker) =>
              blocker.description
          ),

      achievements:
        form.achievements
          .map((achievement) => ({
            description:
              achievement.description?.trim() ||
              "",

            isKeyAchievement:
              Boolean(
                achievement.isKeyAchievement
              ),
          }))
          .filter(
            (achievement) =>
              achievement.description
          ),

      hours: {
        development: Math.max(
          0,
          Number(
            form.hours.development
          ) || 0
        ),

        testing: Math.max(
          0,
          Number(form.hours.testing) || 0
        ),

        meetings: Math.max(
          0,
          Number(form.hours.meetings) || 0
        ),

        research: Math.max(
          0,
          Number(form.hours.research) || 0
        ),

        other: Math.max(
          0,
          Number(form.hours.other) || 0
        ),
      },

      notes:
        form.notes?.trim() || "",
    };
  };

  // =========================
  // Save Draft
  // =========================

  const handleSaveDraft = async () => {
    if (saving) {
      return;
    }

    const validationError =
      validateDraft();

    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);

      const data = prepareData();

      let savedReport;

      /*
       * Edit existing report.
       */
      if (reportId) {
        savedReport = await updateReport(
          reportId,
          data
        );
      }

      /*
       * Create new report.
       */
      else {
        savedReport =
          await createReport(data);

        /*
         * Support both:
         *
         * response = report
         *
         * and:
         *
         * response = { report }
         */
        const createdReport =
          savedReport?.report ||
          savedReport;

        setReportId(
          createdReport?._id || null
        );
      }

      showSuccess(
        "Draft saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save draft:",
        error
      );

      showError(
        error.response?.data?.message ||
          "Failed to save draft."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Submit Report
  // =========================

  const handleSubmit = async () => {
    if (saving) {
      return;
    }

    const validationError =
      validateSubmitForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);

      const data = prepareData();

      let currentReportId = reportId;

      /*
       * If no report exists yet,
       * create it first.
       */
      if (!currentReportId) {
        const createdResponse =
          await createReport(data);

        const createdReport =
          createdResponse?.report ||
          createdResponse;

        currentReportId =
          createdReport?._id;

        if (!currentReportId) {
          throw new Error(
            "Report was created but no report ID was returned."
          );
        }

        setReportId(currentReportId);
      }

      /*
       * If editing an existing report,
       * update it before submitting.
       */
      else {
        await updateReport(
          currentReportId,
          data
        );
      }

      /*
       * Submit the saved report.
       */
      await submitReport(
        currentReportId
      );

      showSuccess(
        "Report submitted successfully."
      );

      /*
       * Navigate after the toast has
       * time to display.
       */
      setTimeout(() => {
        navigate("/team/dashboard");
      }, 1000);
    } catch (error) {
      console.error(
        "Failed to submit report:",
        error
      );

      showError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit report."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Initial Loading
  // =========================

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-600 font-medium">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =========================
          Header
      ========================= */}

      <header className="bg-white border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="min-h-16 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Weekly Report
              </h1>

              <p className="text-xs text-slate-500">
                Weekly Report Generator
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/team/dashboard"
                )
              }
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </header>

      {/* =========================
          Main
      ========================= */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Title */}

        <div className="mb-8">

          <h2 className="text-2xl font-bold text-slate-900">

            {isEditMode
              ? "Edit Weekly Report"
              : "Create Weekly Report"}

          </h2>

          <p className="text-slate-500 mt-1">

            {isEditMode
              ? "Review and update your report before resubmitting."
              : "Complete your weekly activity report."}

          </p>

        </div>

        <div className="space-y-6">

          {/* =========================
              1. Report Information
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <h3 className="text-lg font-bold text-slate-900 mb-5">
              1. Report Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Week Start */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Week Start
                </label>

                <input
                  type="date"
                  name="weekStart"
                  value={form.weekStart}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                />

              </div>

              {/* Week End */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Week End
                </label>

                <input
                  type="date"
                  name="weekEnd"
                  value={form.weekEnd}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                />

              </div>

              {/* Project */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Project / Category
                </label>

                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >

                  <option value="">
                    Select project
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={project._id}
                        value={project._id}
                      >
                        {project.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </section>

          {/* =========================
              2. Tasks
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

              <div>

                <h3 className="text-lg font-bold">
                  2. Completed Tasks
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Record your work and progress.
                </p>

              </div>

              <button
                type="button"
                onClick={addTask}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                + Add Task
              </button>

            </div>

            <div className="space-y-6">

              {form.tasks.map(
                (task, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-5"
                  >

                    <div className="flex justify-between mb-4">

                      <h4 className="font-semibold">
                        Task {index + 1}
                      </h4>

                      {form.tasks.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeTask(
                              index
                            )
                          }
                          disabled={saving}
                          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                      {/* Task Name */}

                      <div className="lg:col-span-2">

                        <label className="block text-sm font-medium mb-2">
                          Task Name
                        </label>

                        <input
                          type="text"
                          value={
                            task.taskName
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "taskName",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="e.g. Implement login API"
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        />

                      </div>

                      {/* Priority */}

                      <div>

                        <label className="block text-sm font-medium mb-2">
                          Priority
                        </label>

                        <select
                          value={
                            task.priority
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "priority",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        >

                          <option value="LOW">
                            Low
                          </option>

                          <option value="MEDIUM">
                            Medium
                          </option>

                          <option value="HIGH">
                            High
                          </option>

                          <option value="CRITICAL">
                            Critical
                          </option>

                        </select>

                      </div>

                      {/* Status */}

                      <div>

                        <label className="block text-sm font-medium mb-2">
                          Status
                        </label>

                        <select
                          value={
                            task.status
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "status",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        >

                          <option value="NOT_STARTED">
                            Not Started
                          </option>

                          <option value="IN_PROGRESS">
                            In Progress
                          </option>

                          <option value="COMPLETED">
                            Completed
                          </option>

                          <option value="BLOCKED">
                            Blocked
                          </option>

                        </select>

                      </div>

                      {/* Planned */}

                      <div>

                        <label className="block text-sm font-medium mb-2">
                          Planned %
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            task.plannedPercentage
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "plannedPercentage",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        />

                      </div>

                      {/* Actual */}

                      <div>

                        <label className="block text-sm font-medium mb-2">
                          Actual %
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            task.actualPercentage
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "actualPercentage",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        />

                      </div>

                      {/* Time Planned */}

                      <div>

                        <label className="block text-sm font-medium mb-2">
                          Time Planned
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={
                            task.timePlanned
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "timePlanned",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        />

                      </div>

                      {/* Time Spent */}

                      <div>

                        <label className="block text-sm font-medium mb-2">
                          Time Spent
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={
                            task.timeSpent
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "timeSpent",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        />

                      </div>

                      {/* Output */}

                      <div className="md:col-span-2 lg:col-span-4">

                        <label className="block text-sm font-medium mb-2">
                          Output / Deliverable
                        </label>

                        <textarea
                          rows="2"
                          value={
                            task.output
                          }
                          onChange={(e) =>
                            handleTaskChange(
                              index,
                              "output",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="Describe the output or deliverable..."
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                        />

                      </div>

                    </div>
                  </div>
                )
              )}

            </div>

          </section>

          {/* =========================
              3. Next Week
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">

              <h3 className="text-lg font-bold">
                3. Next-Week Tasks
              </h3>

              <button
                type="button"
                onClick={addNextWeekTask}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                + Add Task
              </button>

            </div>

            <div className="space-y-3">

              {form.nextWeekTasks.map(
                (task, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3"
                  >

                    <input
                      type="text"
                      value={task}
                      onChange={(e) =>
                        handleNextWeekTaskChange(
                          index,
                          e.target.value
                        )
                      }
                      disabled={saving}
                      placeholder="Next week's planned task..."
                      className="flex-1 border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />

                    {form.nextWeekTasks.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeNextWeekTask(
                            index
                          )
                        }
                        disabled={saving}
                        className="px-3 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                )
              )}

            </div>

          </section>

          {/* =========================
              4. Blockers
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">

              <h3 className="text-lg font-bold">
                4. Blockers / Challenges
              </h3>

              <button
                type="button"
                onClick={addBlocker}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                + Add Blocker
              </button>

            </div>

            <div className="space-y-4">

              {form.blockers.map(
                (blocker, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-3 items-start"
                  >

                    <textarea
                      rows="2"
                      value={
                        blocker.description
                      }
                      onChange={(e) =>
                        handleBlockerChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      disabled={saving}
                      placeholder="Describe a blocker or challenge..."
                      className="flex-1 w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />

                    <label className="flex items-center gap-2 text-sm whitespace-nowrap pt-3">

                      <input
                        type="checkbox"
                        checked={
                          blocker.isKeyIssue
                        }
                        onChange={(e) =>
                          handleBlockerChange(
                            index,
                            "isKeyIssue",
                            e.target.checked
                          )
                        }
                        disabled={saving}
                      />

                      Key Issue

                    </label>

                    {form.blockers.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeBlocker(
                            index
                          )
                        }
                        disabled={saving}
                        className="text-red-600 text-sm pt-3 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                )
              )}

            </div>

          </section>

          {/* =========================
              5. Achievements
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">

              <h3 className="text-lg font-bold">
                5. Achievements / Highlights
              </h3>

              <button
                type="button"
                onClick={addAchievement}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                + Add Achievement
              </button>

            </div>

            <div className="space-y-4">

              {form.achievements.map(
                (achievement, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-3 items-start"
                  >

                    <textarea
                      rows="2"
                      value={
                        achievement.description
                      }
                      onChange={(e) =>
                        handleAchievementChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      disabled={saving}
                      placeholder="Describe an achievement..."
                      className="flex-1 w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />

                    <label className="flex items-center gap-2 text-sm whitespace-nowrap pt-3">

                      <input
                        type="checkbox"
                        checked={
                          achievement.isKeyAchievement
                        }
                        onChange={(e) =>
                          handleAchievementChange(
                            index,
                            "isKeyAchievement",
                            e.target.checked
                          )
                        }
                        disabled={saving}
                      />

                      Key Achievement

                    </label>

                    {form.achievements.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeAchievement(
                            index
                          )
                        }
                        disabled={saving}
                        className="text-red-600 text-sm pt-3 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                )
              )}

            </div>

          </section>

          {/* =========================
              6. Hours
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <h3 className="text-lg font-bold mb-5">
              6. Hours by Task Type
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

              {[
                [
                  "development",
                  "Development",
                ],
                [
                  "testing",
                  "Testing",
                ],
                [
                  "meetings",
                  "Meetings",
                ],
                [
                  "research",
                  "Research",
                ],
                ["other", "Other"],
              ].map(
                ([field, label]) => (
                  <div key={field}>

                    <label className="block text-sm font-medium mb-2">
                      {label}
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={
                        form.hours[field]
                      }
                      onChange={(e) =>
                        handleHoursChange(
                          field,
                          e.target.value
                        )
                      }
                      disabled={saving}
                      className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                    />

                  </div>
                )
              )}

            </div>

          </section>

          {/* =========================
              7. Notes
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <h3 className="text-lg font-bold mb-5">
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

          {/* =========================
              Actions
          ========================= */}

          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">

              {/* Cancel */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/team/dashboard"
                  )
                }
                disabled={saving}
                className="px-5 py-3 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Save Draft */}

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveDraft}
                className="px-5 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 disabled:opacity-50"
              >

                {saving
                  ? "Saving..."
                  : "Save Draft"}

              </button>

              {/* Submit */}

              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >

                {saving
                  ? "Submitting..."
                  : isEditMode
                  ? "Resubmit Report"
                  : "Submit Report"}

              </button>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
};

export default WeeklyReport;