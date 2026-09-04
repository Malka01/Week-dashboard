import api from "./api";

export const getDashboardAnalytics = async (
  filters = {}
) => {
  const response = await api.get(
    "/admin/analytics/dashboard",
    {
      params: filters,
    }
  );

  return response.data.data;
};
