import http from "./http";

export const getMyProfile = async () => {
  const response = await http.get("/student-profile/me");
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await http.patch("/student-profile/me", payload);
  return response.data;
};
