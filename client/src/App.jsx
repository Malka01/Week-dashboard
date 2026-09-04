import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import TeamDashboard from "./pages/team-member/TeamDashboard";
import WeeklyReport from "./pages/team-member/WeeklyReport";
import ReportHistory from "./pages/team-member/ReportHistory";
import ReportDetail from "./pages/team-member/ReportDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReportReview from "./pages/admin/AdminReportReview";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUsers from "./pages/admin/AdminUsers";
import TeamMemberProfile from "./pages/admin/TeamMemberProfile";


// const TeamDashboard = () => (
//   <div className="p-8">
//     <h1 className="text-3xl font-bold">
//       Team Member Dashboard
//     </h1>
//   </div>
// );

// const AdminDashboard = () => (
//   <div className="p-8">
//     <h1 className="text-3xl font-bold">
//       Admin Dashboard
//     </h1>
//   </div>
// );

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />

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
     
      <Route
        path="/admin/reports/:id/review"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <AdminReportReview />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
      path="/admin/projects"
      element={ <ProtectedRoute>
      <RoleRoute allowedRoles={["ADMIN"]}> 
        <AdminProjects /> 
        </RoleRoute> 
        </ProtectedRoute>
      }
      />
      <Route
      path="/admin/users"
      element={ <ProtectedRoute>
      <RoleRoute allowedRoles={["ADMIN"]}> 
        <AdminUsers /> 
        </RoleRoute> 
        </ProtectedRoute>
      }
      />
       <Route
        path="/admin/team/:id"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["ADMIN"]}>
              <TeamMemberProfile />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

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

      </Routes>
    </BrowserRouter>
  );
};

export default App;