import http from "./http";

export const getStudents = async (params = {}) => {
  const response = await http.get("/students", { params });
  return response.data;
};

export const createStudent = async (payload) => {
  const response = await http.post("/students", payload);
  return response.data;
};

export const getStudentDetail = async (studentId) => {
  const response = await http.get(`/students/${studentId}`);
  return response.data;
};

export const updateStudentStatus = async (studentId, status) => {
  const response = await http.patch(`/students/${studentId}/status`, {
    status,
  });
  return response.data;
};

export const updateStudentAcademicVerification = async (
  studentId,
  academicVerified,
) => {
  const response = await http.patch(
    `/students/${studentId}/academic-verification`,
    { academicVerified },
  );
  return response.data;
};
