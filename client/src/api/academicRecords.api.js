import http from "./http";

export const getAcademicRecords = async (params = {}) => {
  const response = await http.get("/academic-records", { params });
  return response.data;
};

export const getMyAcademicRecords = async () => {
  const response = await http.get("/academic-records/my");
  return response.data;
};

export const generateAcademicRecord = async (enrollmentId) => {
  const response = await http.post("/academic-records/from-enrollment", {
    enrollmentId,
  });
  return response.data;
};

export const updateAcademicRecordGrades = async (recordId, payload) => {
  const response = await http.patch(`/academic-records/${recordId}/grades`, payload);
  return response.data;
};
