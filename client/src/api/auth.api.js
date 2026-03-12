import http from "./http";

export const loginUser = async (payload) => {
  const response = await http.post("/auth/login", payload);
  return response.data;
};

export const getMe = async () => {
  const response = await http.get("/auth/me");
  return response.data;
};
