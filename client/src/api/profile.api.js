import http from "./http";

export const getMyProfile = async () => {
  const response = await http.get("/profiles/me");
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await http.patch("/profiles/me", payload);
  return response.data;
};
