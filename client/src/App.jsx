import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

// Team Member Pages
import TeamDashboard from "./pages/team-member/TeamDashboard";
import WeeklyReport from "./pages/team-member/WeeklyReport";
import ReportHistory from "./pages/team-member/ReportHistory";
import ReportDetail from "./pages/team-member/ReportDetail";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReportReview from "./pages/admin/AdminReportReview";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUsers from "./pages/admin/AdminUsers";
import TeamMemberProfile from "./pages/admin/TeamMemberProfile";
import AdminLayout from "./layouts/AdminLayout";
import AdminReports from "./pages/admin/AdminReports";
import AdminAccount from "./pages/admin/AdminAccount";


import { ToastProvider } from "./context/ToastContext";


const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

  {/* AUTHENTICATION ROUTES */}
        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Registration */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Team Member Dashboard */}
        <Route
          path="/team/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TEAM_MEMBER"]}>
                <TeamDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Create New Weekly Report */}
        <Route
          path="/team/report"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TEAM_MEMBER"]}>
                <WeeklyReport />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Edit Existing Weekly Report */}
        <Route
          path="/team/report/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TEAM_MEMBER"]}>
                <WeeklyReport />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Report History */}
        <Route
          path="/team/reports"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TEAM_MEMBER"]}>
                <ReportHistory />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Report Details */}
        <Route
          path="/team/reports/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["TEAM_MEMBER"]}>
                <ReportDetail />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

    {/* ADMIN ROUTES */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* Reports */}
          <Route
            path="reports"
            element={<AdminReports />}
          />

          {/* Report Review */}
          <Route
            path="reports/:id/review"
            element={<AdminReportReview />}
          />

          {/* Projects & Categories */}
          <Route
            path="projects"
            element={<AdminProjects />}
          />

          {/* User Management */}
          <Route
            path="users"
            element={<AdminUsers />}
          />

          {/* Team Member Profile */}
          <Route
            path="team/:id"
            element={<TeamMemberProfile />}
          />

          {/* Account Settings */}
          <Route
            path="account"
            element={<AdminAccount />}
          />
        </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;