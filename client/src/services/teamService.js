import api from "./api";

export const getTeamMemberProfile = async (userId) => {
  const response = await api.get(
    `/admin/team/${userId}`
  );

  return response.data.data;
};

export const assignProjectToMember = async (
  userId,
  projectId
) => {
  const response = await api.post(
    `/admin/team/${userId}/projects/${projectId}`
  );

  return response.data.data;
};

export const removeProjectFromMember = async (
  userId,
  projectId
) => {
  const response = await api.delete(
    `/admin/team/${userId}/projects/${projectId}`
  );

  return response.data.data;
};