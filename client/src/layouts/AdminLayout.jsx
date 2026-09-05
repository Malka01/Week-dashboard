import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./../context/AuthContext";


import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center rounded-lg text-sm font-medium
     transition-all duration-300 ease-in-out
     ${collapsed ? "lg:justify-center lg:px-2" : "gap-3 px-4"}
     py-3
     ${
       isActive
         ? "bg-blue-600 text-white"
         : "text-slate-300 hover:bg-slate-800 hover:text-white"
     }`;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {mobileOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/50
            lg:hidden
          "
          onClick={closeMobileMenu}
        />
      )}


      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-50
          bg-slate-900 text-white
          flex flex-col
          overflow-hidden
          transition-all duration-300 ease-in-out

          /* Desktop */
          lg:block
          ${collapsed ? "lg:w-20" : "lg:w-64"}

          /* Mobile */
          w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >

        {/* Sidebar Header */}
        <div
          className={`
            h-20 flex-shrink-0
            flex items-center
            border-b border-slate-800
            transition-all duration-300

            ${
              collapsed
                ? "lg:justify-center"
                : "justify-between px-5"
            }
          `}
        >

          {/* Logo */}
          <div
            className={`
              overflow-hidden whitespace-nowrap
              transition-all duration-300

              ${
                collapsed
                  ? "lg:w-0 lg:opacity-0"
                  : "w-auto opacity-100"
              }
            `}
          >
            <h1 className="text-lg font-bold">
              Weekly Reports
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Admin Panel
            </p>
          </div>


          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="
              hidden lg:flex
              w-10 h-10
              flex-shrink-0
              items-center justify-center
              rounded-lg
              text-slate-300
              hover:bg-slate-800
              hover:text-white
              transition
            "
            title={collapsed ? "Expand menu" : "Collapse menu"}
          >
            <span
              className={`
                text-xl
                transition-transform duration-300
                ${collapsed ? "rotate-180" : ""}
              `}
            >
              <ChevronLeft size={20} color="currentColor" />
            </span>
          </button>


          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={closeMobileMenu}
            className="
              lg:hidden
              w-10 h-10
              flex items-center justify-center
              rounded-lg
              text-slate-300
              hover:bg-slate-800
              hover:text-white
            "
          >
            <X size={20} color="currentColor" />
          </button>

        </div>


        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <nav className="flex-1 p-4 space-y-2">

          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            onClick={closeMobileMenu}
            className={navLinkClass}
            title={collapsed ? "Dashboard" : undefined}
          >
            <span className="text-lg w-6 text-center flex-shrink-0">
              <LayoutDashboard size={20} color="currentColor" />
            </span>

            <span
              className={`
                whitespace-nowrap
                overflow-hidden
                transition-all duration-300

                ${
                  collapsed
                    ? "lg:w-0 lg:opacity-0"
                    : "w-auto opacity-100"
                }
              `}
            >
              Dashboard
            </span>
          </NavLink>


          {/* Reports */}
          <NavLink
            to="/admin/reports"
            onClick={closeMobileMenu}
            className={navLinkClass}
            title={collapsed ? "Reports" : undefined}
          >
            <span className="text-lg w-6 text-center flex-shrink-0">
              <FileText size={20} color="currentColor" />
            </span>

            <span
              className={`
                whitespace-nowrap
                overflow-hidden
                transition-all duration-300

                ${
                  collapsed
                    ? "lg:w-0 lg:opacity-0"
                    : "w-auto opacity-100"
                }
              `}
            >
              Reports
            </span>
          </NavLink>


          {/* Projects */}
          <NavLink
            to="/admin/projects"
            onClick={closeMobileMenu}
            className={navLinkClass}
            title={collapsed ? "Projects" : undefined}
          >
            <span className="text-lg w-6 text-center flex-shrink-0">
              <FolderKanban size={20} color="currentColor" />
            </span>

            <span
              className={`
                whitespace-nowrap
                overflow-hidden
                transition-all duration-300

                ${
                  collapsed
                    ? "lg:w-0 lg:opacity-0"
                    : "w-auto opacity-100"
                }
              `}
            >
              Projects & Categories
            </span>
          </NavLink>


          {/* Users */}
          <NavLink
            to="/admin/users"
            onClick={closeMobileMenu}
            className={navLinkClass}
            title={collapsed ? "User Management" : undefined}
          >
            <span className="text-lg w-6 text-center flex-shrink-0">
              <Users size={20} color="currentColor" />
            </span>

            <span
              className={`
                whitespace-nowrap
                overflow-hidden
                transition-all duration-300

                ${
                  collapsed
                    ? "lg:w-0 lg:opacity-0"
                    : "w-auto opacity-100"
                }
              `}
            >
              User Management
            </span>
          </NavLink>

        </nav>


        {/* =====================================================
            BOTTOM SECTION
        ====================================================== */}
        <div className="p-4 border-t border-slate-800 space-y-2">

          {/* Account Settings */}
          <NavLink
            to="/admin/account"
            onClick={closeMobileMenu}
            className={navLinkClass}
            title={collapsed ? "Account Settings" : undefined}
          >
            <span className="text-lg w-6 text-center flex-shrink-0">
              <Settings size={20} color="currentColor" />
            </span>

            <span
              className={`
                whitespace-nowrap
                overflow-hidden
                transition-all duration-300

                ${
                  collapsed
                    ? "lg:w-0 lg:opacity-0"
                    : "w-auto opacity-100"
                }
              `}
            >
              Account Settings
            </span>
          </NavLink>


          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={`
              w-full
              flex items-center
              rounded-lg
              px-4 py-3
              text-sm font-medium
              text-red-400
              hover:bg-red-500/10
              hover:text-red-300
              transition

              ${
                collapsed
                  ? "lg:justify-center"
                  : "gap-3"
              }
            `}
            title={collapsed ? "Logout" : undefined}
          >
            <span className="text-lg w-6 text-center flex-shrink-0">
              <LogOut size={20} color="currentColor" />
            </span>

            <span
              className={`
                whitespace-nowrap
                overflow-hidden
                transition-all duration-300

                ${
                  collapsed
                    ? "lg:w-0 lg:opacity-0"
                    : "w-auto opacity-100"
                }
              `}
            >
              Logout
            </span>
          </button>
          
           {/* User Info */}
          <div
            className={`
              overflow-hidden
              transition-all duration-300

              ${
                collapsed
                  ? "lg:max-h-0 lg:opacity-0"
                  : "max-h-20 opacity-100"
              }
            `}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "Administrator"}
              </p>

              <p className="text-xs text-slate-400 truncate">
                {user?.email || "Admin"}
              </p>
            </div>
          </div>
          
        </div>

      </aside>
     {/* Main Content */}
      <main
        className={`
          min-h-screen
          transition-all duration-300 ease-in-out

          /* Desktop sidebar spacing */
          ${collapsed ? "lg:ml-20" : "lg:ml-64"}
        `}
      >

        {/* ===================================================
            TOP HEADER
        ==================================================== */}
        <header
          className="bg-white/80 h-20 backdrop-blur-sm border-b border-slate-200/60 sticky flex items-center justify-between px-4 sm:px-6 lg:px-8 top-0 z-10 shadow-sm">
        {/* //     h-20
        //     bg-white
        //     border-b border-slate-200
        //     flex items-center justify-between
        //     px-4 sm:px-6 lg:px-8
        //   "
        // > */}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="
              lg:hidden
              w-10 h-10
              flex items-center justify-center
              rounded-lg
              text-slate-700
              hover:bg-slate-100
              transition
            "
          >
            <Menu size={20} color="currentColor" />
          </button>


          {/* Header Title */}
          {/* bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10 shadow-sm */}
          <div className="flex-1 ml-3 lg:ml-0">

            <h2 className="
              text-lg
              sm:text-xl
              font-semibold
              text-slate-900
            ">
              Admin Dashboard
            </h2>

            <p className="
              hidden
              sm:block
              text-sm
              text-slate-500
            ">
              Manage reports, projects and team members
            </p>

          </div>


          {/* Admin Info */}
          <div className="text-right">

            <p className="
              text-sm
              font-medium
              text-slate-900
            ">
              {user?.name || "Administrator"}
            </p>

            <p className="
              text-xs
              text-slate-500
            ">
              ADMIN
            </p>

          </div>

        </header>

     {/* Page Content */}
        <div className="
          p-4
          sm:p-6
          lg:p-8
        ">
          <Outlet />
        </div>

      </main>

    </div>
  );
};

export default AdminLayout;