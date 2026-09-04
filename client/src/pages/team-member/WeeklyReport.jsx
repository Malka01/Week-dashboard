import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createReport,
  updateReport,
  submitReport,
} from "../../services/reportService";

import { getProjects } from "../../services/projectService";

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

const WeeklyReport = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [reportId, setReportId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    weekStart: "",
    weekEnd: "",
    projectId: "",

    tasks: [
      {
        ...emptyTask,
      },
    ],

    nextWeekTasks: [""],

    blockers: [
      {
        description: "",
        isKeyIssue: false,
      },
    ],

    achievements: [
      {
        description: "",
        isKeyAchievement: false,
      },
    ],

    hours: {
      development: 0,
      testing: 0,
      meetings: 0,
      research: 0,
      other: 0,
    },

    notes: "",
  });

  /*
   * Load available projects.
   */
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error(
          "Failed to load projects:",
          error
        );

        setError("Unable to load projects.");
      }
    };

    loadProjects();
  }, []);

  /*
   * Generic field change.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Task field change.
   */
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

  /*
   * Add task.
   */
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

  /*
   * Remove task.
   */
  const removeTask = (index) => {
    if (form.tasks.length === 1) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      tasks: previous.tasks.filter(
        (_, taskIndex) => taskIndex !== index
      ),
    }));
  };

  /*
   * Next week task.
   */
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

  const addNextWeekTask = () => {
    setForm((previous) => ({
      ...previous,
      nextWeekTasks: [
        ...previous.nextWeekTasks,
        "",
      ],
    }));
  };

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

  /*
   * Blocker changes.
   */
  const handleBlockerChange = (
    index,
    field,
    value
  ) => {
    setForm((previous) => {
      const blockers = [...previous.blockers];

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

  const addBlocker = () => {
    setForm((previous) => ({
      ...previous,
      blockers: [
        ...previous.blockers,
        {
          description: "",
          isKeyIssue: false,
        },
      ],
    }));
  };

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

  /*
   * Achievement changes.
   */
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

  const addAchievement = () => {
    setForm((previous) => ({
      ...previous,
      achievements: [
        ...previous.achievements,
        {
          description: "",
          isKeyAchievement: false,
        },
      ],
    }));
  };

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

  /*
   * Hours.
   */
  const handleHoursChange = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      hours: {
        ...previous.hours,
        [field]: Number(value),
      },
    }));
  };

  /*
   * Validation.
   */
  const validateForm = () => {
    if (!form.weekStart) {
      return "Please select the week start date.";
    }

    if (!form.weekEnd) {
      return "Please select the week end date.";
    }

    if (!form.projectId) {
      return "Please select a project.";
    }

    if (form.tasks.length === 0) {
      return "Please add at least one task.";
    }

    const invalidTask = form.tasks.some(
      (task) => !task.taskName.trim()
    );

    if (invalidTask) {
      return "Every task must have a task name.";
    }

    return null;
  };

  /*
   * Prepare API data.
   */
  const prepareData = () => {
    return {
      weekStart: form.weekStart,
      weekEnd: form.weekEnd,
      projectId: form.projectId,

      tasks: form.tasks.map((task) => ({
        ...task,
        plannedPercentage: Number(
          task.plannedPercentage
        ),
        actualPercentage: Number(
          task.actualPercentage
        ),
        timePlanned: Number(
          task.timePlanned
        ),
        timeSpent: Number(
          task.timeSpent
        ),
      })),

      nextWeekTasks:
        form.nextWeekTasks.filter(
          (task) => task.trim()
        ),

      blockers:
        form.blockers.filter(
          (blocker) =>
            blocker.description.trim()
        ),

      achievements:
        form.achievements.filter(
          (achievement) =>
            achievement.description.trim()
        ),

      hours: form.hours,

      notes: form.notes,
    };
  };

  /*
   * Save draft.
   */
  const handleSaveDraft = async () => {
    setError("");
    setMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const data = prepareData();

      let savedReport;

      if (reportId) {
        savedReport = await updateReport(
          reportId,
          data
        );
      } else {
        savedReport =
          await createReport(data);

        setReportId(savedReport._id);
      }

      setMessage(
        "Draft saved successfully."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save draft."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Submit report.
   */
  const handleSubmit = async () => {
    setError("");
    setMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const data = prepareData();

      let currentReportId = reportId;

      /*
       * If report has not been saved yet,
       * create it first.
       */
      if (!currentReportId) {
        const createdReport =
          await createReport(data);

        currentReportId =
          createdReport._id;

        setReportId(currentReportId);
      } else {
        await updateReport(
          currentReportId,
          data
        );
      }

      /*
       * Submit the report.
       */
      await submitReport(
        currentReportId
      );

      setMessage(
        "Report submitted successfully."
      );

      setTimeout(() => {
        navigate("/team/dashboard");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-16 flex items-center justify-between">

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                WeeklyReport
              </h1>

              <p className="text-xs text-slate-500">
                Weekly Report
              </p>
            </div>

            <button
              onClick={() =>
                navigate(
                  "/team/dashboard"
                )
              }
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Weekly Report
          </h2>

          <p className="text-slate-500 mt-1">
            Complete your weekly activity report.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="space-y-6">

          {/* Basic Information */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <h3 className="text-lg font-bold text-slate-900 mb-5">
              1. Report Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Week Start
                </label>

                <input
                  type="date"
                  name="weekStart"
                  value={form.weekStart}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Week End
                </label>

                <input
                  type="date"
                  name="weekEnd"
                  value={form.weekEnd}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project / Category
                </label>

                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg p-3 bg-white"
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

          {/* Tasks */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex items-center justify-between mb-5">

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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
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
                          className="text-sm text-red-600"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

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
                          placeholder="e.g. Implement login API"
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

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
                          className="w-full border border-slate-300 rounded-lg p-3 bg-white"
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
                          className="w-full border border-slate-300 rounded-lg p-3 bg-white"
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
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

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
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

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
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

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
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

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
                          placeholder="Describe the output or deliverable..."
                          className="w-full border border-slate-300 rounded-lg p-3"
                        />
                      </div>

                    </div>
                  </div>
                )
              )}

            </div>
          </section>

          {/* Next Week */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-5">

              <h3 className="text-lg font-bold">
                3. Next-Week Tasks
              </h3>

              <button
                type="button"
                onClick={addNextWeekTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
              >
                + Add Task
              </button>

            </div>

            <div className="space-y-3">

              {form.nextWeekTasks.map(
                (task, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
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
                      placeholder="Next week's planned task..."
                      className="flex-1 border border-slate-300 rounded-lg p-3"
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
                        className="px-3 text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )
              )}

            </div>
          </section>

          {/* Blockers */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-5">

              <h3 className="text-lg font-bold">
                4. Blockers / Challenges
              </h3>

              <button
                type="button"
                onClick={addBlocker}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
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
                      placeholder="Describe a blocker or challenge..."
                      className="flex-1 w-full border border-slate-300 rounded-lg p-3"
                    />

                    <label className="flex items-center gap-2 text-sm whitespace-nowrap">
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
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                )
              )}

            </div>
          </section>

          {/* Achievements */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-5">

              <h3 className="text-lg font-bold">
                5. Achievements / Highlights
              </h3>

              <button
                type="button"
                onClick={addAchievement}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
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
                      placeholder="Describe an achievement..."
                      className="flex-1 w-full border border-slate-300 rounded-lg p-3"
                    />

                    <label className="flex items-center gap-2 text-sm whitespace-nowrap">
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
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                )
              )}

            </div>
          </section>

          {/* Hours */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <h3 className="text-lg font-bold mb-5">
              6. Hours by Task Type
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

              {[
                ["development", "Development"],
                ["testing", "Testing"],
                ["meetings", "Meetings"],
                ["research", "Research"],
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
                      className="w-full border border-slate-300 rounded-lg p-3"
                    />
                  </div>
                )
              )}

            </div>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <h3 className="text-lg font-bold mb-5">
              7. Notes / Links
            </h3>

            <textarea
              name="notes"
              rows="5"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add optional notes, links, references, or additional information..."
              className="w-full border border-slate-300 rounded-lg p-3"
            />

          </section>

          {/* Actions */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex flex-col sm:flex-row justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/team/dashboard"
                  )
                }
                className="px-5 py-3 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSaveDraft}
                className="px-5 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : "Save Draft"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading
                  ? "Submitting..."
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