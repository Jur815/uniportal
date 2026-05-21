import http from "./http";

// Student
export const enrollInCourse = async ({ academicYear, semester, courseId }) => {
  const response = await http.post("/enrollments", {
    academicYear,
    semester,
    courses: [courseId],
  });
  return response.data;
};

export const getMyCourses = async (params = {}) => {
  const response = await http.get("/enrollments/my", { params });
  return response.data;
};

// Admin
export const getAllEnrollments = async (params = {}) => {
  const response = await http.get("/enrollments", { params });
  return response.data;
};

export const getEnrollmentDetail = async (enrollmentId) => {
  const response = await http.get(`/enrollments/${enrollmentId}`);
  return response.data;
};

export const updateEnrollmentStatus = async ({
  enrollmentId,
  status,
  rejectionReason,
  decisionReasonType,
}) => {
  const response = await http.patch(`/enrollments/${enrollmentId}/status`, {
    status,
    rejectionReason,
    decisionReasonType,
  });
  return response.data;
};
