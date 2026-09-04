import api from "./api";

export const getAllAdminReports = async (
  filters = {}
) => {
  const response = await api.get(
    "/admin/reports",
    {
      params: filters,
    }
  );

  return response.data.data;
};

export const getAdminReportById = async (
  reportId
) => {
  const response = await api.get(
    `/admin/reports/${reportId}`
  );

  return response.data.data;
};

export const requestCorrection = async (
  reportId,
  comment
) => {
  const response = await api.post(
    `/admin/reports/${reportId}/request-correction`,
    {
      comment,
    }
  );

  return response.data.data;
};

export const approveReport = async (
  reportId,
  comment = ""
) => {
  const response = await api.post(
    `/admin/reports/${reportId}/approve`,
    {
      comment,
    }
  );

  return response.data.data;
};