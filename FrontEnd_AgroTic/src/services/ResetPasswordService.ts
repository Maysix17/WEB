import apiClient from "../lib/axios/axios";

export const resetPassword = async (token: string, newPassword: string, repetPassword: string) => {
  const response = await apiClient.patch(
    `/auth/reset-password?token=${token}`,
    {
      newPassword,
      repetPassword,
    }
  );
  return response.data;
};