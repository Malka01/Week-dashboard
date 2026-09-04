const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const reportRoutes = require("./routes/report.routes");
const projectRoutes = require("./routes/project.routes");
const adminReportRoutes = require("./routes/adminReport.routes");
const adminUserRoutes = require("./routes/adminUser.routes");
const teamRoutes = require("./routes/team.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Weekly Report API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use( "/api/admin/team", teamRoutes );
app.use( "/api/admin/analytics", analyticsRoutes );


module.exports = app;