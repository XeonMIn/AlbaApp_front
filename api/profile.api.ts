import API from "./axios";

export const updateProfile = (userId: number, data: any) => {
    return API.put(`/member/${userId}`, data);
};
