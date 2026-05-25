import http from "./http";

export const getMyExamClearances = async () => {
  const response = await http.get("/exam-clearance/my");
  return response.data;
};

export const getExamClearances = async (params = {}) => {
  const response = await http.get("/exam-clearance", { params });
  return response.data;
};

export const createExamClearance = async (payload) => {
  const response = await http.post("/exam-clearance", payload);
  return response.data;
};

export const updateExamClearance = async (clearanceId, payload) => {
  const response = await http.patch(`/exam-clearance/${clearanceId}`, payload);
  return response.data;
};
