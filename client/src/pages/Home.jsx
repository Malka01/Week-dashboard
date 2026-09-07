import { Link } from "react-router-dom";
import { BarChart3, Bot, Check, CircleCheck, FileText } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Weekly Reports",
    description:
      "Create, edit, and submit structured weekly reports with tasks, achievements, blockers, and planned work.",
  },
  {
    icon: BarChart3,
    title: "Team Dashboard",
    description:
      "Get a clear overview of team progress, report status, workload, projects, and important activities.",
  },
  {
    icon: CircleCheck,
    title: "Review & Approval",
    description:
      "Managers can review submitted reports, request corrections, and approve completed reports.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Ask questions about team reports and quickly identify blockers, achievements, workload issues, and trends.",
  },
];

const benefits = [
  "Centralized weekly reporting",
  "Clear report approval workflow",
  "Team performance insights",
  "Role-based access control",
  "AI-powered report analysis",
  "Responsive dashboard",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= NAVBAR ================= */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-lg font-bold text-white">
              WR
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight">
                Weekly Report
              </h1>
              <p className="text-xs text-slate-500">
                Team Dashboard
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              About
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>
        <section
          id="home"
          className="relative overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-10">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              {/* Hero content */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Smart Weekly Reporting
                </div>

                <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Manage weekly reports.
                  <span className="mt-2 block text-slate-500">
                    Track team progress.
                  </span>
                </h2>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  A centralized workspace for creating weekly reports,
                  reviewing team progress, tracking blockers, and
                  understanding project performance.
                </p>

                {/* CTA */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/register"
                    className="rounded-xl bg-sky-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
                  >
                    Get Started
                  </Link>

                  <Link
                    to="/login"
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Sign In
                  </Link>
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Built for team members and managers.
                </p>
              </div>

              {/* Dashboard preview */}
              <div className="relative">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  {/* Fake browser header */}
                  <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />

                    <div className="ml-3 h-7 flex-1 rounded-md bg-slate-100" />
                  </div>

                  <div className="mb-5">
                    <p className="text-xs font-medium text-slate-500">
                      TEAM DASHBOARD
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      Weekly Overview
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Reports
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        24
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Submitted
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        18
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Approved
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        15
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Blockers
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        3
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-5 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Weekly Compliance
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Team report submission rate
                        </p>
                      </div>

                      <span className="text-lg font-bold">
                        75%
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-600"
                        style={{ width: "75%" }}
                      />
                    </div>
                  </div>

                  {/* Recent reports */}
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold">
                      Recent Reports
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                        <span className="text-sm">
                          Development Team
                        </span>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Approved
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                        <span className="text-sm">
                          QA Team
                        </span>

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Submitted
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                        <span className="text-sm">
                          Product Team
                        </span>

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Correction
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative background */}
                <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-slate-200 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section
          id="features"
          className="border-y border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Features
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything your team needs
              </h2>

              <p className="mt-4 text-slate-600">
                Simplify weekly reporting and give managers the
                information they need to make better decisions.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section
          id="about"
          className="bg-slate-50"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Why use Weekly Report?
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Turn weekly updates into useful team insights.
                </h2>

                <p className="mt-5 leading-7 text-slate-600">
                  Instead of managing weekly updates across different
                  documents and messages, keep reports, reviews,
                  projects, blockers, and team insights in one
                  centralized system.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <h3 className="text-lg font-bold">
                  Built for modern teams
                </h3>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>

                      <span className="text-sm text-slate-700">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="bg-sky-600">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to simplify your weekly reporting?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-white-60">
              Create reports, track progress, review team performance,
              and make better decisions from one dashboard.
            </p>

            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
              >
                Access Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
          <div>
            <p className="font-semibold">
              Weekly Report Dashboard
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Manage reports. Track progress. Improve visibility.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 Weekly Report Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}