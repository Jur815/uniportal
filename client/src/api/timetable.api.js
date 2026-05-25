import http from "./http";

export const getMyTimetable = async () => {
  const response = await http.get("/timetable/my");
  return response.data;
};

export const getTimetableEntries = async (params = {}) => {
  const response = await http.get("/timetable", { params });
  return response.data;
};

export const createTimetableEntry = async (payload) => {
  const response = await http.post("/timetable", payload);
  return response.data;
};

export const updateTimetableEntry = async (entryId, payload) => {
  const response = await http.patch(`/timetable/${entryId}`, payload);
  return response.data;
};

export const deactivateTimetableEntry = async (entryId) => {
  const response = await http.delete(`/timetable/${entryId}`);
  return response.data;
};
