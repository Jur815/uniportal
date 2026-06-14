import http from "./http";

export const getExaminationRecords = async (params = {}) => {
  const response = await http.get("/examinations/records", { params });
  return response.data;
};

export const getMyReleasedResults = async () => {
  const response = await http.get("/examinations/my-results");
  return response.data;
};

export const updateResultMarks = async (recordId, payload) => {
  const response = await http.patch(
    `/examinations/records/${recordId}/marks`,
    payload,
  );
  return response.data;
};

export const transitionResultWorkflow = async (
  recordId,
  action,
  note = "",
  academicStanding,
) => {
  const response = await http.post(
    `/examinations/records/${recordId}/workflow`,
    { action, note, academicStanding },
  );
  return response.data;
};

export const getExaminationReports = async (params = {}) => {
  const response = await http.get("/examinations/reports", { params });
  return response.data;
};

export const getGradingPolicy = async () => {
  const response = await http.get("/examinations/policy");
  return response.data;
};

export const updateGradingPolicy = async (payload) => {
  const response = await http.put("/examinations/policy", payload);
  return response.data;
};
