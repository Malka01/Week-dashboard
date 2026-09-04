import api from "./api";

export const getUsers = async (filters = {}) => {
    const response = await api.get("/admin/users", {
        params: filters,
    });

    return response.data.data;
};

export const createUser = async (userData) => {
    const response = await api.post(
        "/admin/users",
        userData
    );

    return response.data.data;
};

export const updateUser = async (
    userId,
    userData
) => {
    const response = await api.put(
        `/admin/users/${userId}`,
        userData
    );

    return response.data.data;
};

export const deactivateUser = async (userId) => {
    const response = await api.patch(
        `/admin/users/${userId}/deactivate`
    );

    return response.data.data;
};
