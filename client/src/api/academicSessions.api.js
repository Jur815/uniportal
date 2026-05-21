import http from "./http";

export const getAcademicSessions = async () => {
  const response = await http.get("/academic-sessions");
  return response.data;
};

export const getActiveAcademicSession = async () => {
  const response = await http.get("/academic-sessions/active");
  return response.data;
};

export const createAcademicSession = async (payload) => {
  const response = await http.post("/academic-sessions", payload);
  return response.data;
};

export const updateAcademicSession = async (sessionId, payload) => {
  const response = await http.patch(`/academic-sessions/${sessionId}`, payload);
  return response.data;
};
