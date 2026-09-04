import api from "./api";

export const createReport = async (reportData) => {
  const response = await api.post("/reports", reportData);

  return response.data.data;
};

export const getMyReports = async () => {
  const response = await api.get("/reports/my-reports");

  return response.data.data;
};

export const getReportById = async (reportId) => {
  const response = await api.get(`/reports/${reportId}`);

  return response.data.data;
};

export const updateReport = async (
  reportId,
  reportData
) => {
  const response = await api.put(
    `/reports/${reportId}`,
    reportData
  );

  return response.data.data;
};

export const submitReport = async (reportId) => {
  const response = await api.post(
    `/reports/${reportId}/submit`
  );

  return response.data.data;
};