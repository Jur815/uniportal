import http from "./http";

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
